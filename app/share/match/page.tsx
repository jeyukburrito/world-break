import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";

import {
  buildAbsoluteUrl,
  buildMatchOgPath,
  buildMatchShareAlt,
  buildMatchShareDescription,
  buildMatchSharePath,
  buildMatchShareTitle,
  getMatchOrderLabel,
  getMatchPhaseLabel,
  getMatchResultLabel,
  getRequestOrigin,
  parseMatchShareParams,
} from "@/lib/share/match-share";

type ShareMatchPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

async function getShareMetadata(params?: Record<string, string | string[] | undefined>): Promise<Metadata> {
  const parsed = parseMatchShareParams(params);

  if (!parsed.success) {
    return {
      title: "World Break",
      description: "개인 TCG 대전 기록 및 통계 웹앱",
    };
  }

  const headerStore = await headers();
  const origin = getRequestOrigin(headerStore);
  const payload = parsed.data;
  const pageUrl = buildAbsoluteUrl(origin, buildMatchSharePath(payload));
  const imageUrl = buildAbsoluteUrl(origin, buildMatchOgPath(payload));
  const title = buildMatchShareTitle(payload);
  const description = buildMatchShareDescription(payload);

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: pageUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: buildMatchShareAlt(payload),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export async function generateMetadata({ searchParams }: ShareMatchPageProps): Promise<Metadata> {
  const params = searchParams ? await searchParams : undefined;
  return getShareMetadata(params);
}

export default async function ShareMatchPage({ searchParams }: ShareMatchPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const parsed = parseMatchShareParams(params);

  if (!parsed.success) {
    return (
      <main className="min-h-screen bg-paper px-6 py-10 text-on-surface">
        <section className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 text-center">
          <p className="text-sm text-muted">공유 링크가 올바르지 않습니다.</p>
          <Link href="/" className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white">
            World Break 홈으로
          </Link>
        </section>
      </main>
    );
  }

  const share = parsed.data;
  const ogImagePath = buildMatchOgPath(share);
  const badges = [
    getMatchResultLabel(share.result),
    share.score ? `${share.format.toUpperCase()} ${share.score}` : share.format.toUpperCase(),
    getMatchOrderLabel(share.order),
    getMatchPhaseLabel(share.phase),
    share.date,
  ].filter(Boolean) as string[];

  return (
    <main className="min-h-screen bg-paper px-6 py-10 text-on-surface">
      <section className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <header className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">World Break</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">매치 공유 카드</h1>
          <p className="mt-3 text-sm leading-6 text-muted">{buildMatchShareDescription(share)}</p>
        </header>

        <article className="rounded-[32px] border border-line/70 bg-surface-container-low p-4 shadow-float">
          <Image
            src={ogImagePath}
            alt={buildMatchShareAlt(share)}
            width={1200}
            height={630}
            unoptimized
            className="w-full rounded-[24px] border border-line/60"
          />

          <div className="mt-5 flex flex-wrap gap-2">
            {badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-line/60 bg-paper px-3 py-1.5 text-xs font-semibold text-muted"
              >
                {badge}
              </span>
            ))}
          </div>

          <div className="mt-5 rounded-[24px] bg-paper/70 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">Matchup</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              {share.myDeck} vs {share.opponentDeck}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              {share.game} · {getMatchPhaseLabel(share.phase)} · {getMatchOrderLabel(share.order)}
              {share.round ? ` · Round ${share.round}` : ""}
            </p>
          </div>
        </article>

        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white"
        >
          나도 기록하기 → World Break
        </Link>
      </section>
    </main>
  );
}
