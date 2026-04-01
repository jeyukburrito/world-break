"use client";

import { useState, useTransition } from "react";

import { saveTournamentScorecard } from "./actions";

type SaveScorecardButtonProps = {
  sessionId: string;
  existingUrl: string | null;
};

export function SaveScorecardButton({
  sessionId,
  existingUrl,
}: SaveScorecardButtonProps) {
  const [savedUrl, setSavedUrl] = useState(existingUrl);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setError(null);

    startTransition(() => {
      void (async () => {
        try {
          const { scorecardUrl } = await saveTournamentScorecard(sessionId);
          setSavedUrl(scorecardUrl);
        } catch (saveError) {
          setError(
            saveError instanceof Error ? saveError.message : "성적표 저장에 실패했습니다",
          );
        }
      })();
    });
  }

  if (savedUrl) {
    return (
      <section className="space-y-3 rounded-[32px] bg-surface-container-low p-5 shadow-sm">
        <p className="text-sm font-medium text-success">성적표가 저장되었습니다.</p>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <div className="flex gap-2">
          <a
            href={savedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white"
          >
            PNG 열기
          </a>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-full border border-line px-4 py-3 text-sm font-semibold text-muted disabled:opacity-60"
          >
            {isPending ? "재저장 중..." : "재저장"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3 rounded-[32px] bg-surface-container-low p-5 shadow-sm">
      <div>
        <p className="text-base font-semibold text-ink">성적표 PNG 저장</p>
        <p className="mt-1 text-sm text-muted">
          결과 이미지를 생성해 보관용 링크로 저장합니다.
        </p>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        className="inline-flex w-full items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isPending ? "성적표 저장 중..." : "성적표 저장"}
      </button>
    </section>
  );
}
