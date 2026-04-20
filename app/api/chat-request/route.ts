import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import {
  createChatRequest,
  createNotification,
  findChatRequestBySenderAndPost,
  getPostById,
  isDuplicateKeyError
} from "@/lib/data";
import { chatRequestSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const parsed = chatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    const post = await getPostById(parsed.data.postId);

    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    if (post.userId === session.user.id) {
      return NextResponse.json({ error: "You cannot request chat on your own post." }, { status: 400 });
    }

    const existingRequest = await findChatRequestBySenderAndPost(session.user.id, post.id);

    if (existingRequest) {
      return NextResponse.json({ error: "You already requested a chat for this post." }, { status: 409 });
    }

    const chatRequest = await createChatRequest({
      senderId: session.user.id,
      receiverId: post.userId,
      postId: post.id
    });

    await createNotification({
      userId: post.userId,
      type: "CHAT_REQUEST",
      title: "New chat request",
      body: `${session.user.name ?? "A player"} wants to connect for your ${post.sport} post.`,
      link: "/requests",
      metadata: {
        postId: post.id,
        requestId: chatRequest.id
      }
    });

    return NextResponse.json(chatRequest, { status: 201 });
  } catch (error: unknown) {
    if (isDuplicateKeyError(error)) {
      return NextResponse.json({ error: "You already requested a chat for this post." }, { status: 409 });
    }

    return NextResponse.json({ error: "Unable to send chat request." }, { status: 500 });
  }
}
