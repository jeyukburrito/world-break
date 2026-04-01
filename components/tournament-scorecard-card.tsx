const MAX_VISIBLE_ROUNDS = 8;

const COLORS = {
  background: "#12131d",
  card: "rgba(26, 27, 38, 0.94)",
  border: "rgba(90, 91, 122, 0.3)",
  text: "#e4e5f0",
  subtext: "#9899b8",
  win: "#30d158",
  loss: "#ff6b6b",
};

export type ScorecardSession = {
  name: string | null;
  playedOn: Date;
  myDeck: { name: string; game: { name: string } };
  matches: Array<{
    opponentDeckName: string | null;
    wins: number;
    losses: number;
    isMatchWin: boolean;
  }>;
};

function StormMark() {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        width: 40,
        height: 40,
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
          inset: 7,
          borderRadius: 9999,
          border: "3px solid rgba(123, 141, 255, 0.45)",
          borderTopColor: "transparent",
          borderLeftColor: "transparent",
        }}
      />
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: 9999,
          backgroundColor: COLORS.win,
        }}
      />
    </div>
  );
}

function ScoreDots({ wins, losses }: { wins: number; losses: number }) {
  const winDots = Array.from({ length: Math.max(0, wins) }, () => "●").join(" ");
  const lossDots = Array.from({ length: Math.max(0, losses) }, () => "○").join(" ");

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 6,
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {winDots ? <span style={{ color: COLORS.win }}>{winDots}</span> : null}
      {lossDots ? <span style={{ color: COLORS.subtext }}>{lossDots}</span> : null}
      {!winDots && !lossDots ? <span style={{ color: COLORS.subtext }}>기록 없음</span> : null}
    </div>
  );
}

export function TournamentScorecardCard({ session }: { session: ScorecardSession }) {
  const visibleMatches = session.matches.slice(0, MAX_VISIBLE_ROUNDS);
  const hiddenRounds = Math.max(0, session.matches.length - MAX_VISIBLE_ROUNDS);
  const matchWins = session.matches.filter((match) => match.isMatchWin).length;
  const matchLosses = session.matches.length - matchWins;
  const winRate =
    session.matches.length > 0 ? Math.round((matchWins / session.matches.length) * 100) : 0;
  const dateLabel = session.playedOn.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        backgroundColor: COLORS.background,
        color: COLORS.text,
        padding: 28,
        fontFamily: "Noto Sans KR",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -64,
          left: -52,
          width: 220,
          height: 220,
          borderRadius: 9999,
          backgroundColor: "rgba(61, 90, 254, 0.16)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -76,
          bottom: -108,
          width: 260,
          height: 260,
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
          borderRadius: 30,
          border: `1px solid ${COLORS.border}`,
          backgroundColor: COLORS.card,
          padding: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <StormMark />
          <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
            <span
              style={{
                fontSize: 12,
                letterSpacing: 2.4,
                fontWeight: 700,
                color: COLORS.subtext,
              }}
            >
              WORLD BREAK
            </span>
            <span
              style={{
                marginTop: 10,
                fontSize: 30,
                fontWeight: 800,
                lineHeight: 1.12,
                letterSpacing: -1,
              }}
            >
              {session.myDeck.name}
            </span>
            <span
              style={{
                marginTop: 8,
                fontSize: 14,
                color: COLORS.subtext,
              }}
            >
              {session.myDeck.game.name} · {dateLabel}
            </span>
            {session.name ? (
              <span
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  color: "rgba(228, 229, 240, 0.82)",
                }}
              >
                {session.name}
              </span>
            ) : null}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            gap: 8,
            marginTop: 22,
          }}
        >
          {visibleMatches.length > 0 ? (
            visibleMatches.map((match, index) => {
              const opponentLabel = match.opponentDeckName?.trim()
                ? match.opponentDeckName
                : "상대 덱 미입력";

              return (
                <div
                  key={`${index}-${opponentLabel}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    borderRadius: 20,
                    border: `1px solid ${match.isMatchWin ? "rgba(48, 209, 88, 0.18)" : "rgba(255, 107, 107, 0.18)"}`,
                    backgroundColor: match.isMatchWin
                      ? "rgba(48, 209, 88, 0.08)"
                      : "rgba(255, 107, 107, 0.07)",
                    padding: "10px 12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      minWidth: 0,
                      flex: 1,
                      flexDirection: "column",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        letterSpacing: 1.8,
                        fontWeight: 700,
                        color: COLORS.subtext,
                      }}
                    >
                      ROUND {index + 1}
                    </span>
                    <span
                      style={{
                        marginTop: 4,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontSize: 15,
                        fontWeight: 700,
                        color:
                          opponentLabel === "상대 덱 미입력" ? COLORS.subtext : COLORS.text,
                      }}
                    >
                      {opponentLabel}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      minWidth: 118,
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 5,
                    }}
                  >
                    <ScoreDots wins={match.wins} losses={match.losses} />
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: match.isMatchWin ? COLORS.win : COLORS.loss,
                      }}
                    >
                      {match.isMatchWin ? "WIN" : "LOSS"}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div
              style={{
                display: "flex",
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 24,
                border: `1px dashed ${COLORS.border}`,
                color: COLORS.subtext,
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              라운드 기록 없음
            </div>
          )}

          {hiddenRounds > 0 ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 18,
                border: `1px solid ${COLORS.border}`,
                backgroundColor: "rgba(18, 19, 29, 0.75)",
                padding: "10px 12px",
                fontSize: 13,
                fontWeight: 700,
                color: COLORS.subtext,
              }}
            >
              외 {hiddenRounds}라운드
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 24,
            border: `1px solid ${COLORS.border}`,
            backgroundColor: "rgba(18, 19, 29, 0.82)",
            marginTop: 18,
            padding: "18px 16px",
          }}
        >
          <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.8 }}>
            <span style={{ color: COLORS.win }}>{matchWins}승</span>
            <span style={{ color: COLORS.subtext }}> · </span>
            <span style={{ color: COLORS.loss }}>{matchLosses}패</span>
          </span>
          <span
            style={{
              marginTop: 8,
              fontSize: 14,
              color: COLORS.subtext,
            }}
          >
            승률 {winRate}% · 총 {session.matches.length}라운드
          </span>
        </div>
      </div>
    </div>
  );
}
