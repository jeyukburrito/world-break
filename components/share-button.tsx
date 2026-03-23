"use client";

import { CLIENT_TOAST_EVENT, type ClientToastDetail } from "@/lib/toast";

type ShareButtonProps = {
  href: string;
  tone?: "paper" | "surface";
  label?: string;
};

function pushToast(text: string) {
  window.dispatchEvent(
    new CustomEvent<ClientToastDetail>(CLIENT_TOAST_EVENT, {
      detail: { text },
    }),
  );
}

export function ShareButton({ href, tone = "paper", label = "공유" }: ShareButtonProps) {
  const backgroundClass = tone === "surface" ? "bg-surface" : "bg-paper";

  async function handleClick() {
    const url = new URL(href, window.location.origin).toString();

    if (navigator.share) {
      try {
        await navigator.share({ url });
        window.gtag?.("event", "match_share_native");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      window.gtag?.("event", "match_share_copy");
      pushToast("공유 링크를 복사했습니다.");
    } catch {
      window.gtag?.("event", "match_share_copy_failed");
      pushToast("공유 링크 복사에 실패했습니다.");
    }
  }

  return (
    <button
      type="button"
      onClick={() => {
        void handleClick();
      }}
      className={`inline-flex items-center gap-1 rounded-full border border-line/60 ${backgroundClass} px-4 py-2 text-sm font-semibold text-ink`}
    >
      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
        share
      </span>
      <span>{label}</span>
    </button>
  );
}
