import { NextRequest, NextResponse } from "next/server";

const rateWindowMs = 60_000;
const rateLimit = 90;
const buckets = new Map<string, { count: number; resetAt: number }>();

function getClientKey(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip");
  return forwardedFor || realIp || "local";
}

function withSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  return response;
}

export function middleware(request: NextRequest) {
  const response = withSecurityHeaders(NextResponse.next());

  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return response;
  }

  const now = Date.now();
  const key = `${getClientKey(request)}:${request.nextUrl.pathname}`;
  const current = buckets.get(key);
  const bucket = !current || current.resetAt < now ? { count: 0, resetAt: now + rateWindowMs } : current;
  bucket.count += 1;
  buckets.set(key, bucket);

  response.headers.set("X-RateLimit-Limit", String(rateLimit));
  response.headers.set("X-RateLimit-Remaining", String(Math.max(rateLimit - bucket.count, 0)));
  response.headers.set("X-RateLimit-Reset", String(Math.ceil(bucket.resetAt / 1000)));

  if (bucket.count > rateLimit) {
    return NextResponse.json(
      { ok: false, message: "Demasiadas solicitudes. Intenta nuevamente en un minuto." },
      { status: 429, headers: response.headers }
    );
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-touch-icon.svg|manifest.webmanifest).*)"]
};
