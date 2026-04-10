import Link from "next/link";
import { ReactNode } from "react";

type TopAppBarProps = {
  right?: ReactNode;
};

export function TopAppBar({ right }: TopAppBarProps) {
  return (
    <header className="sticky top-0 z-50 bg-surface/70 shadow-soft backdrop-blur-xl md:hidden">
      <div className="mx-auto flex w-full max-w-md items-center justify-between gap-4 px-4 py-3">
        <Link href="/dashboard" className="text-[10px] font-black uppercase tracking-[0.32em] text-primary">
          World Break
        </Link>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
    </header>
  );
}
