import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  buildAbsoluteUrl,
  buildTournamentOgPath,
  buildTournamentShareAlt,
  buildTournamentShareDescription,
  buildTournamentSharePath,
  buildTournamentShareTitle,
  parseTournamentShareParams,
  getRequestOrigin,
} from "@/lib/share/match-share";

type ShareTournamentPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

async function getShareMetadata(
  params?: Record<string, string | string[] | undefined>,
): Promise<Metadata> {
  const parsed = parseTournamentShareParams(params);

  if (!parsed.success) {
    return {
      title: "World Break",
      description: "개인 TCG 대전 기록 및 통계 웹앱",
    };
  }

  const headerStore = await headers();
  const origin = getRequestOrigin(headerStore);
  const payload = parsed.data;
  const pageUrl = buildAbsoluteUrl(origin, buildTournamentSharePath(payload));
  const imageUrl = buildAbsoluteUrl(origin, buildTournamentOgPath(payload));
  const title = buildTournamentShareTitle(payload);
  const description = buildTournamentShareDescription(payload);

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
          alt: buildTournamentShareAlt(payload),
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

export async function generateMetadata({
  searchParams,
}: ShareTournamentPageProps): Promise<Metadata> {
  const params = searchParams ? await searchParams : undefined;
  return getShareMetadata(params);
}

export default async function ShareTournamentPage({
  searchParams,
}: ShareTournamentPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const parsed = parseTournamentShareParams(params);

  if (!parsed.success) {
    redirect("/");
  }

  const share = parsed.data;
  const ogImagePath = buildTournamentOgPath(share);
  const badges = [
    share.result === "win" ? "우세" : "열세",
    `${share.wins}승 ${share.losses}패`,
    share.format.toUpperCase(),
    `${share.rounds} Rounds`,
    share.date,
  ];

  return (
    <main className="min-h-screen bg-paper px-6 py-10 text-on-surface">
      <section className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <header className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">World Break</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">대회 공유 카드</h1>
          <p className="mt-3 text-sm leading-6 text-muted">{buildTournamentShareDescription(share)}</p>
        </header>

        <article className="rounded-[32px] border border-line/70 bg-surface-container-low p-4 shadow-float">
          <Image
            src={ogImagePath}
            alt={buildTournamentShareAlt(share)}
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
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">Tournament Result</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{share.myDeck}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              {share.game} · {share.wins}승 {share.losses}패 · {share.rounds} Rounds
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
