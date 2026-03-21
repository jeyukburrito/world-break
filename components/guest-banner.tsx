import Link from "next/link";

type GuestBannerProps = {
  actionHref?: string;
};

export function GuestBanner({ actionHref = "/login?guest=upgrade" }: GuestBannerProps) {
  return (
    <aside className="overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-paper to-surface p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
            person
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-700">
            Guest Mode
          </p>
          <h2 className="mt-1 text-sm font-bold text-ink">게스트 모드로 사용 중입니다</h2>
          <p className="mt-1 text-xs leading-5 text-muted">
            계정 없이 기록을 이어갈 수 있습니다. Google 로그인은 별도 계정으로 시작되며, 게스트 기록은
            자동으로 이전되지 않습니다.
          </p>
        </div>
      </div>

      <div className="mt-3">
        <Link
          href={actionHref}
          className="inline-flex rounded-full bg-ink px-3 py-2 text-xs font-semibold text-white"
        >
          Google 로그인으로 이동
        </Link>
      </div>
    </aside>
  );
}
