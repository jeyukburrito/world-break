import { NextResponse, type NextRequest } from "next/server";

import { isSupabaseConfigured } from "@/lib/env";

// Inline to avoid bundling @/lib/guest (Prisma-heavy) into Edge runtime
const GUEST_COOKIE = "wb_guest_token";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = ["/", "/login", "/auth/callback", "/share", "/api/og"];

// Routes that require Supabase auth and do not support guest sessions
const SUPABASE_ONLY_PATHS = ["/matches/export", "/matches/tournaments/end"];

export async function middleware(request: NextRequest) {
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
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|manifest\\.json|sw\\.js|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
