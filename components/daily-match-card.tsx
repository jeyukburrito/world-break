const MAX_MATCHES = 10;

const COLORS = {
  background: "#12131d",
  card: "rgba(26, 27, 38, 0.94)",
  border: "rgba(90, 91, 122, 0.3)",
  text: "#e4e5f0",
  subtext: "#9899b8",
  win: "#30d158",
  loss: "#ff6b6b",
};

export type DailyMatchEntry = {
  id: string;
  myDeckName: string;
  opponentDeckName: string;
  matchFormat: "bo1" | "bo3";
  wins: number;
  losses: number;
  isMatchWin: boolean;
};

export type DailySummaryData = {
  date: string; // "YYYY-MM-DD"
  matches: DailyMatchEntry[];
};

export function DailyMatchCard({ data }: { data: DailySummaryData }) {
  const displayMatches = data.matches.slice(0, MAX_MATCHES);
  const hiddenCount = Math.max(0, data.matches.length - MAX_MATCHES);
  const totalWins = data.matches.filter((m) => m.isMatchWin).length;
  const totalLosses = data.matches.length - totalWins;
  const winRate =
    data.matches.length > 0 ? Math.round((totalWins / data.matches.length) * 100) : 0;

  const uniqueDecks = [...new Set(displayMatches.map((m) => m.myDeckName))];
  const isSingleDeck = uniqueDecks.length <= 1;
  const singleDeckName = isSingleDeck ? (uniqueDecks[0] ?? null) : null;

  const [, month, day] = data.date.split("-");
  const dateLabel = `${month}/${day}`;

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
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            style={{ fontSize: 12, letterSpacing: 2.4, fontWeight: 700, color: COLORS.subtext }}
          >
            WORLD BREAK
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.subtext }}>{dateLabel}</span>
        </div>

        {/* Single deck header */}
        {isSingleDeck && singleDeckName ? (
          <div style={{ display: "flex", marginTop: 14 }}>
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>
              {singleDeckName}
            </span>
          </div>
        ) : null}

        {/* Divider */}
        <div
          style={{
            height: 1,
            backgroundColor: COLORS.border,
            marginTop: 16,
            marginBottom: 12,
          }}
        />

        {/* Match rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {displayMatches.length === 0 ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px 0",
                borderRadius: 18,
                border: `1px dashed ${COLORS.border}`,
                color: COLORS.subtext,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              오늘 기록 없음
            </div>
          ) : (
            displayMatches.map((match, index) => {
              const showDeckName =
                !isSingleDeck &&
                (index === 0 || displayMatches[index - 1].myDeckName !== match.myDeckName);
              const isBO3 = match.matchFormat === "bo3";
              const opponentLabel = match.opponentDeckName.trim() || "상대 덱 미입력";

              return (
                <div
                  key={match.id}
                  style={{ display: "flex", flexDirection: "column", gap: 0 }}
                >
                  {showDeckName ? (
                    <div
                      style={{
                        display: "flex",
                        marginBottom: 4,
                        marginTop: index === 0 ? 0 : 8,
                      }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.subtext }}>
                        {match.myDeckName}
                      </span>
                    </div>
                  ) : null}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      borderRadius: 18,
                      border: `1px solid ${match.isMatchWin ? "rgba(48, 209, 88, 0.18)" : "rgba(255, 107, 107, 0.18)"}`,
                      backgroundColor: match.isMatchWin
                        ? "rgba(48, 209, 88, 0.08)"
                        : "rgba(255, 107, 107, 0.07)",
                      padding: "8px 14px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          color:
                            opponentLabel === "상대 덱 미입력" ? COLORS.subtext : COLORS.text,
                        }}
                      >
                        vs {opponentLabel}
                      </span>
                      <span style={{ fontSize: 11, color: COLORS.subtext, marginTop: 2 }}>
                        {isBO3 ? `BO3 ${match.wins}-${match.losses}` : "BO1"}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: match.isMatchWin ? COLORS.win : COLORS.loss,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {match.isMatchWin ? "WIN" : "LOSE"}
                    </span>
                  </div>
                </div>
              );
            })
          )}

          {hiddenCount > 0 ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 14,
                border: `1px solid ${COLORS.border}`,
                padding: "8px 12px",
                fontSize: 12,
                fontWeight: 700,
                color: COLORS.subtext,
              }}
            >
              외 {hiddenCount}경기
            </div>
          ) : null}
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            backgroundColor: COLORS.border,
            marginTop: 16,
            marginBottom: 14,
          }}
        />

        {/* Summary footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
          }}
        >
          {data.matches.length > 0 ? (
            <>
              <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>
                <span style={{ color: COLORS.win }}>{totalWins}승</span>
                <span style={{ color: COLORS.subtext }}> · </span>
                <span style={{ color: COLORS.loss }}>{totalLosses}패</span>
              </span>
              <span style={{ fontSize: 13, color: COLORS.subtext }}>승률 {winRate}%</span>
            </>
          ) : (
            <span style={{ fontSize: 13, color: COLORS.subtext }}>기록 없음</span>
          )}
        </div>
      </div>
    </div>
  );
}
