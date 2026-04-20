import { Activity, MessageCircleMore, Plus, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { NotificationMenu } from "@/components/notifications/notification-menu";
import { SignOutButton } from "@/components/sign-out-button";
import { getAuthSession } from "@/lib/auth";

const publicLinks = [{ href: "/feed", label: "Feed" }];

const privateLinks = [
  { href: "/feed", label: "Feed" },
  { href: "/create", label: "Create Post" },
  { href: "/my-posts", label: "My Posts" },
  { href: "/requests", label: "Requests" },
  { href: "/chats", label: "Chats" }
];

export async function Navbar() {
  const session = await getAuthSession();
  const links = session ? privateLinks : publicLinks;

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-sand/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/feed" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-glow">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold tracking-tight text-slate-950">Sportz</p>
            <p className="text-xs text-slate-500">Post games. Accept requests. Chat.</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-brand-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Link href="/create" className="button-primary hidden sm:inline-flex">
                <Plus className="mr-2 h-4 w-4" />
                Post a game
              </Link>
              <NotificationMenu />
              <div className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 sm:block">
                <p className="text-sm font-semibold text-slate-900">{session.user.name}</p>
                <p className="text-xs text-slate-500">{session.user.email}</p>
              </div>
              <SignOutButton />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="button-secondary">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Log in
              </Link>
              <Link href="/signup" className="button-primary">
                <MessageCircleMore className="mr-2 h-4 w-4" />
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
