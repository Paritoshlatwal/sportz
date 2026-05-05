export const CHAT_REQUEST_STATUSES = ["PENDING", "ACCEPTED", "REJECTED"] as const;
export type ChatRequestStatus = (typeof CHAT_REQUEST_STATUSES)[number];

export const CHAT_REQUEST_STATUS = {
  PENDING: CHAT_REQUEST_STATUSES[0],
  ACCEPTED: CHAT_REQUEST_STATUSES[1],
  REJECTED: CHAT_REQUEST_STATUSES[2]
} as const;

export const NOTIFICATION_TYPES = [
  "CHAT_REQUEST",
  "REQUEST_ACCEPTED",
  "NEW_MESSAGE"
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];
