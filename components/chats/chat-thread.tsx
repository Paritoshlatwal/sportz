"use client";

import { LoaderCircle, SendHorizontal } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";

import { cn, formatDateTime } from "@/lib/utils";

type MessageItem = {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: {
    id: string;
    name: string;
  };
};

type ChatThreadProps = {
  chatId: string;
  currentUserId: string;
  title: string;
  subtitle: string;
  initialMessages: MessageItem[];
};

export function ChatThread({
  chatId,
  currentUserId,
  title,
  subtitle,
  initialMessages
}: ChatThreadProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const loadMessages = useCallback(async () => {
    const response = await fetch(`/api/messages/${chatId}`, { cache: "no-store" });

    if (!response.ok) {
      return;
    }

    const payload = (await response.json()) as MessageItem[];
    setMessages(payload);
  }, [chatId]);

  useEffect(() => {
    const interval = setInterval(() => {
      void loadMessages();
    }, 4000);

    return () => clearInterval(interval);
  }, [loadMessages]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!content.trim()) {
      return;
    }

    setLoading(true);
    setError(null);

    const response = await fetch("/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chatId,
        content
      })
    });

    const payload = (await response.json()) as { error?: string };
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to send message.");
      return;
    }

    setContent("");
    await loadMessages();
  }

  return (
    <section className="surface flex min-h-[70vh] flex-col overflow-hidden">
      <div className="border-b border-slate-100 px-6 py-5">
        <h1 className="font-display text-3xl font-bold text-slate-950">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6 sm:px-6">
        {messages.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 px-6 py-12 text-center text-sm text-slate-500">
            No messages yet. Start the conversation.
          </div>
        ) : null}

        {messages.map((message) => {
          const isOwn = message.senderId === currentUserId;

          return (
            <div key={message.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-3xl px-4 py-3",
                  isOwn ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-900"
                )}
              >
                <p className="text-sm leading-6">{message.content}</p>
                <div
                  className={cn(
                    "mt-2 flex items-center gap-2 text-xs",
                    isOwn ? "text-brand-100" : "text-slate-500"
                  )}
                >
                  <span>{message.sender.name}</span>
                  <span>&bull;</span>
                  <span>{formatDateTime(message.createdAt)}</span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-slate-100 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <textarea
            className="textarea min-h-24 flex-1"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Send a message..."
          />
          <button type="submit" disabled={loading} className="button-primary sm:self-end">
            {loading ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <SendHorizontal className="mr-2 h-4 w-4" />
            )}
            Send
          </button>
        </div>
        {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
      </form>
    </section>
  );
}
