export default function StockViz({ prices, stepState = {}, t }) {
  const { i: ci = -1, minPrice, maxProfit = 0, buyDay = -1, sellDay = -1 } = stepState;
  const ps = prices || [];
  const maxP = Math.max(1, ...ps);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", color: t.inkMuted, marginBottom: 10 }}>prices</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 130 }}>
          {ps.map((p, i) => {
            const h = Math.max(8, Math.round((p / maxP) * 100));
            const isBuy = i === buyDay, isSell = i === sellDay, isAct = i === ci;
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1 }}>
                <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.8em", fontWeight: 700, color: isBuy ? t.blue : isSell ? t.green : t.inkMuted }}>{p}</span>
                <div style={{ width: "100%", height: `${h}%`, background: isSell ? t.green : isBuy ? t.blue : isAct ? t.yellow : t.surfaceAlt, border: `2px solid ${t.border}`, borderRadius: "6px 6px 0 0", transition: "all 0.3s" }} />
                <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.7em", color: t.inkMuted }}>d{i}</span>
                {isBuy  && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.7em", color: t.blue,  fontWeight: 700 }}>buy</span>}
                {isSell && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.7em", color: t.green, fontWeight: 700 }}>sell</span>}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[{ label: "Min Price", val: minPrice == null || minPrice === Infinity ? "—" : minPrice, color: t.blue }, { label: "Max Profit", val: maxProfit, color: t.green }].map(x => (
          <div key={x.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", border: `2px solid ${t.border}`, borderRadius: 12, background: t.surfaceAlt }}>
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", color: t.inkMuted }}>{x.label}</span>
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1.8em", fontWeight: 700, color: x.color, transition: "color 0.3s" }}>{x.val}</span>
          </div>
        ))}
        {maxProfit > 0 && <div style={{ display: "flex", alignItems: "center", padding: "10px 18px", border: `2px solid ${t.green}`, borderRadius: 12, background: t.green + "18" }}><span style={{ fontFamily: "'Caveat',cursive", fontSize: "1.05em", fontWeight: 700, color: t.green }}>💰 Profit: {maxProfit}</span></div>}
      </div>
    </div>
  );
}
