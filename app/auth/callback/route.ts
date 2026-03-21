import { type NextRequest, NextResponse } from "next/server";

import { ensureUserProfile } from "@/lib/auth";
import { getSafeRedirectPath, isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

// Inline to avoid bundling @/lib/guest (Prisma-heavy) into this route handler
const GUEST_COOKIE = "wb_guest_token";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeRedirectPath(requestUrl.searchParams.get("next"));

  if (!isSupabaseConfigured) {
    return NextResponse.redirect(new URL("/login?error=config_missing", request.url));
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          await ensureUserProfile(user);
        }

        // Clear guest session only after successful Google login
        const response = NextResponse.redirect(new URL(next, request.url));
        response.cookies.delete(GUEST_COOKIE);
        return response;
      }
    } catch {
      return NextResponse.redirect(new URL("/login?error=oauth_callback_failed", request.url));
    }
  }

  return NextResponse.redirect(new URL("/login?error=oauth_callback_failed", request.url));
}
