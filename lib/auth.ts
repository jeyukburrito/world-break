import { cookies } from "next/headers";
import { cache } from "react";
import { redirect } from "next/navigation";

import type { User as SupabaseUser } from "@supabase/supabase-js";

import { GUEST_COOKIE, ensureGuestUserByToken } from "@/lib/guest";
import { isSupabaseConfigured } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase 인증 유저를 Prisma users 테이블에 동기화한다.
 * email/name은 Supabase auth.users에만 저장 — public.users에는 id만 보관.
 */
export async function ensureUserProfile(user: SupabaseUser) {
  await prisma.user.upsert({
    where: { id: user.id },
    create: { id: user.id },
    update: {},
  });
}

export async function ensureUserProfileExists(user: SupabaseUser) {
  const existingUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true },
  });

  if (existingUser) {
    return;
  }

  try {
    await prisma.user.create({
      data: { id: user.id },
    });
  } catch (error) {
    const isUniqueViolation =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002";

    if (!isUniqueViolation) {
      throw error;
    }
  }
}

export type CurrentUser = {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  isGuest: boolean;
  user_metadata?: {
    name?: string | null;
    full_name?: string | null;
    avatar_url?: string | null;
  } | null;
};

function mapSupabaseUser(user: SupabaseUser): CurrentUser {
  const name =
    (user.user_metadata?.name as string | undefined) ??
    (user.user_metadata?.full_name as string | undefined) ??
    null;

  return {
    id: user.id,
    email: user.email ?? null,
    name,
    avatarUrl: (user.user_metadata?.avatar_url as string | undefined) ?? null,
    isGuest: false,
    user_metadata: user.user_metadata as CurrentUser["user_metadata"],
  };
}

function mapGuestUser(user: { id: string }): CurrentUser {
  return {
    id: user.id,
    email: null,
    name: "게스트",
    avatarUrl: null,
    isGuest: true,
    user_metadata: {
      name: "게스트",
      full_name: "게스트",
      avatar_url: null,
    },
  };
}

export function getUserDisplayInfo(user: CurrentUser) {
  return {
    name: user.name ?? user.user_metadata?.name ?? user.user_metadata?.full_name ?? null,
    avatarUrl: user.avatarUrl ?? (user.user_metadata?.avatar_url as string) ?? null,
    email: user.email ?? null,
    isGuest: user.isGuest,
  };
}

/**
 * 현재 요청의 인증된 유저를 반환한다.
 *
 * react.cache()로 래핑되어 있어 동일 요청(렌더 트리) 내에서
 * requireUser()를 여러 번 호출해도 Supabase 세션 조회 + DB 동기화는
 * 단 한 번만 실행된다. (서버리스 connection 절약)
 */
export const requireUser = cache(async function requireUser(): Promise<CurrentUser> {
  const cookieStore = await cookies();
  const guestToken = cookieStore.get(GUEST_COOKIE)?.value ?? null;

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await ensureUserProfileExists(user);
        return mapSupabaseUser(user);
      }
    } catch (e) {
      // Supabase auth 오류 (네트워크 실패, 프로젝트 일시정지 등) — 게스트/리다이렉트로 폴백
      console.error("[requireUser] Supabase auth error:", e);
    }
  }

  if (guestToken) {
    try {
      return mapGuestUser(await ensureGuestUserByToken(guestToken));
    } catch (e) {
      console.error("[requireUser] guest upsert error:", e);
      // 게스트 DB 오류 시 로그인으로 리다이렉트 (쿠키는 유지)
    }
  }

  redirect("/login");
});
