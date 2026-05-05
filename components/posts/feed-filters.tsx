import { LOCATION_OPTIONS, SPORT_OPTIONS } from "@/lib/constants";

type FeedFiltersProps = {
  sport?: string;
  location?: string;
};

export function FeedFilters({ sport = "", location = "" }: FeedFiltersProps) {
  return (
    <form action="/feed" className="surface grid gap-4 p-4 md:grid-cols-[1fr_1fr_auto]">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Sport</label>
        <select name="sport" defaultValue={sport} className="input">
          <option value="">All sports</option>
          {SPORT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Location</label>
        <select name="location" defaultValue={location} className="input">
          <option value="">All locations</option>
          {LOCATION_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-end gap-3">
        <button type="submit" className="button-primary w-full md:w-auto">
          Apply filters
        </button>
        <a href="/feed" className="button-secondary w-full md:w-auto">
          Reset
        </a>
      </div>
    </form>
  );
}
