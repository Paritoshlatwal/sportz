import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { createPost, getFeedPosts } from "@/lib/data";
import { createPostSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get("sport")?.trim() ?? "";
    const location = searchParams.get("location")?.trim() ?? "";
    const mine = searchParams.get("mine") === "true";

    if (mine && !session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const posts = await getFeedPosts({
      sport,
      location,
      currentUserId: session?.user.id,
      mineUserId: mine && session ? session.user.id : undefined
    });

    return NextResponse.json(posts);
  } catch {
    return NextResponse.json({ error: "Unable to fetch posts." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createPostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    const post = await createPost({
      sport: parsed.data.sport,
      locationName: parsed.data.locationName,
      mapLink: parsed.data.mapLink,
      datetime: parsed.data.datetime,
      description: parsed.data.description || null,
      userId: session.user.id
    });

    return NextResponse.json(post, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create post." }, { status: 500 });
  }
}
