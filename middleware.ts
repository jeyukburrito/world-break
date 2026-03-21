import { NextResponse, type NextRequest } from "next/server";

import { GUEST_COOKIE } from "@/lib/guest";
import { isSupabaseConfigured } from "@/lib/env";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = ["/", "/login", "/auth/callback"];

export async function middleware(request: NextRequest) {
  const isPublicPath = PUBLIC_PATHS.some(
    (path) => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(`${path}/`),
  );
  const guestToken = request.cookies.get(GUEST_COOKIE)?.value;
  const allowGuestLogin = request.nextUrl.pathname === "/login" && request.nextUrl.searchParams.get("guest") === "upgrade";

  if (guestToken) {
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
