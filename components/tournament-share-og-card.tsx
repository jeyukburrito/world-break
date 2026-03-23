import {
  buildTournamentShareFooterItems,
  type TournamentSharePayload,
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
              TOURNAMENT SHARE
            </span>
            <span style={{ marginTop: 6, fontSize: 34, fontWeight: 700 }}>World Break</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 56, fontWeight: 800, letterSpacing: -2 }}>
            Tournament preview unavailable
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
            Tournament share card
          </span>
          <span style={{ fontSize: 22, fontWeight: 700 }}>world-break</span>
        </div>
      </div>
    </div>
  );
}

export function TournamentShareOgCard({ share }: { share: TournamentSharePayload | null }) {
  if (!share) {
    return <FallbackCard />;
  }

  const isPositive = share.result === "win";
  const recordColor = isPositive ? "#30d158" : "#ff6b6b";
  const recordBackground = isPositive ? "rgba(48, 209, 88, 0.16)" : "rgba(255, 107, 107, 0.16)";
  const footerItems = buildTournamentShareFooterItems(share);

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
                TOURNAMENT SHARE
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
            {share.format.toUpperCase()}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 28,
            backgroundColor: "rgba(32, 33, 58, 0.85)",
            border: "1px solid rgba(90, 91, 122, 0.32)",
            marginTop: 32,
            padding: 32,
          }}
        >
          <span style={{ fontSize: 18, letterSpacing: 3, fontWeight: 700, color: "#9899b8" }}>
            MY DECK
          </span>
          <span
            style={{
              marginTop: 18,
              fontSize: 56,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -1.5,
              wordBreak: "break-word",
              textAlign: "center",
            }}
          >
            {share.myDeck}
          </span>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 9999,
              backgroundColor: recordBackground,
              border: `1px solid ${recordColor}55`,
              padding: "22px 34px",
            }}
          >
            <span
              style={{
                fontSize: 40,
                fontWeight: 800,
                color: recordColor,
                letterSpacing: 1,
              }}
            >
              {share.wins}W - {share.losses}L
            </span>
          </div>
          <span style={{ marginTop: 18, fontSize: 24, color: "#9899b8" }}>
            {share.rounds} Rounds · {share.game}
          </span>
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
