import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { CHAT_REQUEST_STATUS } from "@/lib/db-types";
import {
  createMessage,
  createNotification,
  getChatContext,
  touchChat
} from "@/lib/data";
import { messageSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const parsed = messageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    const chat = await getChatContext(parsed.data.chatId);

    if (!chat) {
      return NextResponse.json({ error: "Chat not found." }, { status: 404 });
    }

    const isParticipant =
      chat.senderId === session.user.id || chat.receiverId === session.user.id;

    if (!isParticipant || chat.status !== CHAT_REQUEST_STATUS.ACCEPTED) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const receiverId =
      chat.senderId === session.user.id ? chat.receiverId : chat.senderId;

    const message = await createMessage({
      chatId: parsed.data.chatId,
      senderId: session.user.id,
      content: parsed.data.content
    });

    await touchChat(parsed.data.chatId);

    await createNotification({
      userId: receiverId,
      type: "NEW_MESSAGE",
      title: "New message",
      body: `${session.user.name ?? "A player"} sent you a new message.`,
      link: `/chats/${parsed.data.chatId}`,
      metadata: {
        chatId: parsed.data.chatId
      }
    });

    return NextResponse.json(message, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to send message." }, { status: 500 });
  }
}
