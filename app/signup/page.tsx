import { redirect } from "next/navigation";

import { SignupForm } from "@/components/auth/signup-form";
import { getAuthSession } from "@/lib/auth";

export default async function SignupPage() {
  const session = await getAuthSession();

  if (session) {
    redirect("/feed");
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-6">
          <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
            Join your local sports scene
          </span>
          <div className="space-y-4">
            <h2 className="font-display text-5xl font-bold tracking-tight text-slate-950">
              Post the game you want to play and let the right people find it.
            </h2>
            <p className="max-w-2xl text-lg text-slate-600">
              Organize cricket, football, badminton, and more with a streamlined flow for
              posts, requests, and approved chats.
            </p>
          </div>
        </div>

        <SignupForm />
      </div>
    </section>
  );
}
