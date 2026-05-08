import { NextResponse } from "next/server";

const SESSION_COOKIE = "tkp_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

async function makeToken(): Promise<string> {
  const secret = process.env.AUTH_SECRET!;
  const data = `session:${Date.now()}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return `${btoa(data)}.${sigB64}`;
}

export async function POST(request: Request) {
  const password = process.env.AUTH_PASSWORD;
  const secret = process.env.AUTH_SECRET;

  if (!password || !secret) {
    return NextResponse.json({ error: "Auth not configured" }, { status: 500 });
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Constant-time comparison to avoid timing attacks
  const submitted = new TextEncoder().encode(body.password ?? "");
  const expected = new TextEncoder().encode(password);
  const maxLen = Math.max(submitted.length, expected.length);
  const a = new Uint8Array(maxLen);
  const b = new Uint8Array(maxLen);
  a.set(submitted);
  b.set(expected);
  let diff = submitted.length ^ expected.length;
  for (let i = 0; i < maxLen; i++) diff |= a[i] ^ b[i];

  if (diff !== 0) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const token = await makeToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
