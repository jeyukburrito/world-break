import { isSupabaseConfigured } from "@/lib/env";

import { signInWithGoogle, startAsGuest } from "./actions";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const errorMessages: Record<string, string> = {
  config_missing: "Supabase 환경 변수가 설정되지 않았습니다.",
  oauth_start_failed: "Google 로그인 시작에 실패했습니다.",
  oauth_callback_failed: "로그인 콜백 처리에 실패했습니다.",
  origin_missing: "현재 배포 주소를 확인할 수 없습니다.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const errorParam = typeof params?.error === "string" ? params.error : undefined;
  const nextParam = typeof params?.next === "string" ? params.next : "/dashboard";
  const errorMessage = errorParam ? errorMessages[errorParam] : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6">
      <section className="w-full max-w-sm text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          World Break
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-ink">로그인</h1>
        <div className="mt-8 rounded-3xl border border-line bg-surface p-6 shadow-sm">
          {!isSupabaseConfigured ? (
            <div className="mb-4 rounded-2xl border border-line bg-paper p-4 text-sm text-muted">
              개발 모드로 체험할 수 있습니다. Google 로그인은 잠시 비활성화됩니다.
            </div>
          ) : null}
          {errorMessage ? (
            <div className="mb-4 rounded-2xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
              {errorMessage}
            </div>
          ) : null}
          {isSupabaseConfigured ? (
            <>
              <form action={signInWithGoogle}>
                <input type="hidden" name="next" value={nextParam} />
                <button
                  type="submit"
                  className="w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white"
                >
                  Google로 로그인
                </button>
              </form>

              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-line" />
                <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted">또는</span>
                <div className="h-px flex-1 bg-line" />
              </div>
            </>
          ) : null}

          <form action={startAsGuest}>
            <button
              type="submit"
              className="w-full rounded-full border border-line bg-paper px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface"
            >
              게스트로 체험하기
            </button>
          </form>

          <p className="mt-3 text-xs leading-5 text-muted">
            계정 없이 먼저 사용해 볼 수 있습니다. Google 로그인은 별도 계정으로 시작됩니다.
          </p>
        </div>
      </section>
    </main>
  );
}
