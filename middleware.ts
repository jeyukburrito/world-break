import { NextResponse, type NextRequest } from "next/server";

import { getAuthCallbackOrigin, isSupabaseConfigured } from "@/lib/env";

// Inline to avoid bundling @/lib/guest (Prisma-heavy) into Edge runtime
const GUEST_COOKIE = "wb_guest_token";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = ["/", "/login", "/auth/callback", "/api/og"];

// Routes that require Supabase auth and do not support guest sessions
const SUPABASE_ONLY_PATHS = ["/matches/export"];

export async function middleware(request: NextRequest) {
  // Canonicalize host only for the OAuth callback — preview/staging hosts must
  // stay functional for all other paths.
  if (request.nextUrl.pathname.startsWith("/auth/callback")) {
    const canonicalOrigin = getAuthCallbackOrigin(request.headers);
    if (canonicalOrigin && request.nextUrl.origin !== canonicalOrigin) {
      const canonicalUrl = request.nextUrl.clone();
      const canonicalBase = new URL(canonicalOrigin);
      canonicalUrl.protocol = canonicalBase.protocol;
      canonicalUrl.host = canonicalBase.host;
      return NextResponse.redirect(canonicalUrl, 307);
    }
  }

  const isPublicPath = PUBLIC_PATHS.some(
    (path) => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(`${path}/`),
  );
  const guestToken = request.cookies.get(GUEST_COOKIE)?.value;
  const allowGuestLogin = request.nextUrl.pathname === "/login" && request.nextUrl.searchParams.get("guest") === "upgrade";

  if (guestToken) {
    if (SUPABASE_ONLY_PATHS.some((p) => request.nextUrl.pathname.startsWith(p))) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }

    if (request.nextUrl.pathname === "/login" && !allowGuestLogin) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next({
      request,
    });
  }

  if (!isSupabaseConfigured) {
    if (isPublicPath) {
      return NextResponse.next({
        request,
      });
    }

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|manifest\\.json|sw\\.js|icons/|fonts/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2)$).*)"],
};
