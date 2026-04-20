"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type RequestActionsProps = {
  requestId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
};

export function RequestActions({ requestId, status }: RequestActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"ACCEPTED" | "REJECTED" | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (status !== "PENDING") {
    return (
      <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">
        {status.toLowerCase()}
      </span>
    );
  }

  async function handleUpdate(nextStatus: "ACCEPTED" | "REJECTED") {
    setLoading(nextStatus);
    setError(null);

    const response = await fetch(`/api/chat-request/${requestId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status: nextStatus })
    });

    const payload = (await response.json()) as { error?: string };
    setLoading(null);

    if (!response.ok) {
      setError(payload.error ?? "Unable to update request.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => handleUpdate("ACCEPTED")}
          disabled={Boolean(loading)}
          className="button-primary"
        >
          {loading === "ACCEPTED" ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
          Accept
        </button>
        <button
          type="button"
          onClick={() => handleUpdate("REJECTED")}
          disabled={Boolean(loading)}
          className="button-secondary"
        >
          {loading === "REJECTED" ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
          Reject
        </button>
      </div>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
