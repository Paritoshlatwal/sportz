import { format } from "date-fns";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(value: Date | string) {
  return format(new Date(value), "EEE, d MMM yyyy 'at' p");
}

export function isGoogleMapsUrl(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return (
      (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      (host.includes("google.") || host.includes("goo.gl"))
    );
  } catch {
    return false;
  }
}
