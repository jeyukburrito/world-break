import { ReactNode } from "react";

import { BottomNav } from "@/components/bottom-nav";
import { SideNav } from "@/components/side-nav";
import { TopAppBar } from "@/components/top-app-bar";

type AppShellProps = {
  title: string;
  headerRight?: ReactNode;
  children: ReactNode;
};

export async function AppShell({ title, headerRight, children }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-paper text-on-surface md:pl-56">
      <SideNav />
      <div className="flex min-h-dvh flex-col">
        <TopAppBar title={title} right={headerRight} />
        <main className="mx-auto w-full max-w-md flex-1 px-4 py-5 pb-28 md:max-w-3xl md:px-8 md:py-6 md:pb-6">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
