import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { getNotificationsForUser, markNotificationsAsRead } from "@/lib/data";

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { items, unreadCount } = await getNotificationsForUser(session.user.id);

    return NextResponse.json({ items, unreadCount });
  } catch {
    return NextResponse.json({ error: "Unable to fetch notifications." }, { status: 500 });
  }
}

export async function PATCH() {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await markNotificationsAsRead(session.user.id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unable to update notifications." }, { status: 500 });
  }
}
