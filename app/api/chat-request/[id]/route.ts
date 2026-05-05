import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { CHAT_REQUEST_STATUS } from "@/lib/db-types";
import {
  createNotification,
  ensureChatForRequest,
  getChatRequestById,
  updateChatRequestStatus
} from "@/lib/data";
import { chatRequestUpdateSchema } from "@/lib/validations";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const parsed = chatRequestUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    const { id } = await params;

    const existingRequest = await getChatRequestById(id);

    if (!existingRequest) {
      return NextResponse.json({ error: "Request not found." }, { status: 404 });
    }

    if (existingRequest.receiverId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    if (existingRequest.status !== CHAT_REQUEST_STATUS.PENDING) {
      return NextResponse.json({ error: "This request has already been handled." }, { status: 400 });
    }

    await updateChatRequestStatus(id, parsed.data.status);

    if (parsed.data.status === CHAT_REQUEST_STATUS.ACCEPTED) {
      await ensureChatForRequest(id);

      await createNotification({
        userId: existingRequest.senderId,
        type: "REQUEST_ACCEPTED",
        title: "Request accepted",
        body: `${session.user.name ?? "A player"} accepted your ${existingRequest.post?.sport ?? ""} chat request.`,
        link: "/chats",
        metadata: {
          requestId: id,
          postId: existingRequest.postId
        }
      });
    }

    return NextResponse.json({
      ...existingRequest,
      status: parsed.data.status,
      updatedAt: new Date()
    });
  } catch {
    return NextResponse.json({ error: "Unable to update chat request." }, { status: 500 });
  }
}
