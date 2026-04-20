import { redirect } from "next/navigation";

import { CreatePostForm } from "@/components/posts/create-post-form";
import { getAuthSession } from "@/lib/auth";

export default async function CreatePage() {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login?callbackUrl=/create");
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-3xl space-y-4">
        <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
          Create a sports activity
        </span>
        <h1 className="font-display text-5xl font-bold tracking-tight text-slate-950">
          Post the details players need so they can find you and join with confidence.
        </h1>
        <p className="text-lg text-slate-600">
          Choose the sport and location from the dropdowns, add the map link, and set a future date.
        </p>
      </div>

      <CreatePostForm />
    </section>
  );
}
