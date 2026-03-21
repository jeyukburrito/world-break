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
    cookieStore.delete(GUEST_COOKIE);

    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });

    redirect("/login?message=account_deleted");
  }

  const admin = createAdminClient();
  const supabase = await createClient();

  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    redirect("/settings/profile?error=delete_failed");
  }

  await prisma.user.delete({
    where: {
      id: user.id,
    },
  });

  await supabase.auth.signOut();
  cookieStore.delete(GUEST_COOKIE);
  redirect("/login?message=account_deleted");
}
