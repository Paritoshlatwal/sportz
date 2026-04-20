import { CHAT_REQUEST_STATUSES } from "@/lib/db-types";
import { LOCATION_OPTIONS, SPORT_OPTIONS } from "@/lib/constants";
import { isGoogleMapsUrl } from "@/lib/utils";
import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-f0-9]{24}$/i, "Invalid id.");

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters long."),
  email: z.string().trim().email("Please enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .max(64, "Password is too long.")
});

export const signInSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1)
});

export const createPostSchema = z.object({
  sport: z.enum(SPORT_OPTIONS, {
    errorMap: () => ({ message: "Choose a valid sport." })
  }),
  locationName: z.enum(LOCATION_OPTIONS, {
    errorMap: () => ({ message: "Choose a valid location." })
  }),
  mapLink: z
    .string()
    .trim()
    .url("Enter a valid Google Maps URL.")
    .refine(isGoogleMapsUrl, "Use a valid Google Maps link."),
  datetime: z.coerce
    .date()
    .refine((value) => value.getTime() > Date.now(), "Date must be in the future."),
  description: z
    .string()
    .trim()
    .max(500, "Description can be up to 500 characters.")
    .optional()
    .or(z.literal(""))
});

export const chatRequestSchema = z.object({
  postId: objectIdSchema
});

export const chatRequestUpdateSchema = z.object({
  status: z.enum(CHAT_REQUEST_STATUSES).refine(
    (value) => value === "ACCEPTED" || value === "REJECTED",
    "Status must be ACCEPTED or REJECTED."
  )
});

export const messageSchema = z.object({
  chatId: objectIdSchema,
  content: z
    .string()
    .trim()
    .min(1, "Message cannot be empty.")
    .max(1000, "Message is too long.")
});
