export default function StockViz({ prices, stepState = {}, t }) {
  const { i: ci = -1, minPrice, maxProfit = 0, buyDay = -1, sellDay = -1 } = stepState;
  const ps = prices || [];
  const maxP = Math.max(1, ...ps);
  const currentPrice = ci >= 0 && ci < ps.length ? ps[ci] : null;
  const tradeActive = buyDay >= 0 && sellDay >= 0 && sellDay >= buyDay;

  const cardStyle = {
    border: `1.5px solid ${t.border}`,
    borderRadius: 12,
    background: t.surfaceAlt,
    padding: "10px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: 120,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ border: `1.5px solid ${t.border}`, borderRadius: 16, background: t.surface, boxShadow: t.shadowSm, padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.74rem", fontWeight: 900, letterSpacing: "0.02em", color: t.inkMuted, textTransform: "uppercase" }}>
            Price Timeline
          </div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.74rem", color: t.inkMuted }}>
            {ci >= 0 ? `Scanning day ${ci}` : "Ready"}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, minHeight: 150 }}>
          {ps.map((p, i) => {
            const h = Math.max(8, Math.round((p / maxP) * 100));
            const isBuy = i === buyDay, isSell = i === sellDay, isAct = i === ci;
            const barBg = isSell ? t.green + "cc" : isBuy ? t.blue + "cc" : isAct ? t.yellow : t.surfaceAlt;
            const barBorder = isSell ? t.green : isBuy ? t.blue : isAct ? t.yellow : t.border;
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1, minWidth: 42 }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", fontWeight: 800, color: isBuy ? t.blue : isSell ? t.green : isAct ? t.ink : t.inkMuted }}>
                  {p}
                </span>
                <div
                  style={{
                    width: "100%",
                    height: `${h}%`,
                    minHeight: 10,
                    background: barBg,
                    border: `2px solid ${barBorder}`,
                    borderRadius: "8px 8px 0 0",
                    boxShadow: isAct ? t.shadowSm : "none",
                    transition: "all 0.25s ease",
                  }}
                />
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.67rem", color: t.inkMuted }}>d{i}</span>
                {isBuy && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.64rem", color: t.blue, fontWeight: 800 }}>BUY</span>}
                {isSell && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.64rem", color: t.green, fontWeight: 800 }}>SELL</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
        <div style={cardStyle}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.68rem", color: t.inkMuted, textTransform: "uppercase", fontWeight: 900 }}>Current Price</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "1.1rem", fontWeight: 900, color: t.ink }}>{currentPrice ?? "-"}</span>
        </div>
        <div style={cardStyle}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.68rem", color: t.inkMuted, textTransform: "uppercase", fontWeight: 900 }}>Min Price So Far</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "1.1rem", fontWeight: 900, color: t.blue }}>
            {minPrice == null || minPrice === Infinity ? "-" : minPrice}
          </span>
        </div>
        <div style={cardStyle}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.68rem", color: t.inkMuted, textTransform: "uppercase", fontWeight: 900 }}>Max Profit</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "1.1rem", fontWeight: 900, color: t.green }}>{maxProfit}</span>
        </div>
        <div style={cardStyle}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.68rem", color: t.inkMuted, textTransform: "uppercase", fontWeight: 900 }}>Best Trade</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.92rem", fontWeight: 800, color: tradeActive ? t.ink : t.inkMuted }}>
            {tradeActive ? `d${buyDay} -> d${sellDay}` : "Not set yet"}
          </span>
        </div>
      </div>

      {maxProfit > 0 && tradeActive && (
        <div
          style={{
            border: `1.5px solid ${t.green}`,
            borderRadius: 12,
            background: t.green + "14",
            padding: "10px 12px",
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: "0.8rem",
            color: t.green,
            fontWeight: 800,
          }}
        >
          Trade summary: buy on day {buyDay} at {ps[buyDay]}, sell on day {sellDay} at {ps[sellDay]}, profit {maxProfit}.
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", borderRadius: 999, border: `1.5px solid ${t.border}`, background: t.surfaceAlt, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.68rem", color: t.inkMuted }}>
          <span style={{ width: 10, height: 10, borderRadius: 99, background: t.blue, border: `1px solid ${t.blue}` }} />
          buy marker
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", borderRadius: 999, border: `1.5px solid ${t.border}`, background: t.surfaceAlt, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.68rem", color: t.inkMuted }}>
          <span style={{ width: 10, height: 10, borderRadius: 99, background: t.green, border: `1px solid ${t.green}` }} />
          sell marker
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", borderRadius: 999, border: `1.5px solid ${t.border}`, background: t.surfaceAlt, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.68rem", color: t.inkMuted }}>
          <span style={{ width: 10, height: 10, borderRadius: 99, background: t.yellow, border: `1px solid ${t.yellow}` }} />
          current day
        </div>
      </div>
    </div>
  );
}
