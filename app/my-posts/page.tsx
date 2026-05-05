import Link from "next/link";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { getPostsByUser } from "@/lib/data";
import { formatDateTime } from "@/lib/utils";

export default async function MyPostsPage() {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login?callbackUrl=/my-posts");
  }

  const posts = await getPostsByUser(session.user.id);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <span className="inline-flex rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700">
            My activity posts
          </span>
          <h1 className="font-display text-4xl font-bold tracking-tight text-slate-950">
            Track your upcoming games and keep an eye on incoming interest.
          </h1>
        </div>
        <Link href="/create" className="button-primary">
          Create another post
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {posts.length > 0 ? (
          posts.map((post) => {
            const pendingCount = post.chatRequests.filter((request) => request.status === "PENDING").length;
            const acceptedCount = post.chatRequests.filter((request) => request.status === "ACCEPTED").length;

            return (
              <article key={post.id} className="surface p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="inline-flex rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">
                      {post.sport}
                    </span>
                    <h2 className="mt-4 text-2xl font-bold text-slate-950">{post.locationName}</h2>
                    <p className="mt-2 text-sm text-slate-500">{formatDateTime(post.datetime)}</p>
                  </div>
                  <a href={post.mapLink} target="_blank" rel="noreferrer" className="button-secondary">
                    View on Map
                  </a>
                </div>

                {post.description ? <p className="mt-5 text-sm leading-6 text-slate-600">{post.description}</p> : null}

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-3xl font-bold text-slate-950">{post.chatRequests.length}</p>
                    <p className="mt-2 text-sm text-slate-500">Total requests</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-3xl font-bold text-slate-950">{pendingCount}</p>
                    <p className="mt-2 text-sm text-slate-500">Pending requests</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-3xl font-bold text-slate-950">{acceptedCount}</p>
                    <p className="mt-2 text-sm text-slate-500">Accepted chats</p>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="surface px-6 py-16 text-center lg:col-span-2">
            <h2 className="font-display text-2xl font-bold text-slate-950">
              You haven’t posted a game yet
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              Create your first sports activity and players can start requesting chats.
            </p>
            <Link href="/create" className="button-primary mt-6">
              Create your first post
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
