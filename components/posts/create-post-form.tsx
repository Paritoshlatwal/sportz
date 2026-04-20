"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";

import { LOCATION_OPTIONS, SPORT_OPTIONS } from "@/lib/constants";

export function CreatePostForm() {
  const router = useRouter();
  const [sport, setSport] = useState<string>(SPORT_OPTIONS[0]);
  const [locationName, setLocationName] = useState<string>(LOCATION_OPTIONS[0]);
  const [mapLink, setMapLink] = useState("");
  const [datetime, setDatetime] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const minDateTime = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sport,
        locationName,
        mapLink,
        datetime,
        description
      })
    });

    const payload = (await response.json()) as { error?: string };
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to create post.");
      return;
    }

    router.push("/my-posts");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="surface space-y-5 p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Sport type</label>
          <select className="input" value={sport} onChange={(event) => setSport(event.target.value)} required>
            {SPORT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Date & time</label>
          <input
            type="datetime-local"
            className="input"
            value={datetime}
            min={minDateTime}
            onChange={(event) => setDatetime(event.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Location</label>
        <select
          className="input"
          value={locationName}
          onChange={(event) => setLocationName(event.target.value)}
          required
        >
          {LOCATION_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Google Maps link</label>
        <input
          type="url"
          className="input"
          value={mapLink}
          onChange={(event) => setMapLink(event.target.value)}
          placeholder="https://maps.google.com/..."
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
        <textarea
          className="textarea"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Add team size, skill level, fees, or anything players should know."
        />
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <button type="submit" disabled={loading} className="button-primary">
        {loading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
        Publish activity
      </button>
    </form>
  );
}
