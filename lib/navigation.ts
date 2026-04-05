export type NavigationItem = {
  href: string;
  label: string;
  icon: string;
};

export const navigationItems: NavigationItem[] = [
  { href: "/dashboard", label: "대시보드", icon: "dashboard" },
  { href: "/matches", label: "기록", icon: "history" },
  { href: "/matches/new", label: "입력", icon: "add_circle" },
  { href: "/settings", label: "설정", icon: "settings" },
];

export function isNavigationItemActive(href: string, pathname: string) {
  if (href === "/matches/new") {
    return pathname === "/matches/new";
  }

  if (href === "/matches") {
    return pathname === "/matches" || (pathname.startsWith("/matches/") && pathname !== "/matches/new");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
