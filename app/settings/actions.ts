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

  if (user.isGuest) {
    await prisma.user.delete({ where: { id: user.id } });
    cookieStore.delete(GUEST_COOKIE);
    redirect("/login?message=account_deleted");
  }

  const admin = createAdminClient();
  const supabase = await createClient();

  // Delete scorecard PNGs from Storage before removing DB records
  try {
    const { data: scorecardFiles } = await admin.storage
      .from("tournament-scorecards")
      .list(user.id);
    if (scorecardFiles && scorecardFiles.length > 0) {
      const paths = scorecardFiles.map((f) => `${user.id}/${f.name}`);
      await admin.storage.from("tournament-scorecards").remove(paths);
    }
  } catch (storageError) {
    // Non-blocking — log and continue with account deletion
    console.error("[deleteAccount] Storage cleanup failed:", storageError);
  }

  // DB first — cascade deletes all child records, and failures are recoverable
  await prisma.user.delete({ where: { id: user.id } });

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    // DB row is already gone — user can't access the app anymore.
    // Supabase auth record will be orphaned but harmless.
    console.error("[deleteAccount] Supabase auth delete failed:", error);
  }

  await supabase.auth.signOut();
  cookieStore.delete(GUEST_COOKIE);
  redirect("/login?message=account_deleted");
}
