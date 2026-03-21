import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { HeaderActions } from "@/components/header-actions";
import { getUserDisplayInfo, requireUser } from "@/lib/auth";

import { signOut } from "../login/actions";

export default async function SettingsPage() {
  const user = await requireUser();
  const display = getUserDisplayInfo(user);

  return (
    <AppShell
      title="설정"
      headerRight={<HeaderActions avatarUrl={display.avatarUrl} name={display.name} />}
    >
      <div className="mx-auto flex max-w-md flex-col gap-6 pb-8">
        <section className="overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
          <SettingsLink
            href="/settings/decks"
            label="덱 관리"
            description="게임별로 사용하는 덱을 정리합니다."
          />
          <SettingsLink
            href="/settings/tags"
            label="태그 관리"
            description="경기 분류용 태그를 생성하고 정리합니다."
          />
          <SettingsLink
            href="/settings/export"
            label="CSV 내보내기"
            description="조건에 맞는 기록을 CSV로 받습니다."
          />
        </section>

        <section className="overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-paper"
            >
              <span>
                <span className="block text-sm font-semibold text-danger">로그아웃</span>
                <span className="mt-1 block text-xs text-muted">현재 세션을 종료합니다.</span>
              </span>
              <svg viewBox="0 0 24 24" fill="none" className="size-4 shrink-0 text-danger" aria-hidden="true">
                <path
                  d="M9 18l6-6-6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>
        </section>
      </div>
    </AppShell>
  );
}

function SettingsLink({
  href,
  label,
  description,
}: {
  href: string;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between border-b border-line px-5 py-4 transition-colors last:border-b-0 hover:bg-paper"
    >
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-muted">{description}</span>
      </span>
      <svg viewBox="0 0 24 24" fill="none" className="size-4 shrink-0 text-muted" aria-hidden="true">
        <path
          d="M9 18l6-6-6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}
