"use client";

import { LoaderCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, password })
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setLoading(false);
      setError(payload.error ?? "We couldn't create your account.");
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/feed"
    });

    setLoading(false);

    if (!result || result.error) {
      setError("Your account was created, but auto-login failed. Please log in.");
      router.push("/login");
      return;
    }

    router.push("/feed");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="surface space-y-5 p-8">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-950">
          Join the next match
        </h1>
        <p className="text-sm text-slate-500">
          Create your account to post games and connect with local players.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
          <input
            type="text"
            className="input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            className="input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create a strong password"
            minLength={8}
            required
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <button type="submit" disabled={loading} className="button-primary w-full">
        {loading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
        Create account
      </button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-700">
          Log in
        </Link>
      </p>
    </form>
  );
}
