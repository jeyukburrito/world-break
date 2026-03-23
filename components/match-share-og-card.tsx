import type { CSSProperties } from "react";

import {
  buildMatchShareFooterItems,
  getMatchOrderLabel,
  getMatchPhaseLabel,
  getMatchResultBadge,
  type MatchSharePayload,
} from "@/lib/share/match-share";

function StormMark() {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        width: 48,
        height: 48,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 9999,
          border: "3px solid rgba(123, 141, 255, 0.85)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 8,
          borderRadius: 9999,
          border: "3px solid rgba(123, 141, 255, 0.45)",
          borderTopColor: "transparent",
          borderLeftColor: "transparent",
        }}
      />
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: 9999,
          backgroundColor: "#30d158",
        }}
      />
    </div>
  );
}

function labelStyle(): CSSProperties {
  return {
    fontSize: 18,
    letterSpacing: 3,
    fontWeight: 700,
    color: "#9899b8",
  };
}

function columnStyle(): CSSProperties {
  return {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    borderRadius: 28,
    backgroundColor: "rgba(32, 33, 58, 0.85)",
    border: "1px solid rgba(90, 91, 122, 0.32)",
    padding: 28,
  };
}

function FooterChip({ text }: { text: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        borderRadius: 9999,
        backgroundColor: "rgba(18, 19, 29, 0.9)",
        border: "1px solid rgba(90, 91, 122, 0.3)",
        padding: "12px 18px",
        fontSize: 20,
        fontWeight: 600,
        color: "#e4e5f0",
      }}
    >
      {text}
    </div>
  );
}

function FallbackCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        backgroundColor: "#12131d",
        color: "#e4e5f0",
        padding: 48,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -64,
          left: -48,
          width: 280,
          height: 280,
          borderRadius: 9999,
          backgroundColor: "rgba(61, 90, 254, 0.18)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -72,
          bottom: -120,
          width: 320,
          height: 320,
          borderRadius: 9999,
          backgroundColor: "rgba(123, 141, 255, 0.16)",
        }}
      />
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          borderRadius: 40,
          border: "1px solid rgba(90, 91, 122, 0.3)",
          backgroundColor: "rgba(26, 27, 38, 0.92)",
          padding: 36,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <StormMark />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 20, letterSpacing: 3, fontWeight: 700, color: "#9899b8" }}>
              SHARE CARD
            </span>
            <span style={{ marginTop: 6, fontSize: 34, fontWeight: 700 }}>World Break</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 56, fontWeight: 800, letterSpacing: -2 }}>
            Match preview unavailable
          </span>
          <span style={{ marginTop: 14, fontSize: 24, color: "#9899b8" }}>
            Share parameters are missing, so a fallback card was rendered instead.
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: 9999,
            backgroundColor: "rgba(18, 19, 29, 0.9)",
            border: "1px solid rgba(90, 91, 122, 0.3)",
            padding: "18px 24px",
          }}
        >
          <span style={{ fontSize: 22, fontWeight: 600, color: "#9899b8" }}>
            Personal TCG match tracking
          </span>
          <span style={{ fontSize: 22, fontWeight: 700 }}>world-break</span>
        </div>
      </div>
    </div>
  );
}

export function MatchShareOgCard({ share }: { share: MatchSharePayload | null }) {
  if (!share) {
    return <FallbackCard />;
  }

  const resultColor = share.result === "win" ? "#30d158" : "#ff6b6b";
  const resultBackground = share.result === "win" ? "rgba(48, 209, 88, 0.16)" : "rgba(255, 107, 107, 0.16)";
  const footerItems = buildMatchShareFooterItems(share);
  const scoreLabel = share.score ? `${share.format.toUpperCase()} ${share.score}` : share.format.toUpperCase();

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        backgroundColor: "#12131d",
        color: "#e4e5f0",
        padding: 48,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -72,
          left: -52,
          width: 320,
          height: 320,
          borderRadius: 9999,
          backgroundColor: "rgba(61, 90, 254, 0.16)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -80,
          bottom: -112,
          width: 360,
          height: 360,
          borderRadius: 9999,
          backgroundColor: "rgba(123, 141, 255, 0.14)",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          flexDirection: "column",
          borderRadius: 40,
          border: "1px solid rgba(90, 91, 122, 0.3)",
          backgroundColor: "rgba(26, 27, 38, 0.94)",
          padding: 36,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <StormMark />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 18, letterSpacing: 3, fontWeight: 700, color: "#9899b8" }}>
                MATCH SHARE
              </span>
              <span style={{ marginTop: 6, fontSize: 32, fontWeight: 700 }}>World Break</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              borderRadius: 9999,
              backgroundColor: "rgba(61, 90, 254, 0.14)",
              border: "1px solid rgba(123, 141, 255, 0.28)",
              padding: "12px 18px",
              fontSize: 20,
              fontWeight: 700,
              color: "#b8c2ff",
            }}
          >
            {scoreLabel}
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, marginTop: 32, gap: 24, alignItems: "stretch" }}>
          <div style={columnStyle()}>
            <span style={labelStyle()}>MY DECK</span>
            <span
              style={{
                marginTop: 18,
                fontSize: 48,
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: -1.5,
                wordBreak: "break-word",
              }}
            >
              {share.myDeck}
            </span>
            <span style={{ marginTop: 16, fontSize: 24, color: "#9899b8" }}>{share.game}</span>
          </div>

          <div
            style={{
              display: "flex",
              width: 236,
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 9999,
                border: "1px solid rgba(90, 91, 122, 0.32)",
                backgroundColor: "rgba(18, 19, 29, 0.82)",
                padding: "10px 20px",
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: 4,
                color: "#9899b8",
              }}
            >
              VS
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 24,
                minWidth: 180,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 9999,
                backgroundColor: resultBackground,
                border: `1px solid ${resultColor}55`,
                padding: "18px 28px",
                fontSize: 34,
                fontWeight: 800,
                color: resultColor,
                letterSpacing: 2,
              }}
            >
              {getMatchResultBadge(share.result)}
            </div>
          </div>

          <div style={columnStyle()}>
            <span style={labelStyle()}>OPPONENT</span>
            <span
              style={{
                marginTop: 18,
                fontSize: 48,
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: -1.5,
                wordBreak: "break-word",
              }}
            >
              {share.opponentDeck}
            </span>
            <span style={{ marginTop: 16, fontSize: 24, color: "#9899b8" }}>
              {getMatchPhaseLabel(share.phase)} · {getMatchOrderLabel(share.order)}
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            marginTop: 28,
          }}
        >
          {footerItems.map((item) => (
            <FooterChip key={item} text={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
