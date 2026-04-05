"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isNavigationItemActive, navigationItems } from "@/lib/navigation";

function NavLink({
  href,
  icon,
  label,
  pathname,
  className,
}: {
  href: string;
  icon: string;
  label: string;
  pathname: string;
  className?: string;
}) {
  const active = isNavigationItemActive(href, pathname);

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
        active
          ? "bg-indigo-950/50 text-primary"
          : "text-on-surface-variant hover:bg-surface hover:text-on-surface"
      } ${className ?? ""}`}
    >
      <span
        className={`material-symbols-outlined text-[20px] ${active ? "filled" : ""}`}
        aria-hidden="true"
      >
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}

export function SideNav() {
  const pathname = usePathname();
  const primaryItems = navigationItems.filter(
    (item) => item.href === "/dashboard" || item.href === "/matches",
  );
  const newMatchItem = navigationItems.find((item) => item.href === "/matches/new");
  const settingsItem = navigationItems.find((item) => item.href === "/settings");
  const isNewMatchActive = newMatchItem ? isNavigationItemActive(newMatchItem.href, pathname) : false;

  return (
    <nav
      aria-label="사이드 내비게이션"
      className="fixed inset-y-0 left-0 hidden min-h-dvh w-56 flex-col gap-1 bg-surface-container-low px-3 py-6 md:flex"
    >
      <Link
        href="/dashboard"
        className="px-4 pb-5 text-[10px] font-black uppercase tracking-[0.32em] text-primary"
      >
        World Break
      </Link>

      {primaryItems.map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
          icon={item.icon}
          label={item.label}
          pathname={pathname}
        />
      ))}

      {newMatchItem ? (
        <Link
          href={newMatchItem.href}
          className={`mt-3 w-full rounded-full px-4 py-3 text-center text-sm font-bold text-white transition-all ${
            isNewMatchActive
              ? "bg-primary ring-2 ring-primary/30"
              : "bg-primary hover:opacity-90"
          }`}
        >
          + 새 매치 입력
        </Link>
      ) : null}

      {settingsItem ? (
        <NavLink
          href={settingsItem.href}
          icon={settingsItem.icon}
          label={settingsItem.label}
          pathname={pathname}
          className="mt-auto"
        />
      ) : null}
    </nav>
  );
}
