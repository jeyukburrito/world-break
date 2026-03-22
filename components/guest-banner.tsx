import Link from "next/link";

type GuestBannerProps = {
  actionHref?: string;
};

export function GuestBanner({ actionHref = "/login?guest=upgrade" }: GuestBannerProps) {
  return (
    <aside className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200/60 bg-amber-50/50 px-4 py-2.5">
      <p className="text-xs text-amber-800">
        <span className="font-semibold">게스트 모드</span> · 로그인하면 데이터를 안전하게 보관할 수 있습니다
      </p>
      <Link
        href={actionHref}
        className="shrink-0 rounded-full bg-amber-700 px-4 py-2.5 text-xs font-semibold text-white"
      >
        로그인
      </Link>
    </aside>
  );
}
