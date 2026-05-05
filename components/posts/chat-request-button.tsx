"use client";

import { LoaderCircle, MessageCirclePlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ChatRequestButtonProps = {
  postId: string;
  isOwner: boolean;
  isAuthenticated: boolean;
  requestStatus?: "PENDING" | "ACCEPTED" | "REJECTED";
};

export function ChatRequestButton({
  postId,
  isOwner,
  isAuthenticated,
  requestStatus
}: ChatRequestButtonProps) {
  const router = useRouter();
  const [status, setStatus] = useState(requestStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isOwner) {
    return (
      <span className="inline-flex rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
        Your post
      </span>
    );
  }

  if (!isAuthenticated) {
    return (
      <Link href="/login" className="button-secondary">
        Log in to request chat
      </Link>
    );
  }

  if (status === "PENDING") {
    return (
      <div className="space-y-2">
        <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
          Request pending
        </span>
        <p className="text-xs text-slate-500">Waiting for the organizer to respond.</p>
      </div>
    );
  }

  if (status === "ACCEPTED") {
    return (
      <Link href="/chats" className="button-primary">
        Open chat
      </Link>
    );
  }

  async function handleRequest() {
    setLoading(true);
    setError(null);

    const response = await fetch("/api/chat-request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ postId })
    });

    const payload = (await response.json()) as { error?: string };
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to send request.");
      return;
    }

    setStatus("PENDING");
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <button type="button" onClick={handleRequest} disabled={loading} className="button-primary">
        {loading ? (
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <MessageCirclePlus className="mr-2 h-4 w-4" />
        )}
        Chat Request
      </button>
      {status === "REJECTED" ? (
        <p className="text-xs text-slate-500">
          Your earlier request was declined. Duplicate requests are blocked for this post.
        </p>
      ) : null}
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
