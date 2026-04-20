import Link from "next/link";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { getChatsForUser } from "@/lib/data";
import { formatDateTime } from "@/lib/utils";

export default async function ChatsPage() {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login?callbackUrl=/chats");
  }

  const chats = await getChatsForUser(session.user.id);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-3">
        <span className="inline-flex rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700">
          Accepted chats
        </span>
        <h1 className="font-display text-4xl font-bold tracking-tight text-slate-950">
          Pick up the conversation and get the game organized.
        </h1>
      </div>

      <div className="grid gap-5">
        {chats.length > 0 ? (
          chats.map((chat) => {
            const otherUser =
              chat.request.senderId === session.user.id ? chat.request.receiver : chat.request.sender;
            const lastMessage = chat.messages[0];

            return (
              <Link
                key={chat.id}
                href={`/chats/${chat.id}`}
                className="surface block p-6 transition hover:-translate-y-0.5"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-brand-700">{chat.request.post.sport}</p>
                    <h2 className="text-2xl font-bold text-slate-950">{otherUser.name}</h2>
                    <p className="text-sm text-slate-500">{chat.request.post.locationName}</p>
                  </div>
                  <div className="max-w-xl space-y-2 text-left md:text-right">
                    <p className="text-sm text-slate-600">
                      {lastMessage ? lastMessage.content : "No messages yet. Start the conversation."}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDateTime(lastMessage?.createdAt ?? chat.createdAt)}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="surface px-6 py-16 text-center">
            <h2 className="font-display text-2xl font-bold text-slate-950">
              No accepted chats yet
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              Once a request gets accepted, the chat will appear here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
