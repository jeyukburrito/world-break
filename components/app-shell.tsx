import { cookies } from "next/headers";
import { ReactNode } from "react";

import { BottomNav } from "@/components/bottom-nav";
import { GuestBanner } from "@/components/guest-banner";
import { TopAppBar } from "@/components/top-app-bar";
import { GUEST_COOKIE } from "@/lib/guest";

type AppShellProps = {
  title: string;
  headerRight?: ReactNode;
  children: ReactNode;
  isGuest?: boolean;
};

export async function AppShell({ title, headerRight, children, isGuest }: AppShellProps) {
  const cookieStore = await cookies();
  const hasGuestCookie = Boolean(cookieStore.get(GUEST_COOKIE)?.value);
  const showGuestBanner = isGuest ?? hasGuestCookie;

  return (
    <div className="min-h-dvh bg-paper text-on-surface">
      <TopAppBar title={title} right={headerRight} />
      {showGuestBanner ? (
        <div className="mx-auto w-full max-w-md px-4 pt-4">
          <GuestBanner />
        </div>
      ) : null}
      <main className="mx-auto w-full max-w-md px-4 py-5 pb-28">{children}</main>
      <BottomNav />
    </div>
  );
}
