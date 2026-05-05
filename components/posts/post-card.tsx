import { MapPinned, UserRound } from "lucide-react";

import { ChatRequestButton } from "@/components/posts/chat-request-button";
import { formatDateTime } from "@/lib/utils";

type PostCardProps = {
  post: {
    id: string;
    sport: string;
    locationName: string;
    mapLink: string;
    datetime: Date;
    description: string | null;
    user: {
      id: string;
      name: string;
    };
    chatRequests: {
      id: string;
      status: "PENDING" | "ACCEPTED" | "REJECTED";
    }[];
  };
  currentUserId?: string;
};

export function PostCard({ post, currentUserId }: PostCardProps) {
  const request = post.chatRequests[0];
  const isOwner = currentUserId === post.user.id;

  return (
    <article className="surface flex h-full flex-col justify-between p-6">
      <div className="space-y-5">
        <div>
          <span className="inline-flex rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">
            {post.sport}
          </span>
          <h3 className="font-display mt-4 text-2xl font-bold text-slate-950">{post.locationName}</h3>
          <p className="mt-2 text-sm text-slate-500">{formatDateTime(post.datetime)}</p>
        </div>

        {post.description ? <p className="text-sm leading-6 text-slate-600">{post.description}</p> : null}

        <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <UserRound className="h-4 w-4 text-brand-600" />
            Posted by <span className="font-semibold text-slate-900">{post.user.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPinned className="h-4 w-4 text-brand-600" />
            {post.locationName}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <a
          href={post.mapLink}
          target="_blank"
          rel="noreferrer"
          className="button-secondary"
        >
          View on Map
        </a>
        <ChatRequestButton
          postId={post.id}
          isOwner={isOwner}
          isAuthenticated={Boolean(currentUserId)}
          requestStatus={request?.status}
        />
      </div>
    </article>
  );
}
