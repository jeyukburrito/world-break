import { ReactNode } from "react";

type TopAppBarProps = {
  title?: string;
  right?: ReactNode;
};

export function TopAppBar({ right }: TopAppBarProps) {
  return (
    <header className="sticky top-0 z-50 bg-surface/70 shadow-soft backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-md items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-indigo-700" aria-hidden="true">
            bolt
          </span>
          <p className="text-[10px] font-black uppercase tracking-[0.32em] text-indigo-700">
            World Break
          </p>
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
    </header>
  );
}
