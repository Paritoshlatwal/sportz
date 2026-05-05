import Link from "next/link";
import { redirect } from "next/navigation";

import { RequestActions } from "@/components/requests/request-actions";
import { getAuthSession } from "@/lib/auth";
import { getRequestsForUser } from "@/lib/data";
import { formatDateTime } from "@/lib/utils";

export default async function RequestsPage() {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login?callbackUrl=/requests");
  }

  const { incomingRequests, outgoingRequests } = await getRequestsForUser(session.user.id);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-3">
        <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
          Chat request inbox
        </span>
        <h1 className="font-display text-4xl font-bold tracking-tight text-slate-950">
          Decide who gets into the conversation for each activity.
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-950">Incoming requests</h2>
            <span className="rounded-full bg-white px-3 py-1 text-sm text-slate-500">
              {incomingRequests.length}
            </span>
          </div>

          {incomingRequests.length > 0 ? (
            incomingRequests.map((request) => (
              <article key={request.id} className="surface p-6">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-900">{request.sender.name}</p>
                  <p className="text-sm text-slate-500">{request.sender.email}</p>
                  <p className="text-sm text-slate-600">
                    Wants to join your <span className="font-semibold">{request.post.sport}</span> post at{" "}
                    <span className="font-semibold">{request.post.locationName}</span>.
                  </p>
                  <p className="text-xs text-slate-400">{formatDateTime(request.post.datetime)}</p>
                </div>
                <div className="mt-5">
                  <RequestActions requestId={request.id} status={request.status} />
                </div>
              </article>
            ))
          ) : (
            <div className="surface px-6 py-14 text-center text-sm text-slate-500">
              No incoming requests yet.
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-950">Requests you sent</h2>
            <span className="rounded-full bg-white px-3 py-1 text-sm text-slate-500">
              {outgoingRequests.length}
            </span>
          </div>

          {outgoingRequests.length > 0 ? (
            outgoingRequests.map((request) => (
              <article key={request.id} className="surface p-6">
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">{request.receiver.name}</span> is reviewing
                    your request for <span className="font-semibold">{request.post.sport}</span>.
                  </p>
                  <p className="text-sm text-slate-500">{request.post.locationName}</p>
                  <p className="text-xs text-slate-400">{formatDateTime(request.post.datetime)}</p>
                </div>

                <div className="mt-5 flex items-center justify-between gap-4">
                  <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">
                    {request.status.toLowerCase()}
                  </span>
                  {request.status === "ACCEPTED" ? (
                    <Link href="/chats" className="button-primary">
                      Open chats
                    </Link>
                  ) : null}
                </div>
              </article>
            ))
          ) : (
            <div className="surface px-6 py-14 text-center text-sm text-slate-500">
              You haven’t sent any requests yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
