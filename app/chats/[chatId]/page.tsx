import { notFound, redirect } from "next/navigation";

import { ChatThread } from "@/components/chats/chat-thread";
import { getAuthSession } from "@/lib/auth";
import { CHAT_REQUEST_STATUS } from "@/lib/db-types";
import { getChatByIdWithDetails } from "@/lib/data";

export default async function ChatPage({
  params
}: {
  params: Promise<{ chatId: string }>;
}) {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login?callbackUrl=/chats");
  }

  const { chatId } = await params;

  const chat = await getChatByIdWithDetails(chatId);

  if (!chat || chat.request.status !== CHAT_REQUEST_STATUS.ACCEPTED) {
    notFound();
  }

  const isParticipant =
    chat.request.senderId === session.user.id || chat.request.receiverId === session.user.id;

  if (!isParticipant) {
    notFound();
  }

  const otherUser =
    chat.request.senderId === session.user.id ? chat.request.receiver : chat.request.sender;

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <ChatThread
        chatId={chat.id}
        currentUserId={session.user.id}
        title={`Chat with ${otherUser?.name ?? "player"}`}
        subtitle={`${chat.request.post?.sport ?? ""} at ${chat.request.post?.locationName ?? ""}`}
        initialMessages={chat.messages.map((message) => ({
          id: message.id,
          content: message.content,
          createdAt:
            message.createdAt instanceof Date
              ? message.createdAt.toISOString()
              : new Date(message.createdAt).toISOString(),
          senderId: message.senderId,
          sender: message.sender
        }))}
      />
    </section>
  );
}
