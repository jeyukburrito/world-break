"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { getSafeRedirectPath, isSupabaseConfigured } from "@/lib/env";
import { GUEST_COOKIE, createGuestToken, getGuestCookieOptions } from "@/lib/guest";
import { createClient } from "@/lib/supabase/server";

export async function signInWithGoogle(formData: FormData) {
  if (!isSupabaseConfigured) {
    redirect("/login?error=config_missing");
  }

  const supabase = await createClient();
  const headerStore = await headers();
  const origin = headerStore.get("origin");
  const nextPath = getSafeRedirectPath(formData.get("next")?.toString());

  if (!origin) {
    redirect("/login?error=origin_missing");
  }

  const callbackUrl = new URL("/auth/callback", origin);
  callbackUrl.searchParams.set("next", nextPath);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
    },
  });

  if (error || !data.url) {
    redirect("/login?error=oauth_start_failed");
  }

  redirect(data.url);
}

export async function startAsGuest() {
  const cookieStore = await cookies();

  // Reuse existing token to preserve previously saved guest data
  if (!cookieStore.get(GUEST_COOKIE)?.value) {
    cookieStore.set(GUEST_COOKIE, createGuestToken(), getGuestCookieOptions());
  }

  redirect("/matches/new");
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete(GUEST_COOKIE);

  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect("/login");
}
