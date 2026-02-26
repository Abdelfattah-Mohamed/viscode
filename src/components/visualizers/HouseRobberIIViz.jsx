export default function HouseRobberIIViz({ nums = [], stepState = {}, t }) {
  const { nums: stateNums = [], n, pass = 1, l = 0, r = 0, i, prev = 0, curr = 0, result1, result2, choice, done } = stepState;
  const arr = (stateNums?.length ? stateNums : nums) || [];
  const isDark = t._resolved === "dark";

  const inRange = (idx) => pass === 1 ? (idx >= l && idx <= r) : (idx >= l && idx <= r);
  const houseBorder = (idx) => {
    if (!inRange(idx)) return t.inkMuted + "44";
    if (idx !== i) return t.border;
    return choice === "rob" ? t.green : t.yellow;
  };
  const houseBg = (idx) => {
    if (!inRange(idx)) return t.inkMuted + "18";
    if (idx !== i) return isDark ? "#374151" : "#e5e7eb";
    return choice === "rob" ? t.green + "30" : t.yellow + "25";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        {pass !== undefined && !done && (
          <div style={{ padding: "6px 12px", borderRadius: 8, border: `2px solid ${pass === 1 ? t.blue : t.purple}`, background: (pass === 1 ? t.blue : t.purple) + "22", fontFamily: "'Caveat',cursive", fontWeight: 700, color: pass === 1 ? t.blue : t.purple }}>
            Pass {pass}: robRange({l}, {r}) {pass === 1 ? "(exclude last)" : "(exclude first)"}
          </div>
        )}
        {result1 != null && (
          <div style={{ padding: "6px 12px", borderRadius: 8, border: `2px solid ${t.border}`, background: t.surfaceAlt, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: t.ink }}>
            result1 = {result1}
          </div>
        )}
        {result2 != null && (
          <div style={{ padding: "6px 12px", borderRadius: 8, border: `2px solid ${t.border}`, background: t.surfaceAlt, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: t.ink }}>
            result2 = {result2}
          </div>
        )}
      </div>

      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
          houses (circle: first & last adjacent)
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, flexWrap: "wrap", paddingTop: 28 }}>
          {arr.map((val, idx) => (
            <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              {idx === i && choice && (
                <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.8em", fontWeight: 700, color: choice === "rob" ? t.green : t.inkMuted }}>
                  {choice}
                </span>
              )}
              <div style={{
                width: 48,
                height: 44,
                border: `2.5px solid ${houseBorder(idx)}`,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: "0.95em",
                fontWeight: 700,
                background: houseBg(idx),
                color: t.ink,
                opacity: inRange(idx) ? 1 : 0.5,
              }}>
                {val}
              </div>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7em", color: t.inkMuted }}>{idx}</span>
            </div>
          ))}
        </div>
      </div>

      {i >= 0 && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ padding: "8px 14px", border: `2px solid ${t.border}`, borderRadius: 8, background: isDark ? "#374151" : t.surfaceAlt }}>
            <span style={{ fontFamily: "'Caveat',cursive", color: t.inkMuted, marginRight: 6 }}>prev</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: t.ink }}>{prev}</span>
          </div>
          <div style={{ padding: "8px 14px", border: `2px solid ${t.yellow}`, borderRadius: 8, background: t.yellow + "20" }}>
            <span style={{ fontFamily: "'Caveat',cursive", color: t.inkMuted, marginRight: 6 }}>curr</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: t.yellow }}>{curr}</span>
          </div>
        </div>
      )}

      {done && (result1 != null || result2 != null) && (
        <div style={{ padding: "12px 18px", borderRadius: 10, border: `2px solid ${t.green}`, background: t.green + "22", fontFamily: "'JetBrains Mono',monospace", fontSize: "1.1em", fontWeight: 800, color: t.green }}>
          Answer: max({result1 ?? "—"}, {result2 ?? "—"}) = {Math.max(result1 ?? 0, result2 ?? 0)}
        </div>
      )}
    </div>
  );
}
