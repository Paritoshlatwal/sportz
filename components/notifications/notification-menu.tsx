"use client";

import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { cn, formatDateTime } from "@/lib/utils";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

type NotificationResponse = {
  items: NotificationItem[];
  unreadCount: number;
};

export function NotificationMenu() {
  const [data, setData] = useState<NotificationResponse>({ items: [], unreadCount: 0 });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications", { cache: "no-store" });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as NotificationResponse;
      setData(payload);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();

    const interval = setInterval(() => {
      void loadNotifications();
    }, 15000);

    return () => clearInterval(interval);
  }, [loadNotifications]);

  useEffect(() => {
    if (!open || data.unreadCount === 0) {
      return;
    }

    void fetch("/api/notifications", { method: "PATCH" }).then(() => {
      setData((current) => ({
        unreadCount: 0,
        items: current.items.map((item) => ({ ...item, isRead: true }))
      }));
    });
  }, [data.unreadCount, open]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
        aria-label="Open notifications"
      >
        <Bell className="h-5 w-5" />
        {data.unreadCount > 0 ? (
          <span className="absolute right-2 top-2 inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
        ) : null}
      </button>

      {open ? (
        <div className="surface absolute right-0 z-30 mt-3 w-[min(92vw,22rem)] overflow-hidden p-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">Notifications</p>
              <p className="text-xs text-slate-500">Requests, acceptances, and messages</p>
            </div>
            <CheckCheck className="h-4 w-4 text-brand-600" />
          </div>

          <div className="max-h-96 space-y-2 overflow-y-auto px-2 py-3">
            {!loading && data.items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                No notifications yet.
              </div>
            ) : null}

            {data.items.map((item) => {
              const content = (
                <div
                  className={cn(
                    "rounded-2xl border px-4 py-3 transition",
                    item.isRead
                      ? "border-slate-100 bg-slate-50/80"
                      : "border-brand-100 bg-brand-50/70"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="text-sm text-slate-600">{item.body}</p>
                    </div>
                    {!item.isRead ? (
                      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-500" />
                    ) : null}
                  </div>
                  <p className="mt-2 text-xs text-slate-400">{formatDateTime(item.createdAt)}</p>
                </div>
              );

              return item.link ? (
                <Link key={item.id} href={item.link} onClick={() => setOpen(false)}>
                  {content}
                </Link>
              ) : (
                <div key={item.id}>{content}</div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
