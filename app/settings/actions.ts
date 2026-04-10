"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { GUEST_COOKIE } from "@/lib/guest";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function deleteAccount() {
  const user = await requireUser();
  const cookieStore = await cookies();

  // 1. Supabase Auth first — critical step. If this fails, the account is still active.
  // Admin client deletes even if user is not signed in to Supabase in this session (e.g. session expired).
  if (!user.isGuest) {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);
    
    if (error) {
      console.error("[deleteAccount] Supabase auth delete failed:", error);
      // Fail early so the user knows deletion didn't happen.
      throw new Error("인증 서버 계정 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    }
  }

  // 2. Storage cleanup (Optional/Best Effort)
  try {
    const admin = createAdminClient();
    const { data: scorecardFiles } = await admin.storage
      .from("tournament-scorecards")
      .list(user.id);
    if (scorecardFiles && scorecardFiles.length > 0) {
      const paths = scorecardFiles.map((f) => `${user.id}/${f.name}`);
      await admin.storage.from("tournament-scorecards").remove(paths);
    }
  } catch (storageError) {
    console.error("[deleteAccount] Storage cleanup failed:", storageError);
  }

  // 3. DB row last — if this fails, we have an orphaned record but the user can't log in anymore.
  await prisma.user.delete({ where: { id: user.id } });

  // 4. Client session cleanup
  if (!user.isGuest) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  
  cookieStore.delete(GUEST_COOKIE);
  redirect("/login?message=account_deleted");
}
