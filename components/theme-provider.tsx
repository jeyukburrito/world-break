"use client";

import { useEffect, type ReactNode } from "react";

function applySystemTheme() {
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle("dark", isDark);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    applySystemTheme();

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applySystemTheme();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return <>{children}</>;
}
