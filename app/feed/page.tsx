import Link from "next/link";

import { FeedFilters } from "@/components/posts/feed-filters";
import { PostCard } from "@/components/posts/post-card";
import { getAuthSession } from "@/lib/auth";
import { getFeedPosts } from "@/lib/data";

type FeedPageProps = {
  searchParams: Promise<{
    sport?: string;
    location?: string;
  }>;
};

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const session = await getAuthSession();
  const params = await searchParams;
  const sport = params.sport?.trim() ?? "";
  const location = params.location?.trim() ?? "";

  const posts = await getFeedPosts({
    sport,
    location,
    currentUserId: session?.user.id
  });

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
        <div className="space-y-5">
          <span className="inline-flex rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700">
            Upcoming sports activities
          </span>
          <div className="space-y-4">
            <h1 className="font-display text-5xl font-bold tracking-tight text-slate-950">
              Discover local games and join the right conversation at the right time.
            </h1>
            <p className="max-w-2xl text-lg text-slate-600">
              Browse upcoming matches, see exactly where they’re happening, and request
              a chat with organizers before you commit.
            </p>
          </div>
          {!session ? (
            <div className="flex flex-wrap gap-3">
              <Link href="/signup" className="button-primary">
                Create an account
              </Link>
              <Link href="/login" className="button-secondary">
                Log in
              </Link>
            </div>
          ) : null}
        </div>

        <div className="surface space-y-4 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
            Quick stats
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-3xl font-bold text-slate-950">{posts.length}</p>
              <p className="mt-2 text-sm text-slate-500">Upcoming posts</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-3xl font-bold text-slate-950">
                {new Set(posts.map((post) => post.sport.toLowerCase())).size}
              </p>
              <p className="mt-2 text-sm text-slate-500">Sports listed</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-3xl font-bold text-slate-950">
                {new Set(posts.map((post) => post.locationName.toLowerCase())).size}
              </p>
              <p className="mt-2 text-sm text-slate-500">Locations active</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <FeedFilters sport={sport} location={location} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} post={post} currentUserId={session?.user.id} />)
        ) : (
          <div className="surface col-span-full px-6 py-16 text-center">
            <h2 className="font-display text-2xl font-bold text-slate-950">
              No upcoming posts matched your filters
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              Try a different sport or location, or create a fresh activity.
            </p>
            {session ? (
              <Link href="/create" className="button-primary mt-6">
                Post a game
              </Link>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
