import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { getAuthSession } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getAuthSession();

  if (session) {
    redirect("/feed");
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <span className="inline-flex rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700">
            Sports activity platform
          </span>
          <div className="space-y-4">
            <h2 className="font-display text-5xl font-bold tracking-tight text-slate-950">
              Find teammates, set the match, and keep the conversation moving.
            </h2>
            <p className="max-w-2xl text-lg text-slate-600">
              Sportz helps players discover upcoming games, request chats with organizers,
              and coordinate once the request is accepted.
            </p>
          </div>
        </div>

        <LoginForm />
      </div>
    </section>
  );
}
