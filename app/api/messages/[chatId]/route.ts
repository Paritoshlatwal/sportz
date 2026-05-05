import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { CHAT_REQUEST_STATUS } from "@/lib/db-types";
import { getChatContext, getMessagesForChat } from "@/lib/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { chatId } = await params;

    const chat = await getChatContext(chatId);

    if (!chat) {
      return NextResponse.json({ error: "Chat not found." }, { status: 404 });
    }

    const isParticipant =
      chat.senderId === session.user.id || chat.receiverId === session.user.id;

    if (!isParticipant || chat.status !== CHAT_REQUEST_STATUS.ACCEPTED) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const messages = await getMessagesForChat(chatId);

    return NextResponse.json(messages);
  } catch {
    return NextResponse.json({ error: "Unable to fetch messages." }, { status: 500 });
  }
}
