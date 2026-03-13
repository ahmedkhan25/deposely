import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (password !== "depose") {
    return NextResponse.json({ error: "wrong" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("deposly_auth", "yes", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}
