import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { getChatsForUser } from "@/lib/data";

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const chats = await getChatsForUser(session.user.id);

    return NextResponse.json(chats);
  } catch {
    return NextResponse.json({ error: "Unable to fetch chats." }, { status: 500 });
  }
}
