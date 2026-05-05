import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import { createUser, getUserByEmail, isDuplicateKeyError } from "@/lib/data";
import { signUpSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signUpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }

    const existingUser = await getUserByEmail(parsed.data.email);

    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const password = await hash(parsed.data.password, 12);
    await createUser({
      name: parsed.data.name,
      email: parsed.data.email,
      password
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: unknown) {
    if (isDuplicateKeyError(error)) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong" },
      { status: 500 }
    );
  }
}
