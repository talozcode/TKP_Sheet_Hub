import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "tkp_session";

async function verifySession(token: string): Promise<boolean> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const [dataB64, sigB64] = token.split(".");
    if (!dataB64 || !sigB64) return false;
    const sig = Uint8Array.from(atob(sigB64), (c) => c.charCodeAt(0));
    const data = atob(dataB64);
    return crypto.subtle.verify("HMAC", key, sig, new TextEncoder().encode(data));
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow login page and auth API
  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value ?? "";
  const valid = await verifySession(token);

  if (!valid) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
