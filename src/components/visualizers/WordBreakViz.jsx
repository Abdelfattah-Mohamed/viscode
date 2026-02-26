export default function WordBreakViz({ s = "", stepState = {}, t }) {
  const { s: sArr = [], dp = [], i, j, word, dict = [], highlight = [], done } = stepState;
  const chars = Array.isArray(sArr) && sArr.length ? sArr : (typeof s === "string" ? s.split("") : []);
  const isDark = t._resolved === "dark";
  const dpBg = (idx, isCurrent) => {
    if (done && idx === dp.length - 1) return t.green + "35";
    if (dp[idx]) return isDark ? "#059669" : "#10b981";
    return isCurrent ? t.yellow + "28" : (isDark ? "#374151" : "#e5e7eb");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
          string s
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {chars.map((c, idx) => (
            <div
              key={idx}
              style={{
                width: 36,
                height: 36,
                border: `2px solid ${highlight.includes(idx) ? t.yellow : t.border}`,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: "1em",
                fontWeight: 700,
                background: highlight.includes(idx) ? t.yellow + "30" : t.surface,
                color: t.ink,
              }}
            >
              {c}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
          {chars.map((_, idx) => (
            <span key={idx} style={{ fontFamily: "'Caveat',cursive", fontSize: "0.72em", color: t.inkMuted, width: 36, textAlign: "center" }}>{idx}</span>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
          dp — can we form s[0..i]?
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          {(dp || []).map((val, idx) => (
            <div
              key={idx}
              style={{
                minWidth: 40,
                padding: "8px 10px",
                border: `2px solid ${idx === i ? t.yellow : idx === j ? t.blue : t.border}`,
                borderRadius: 8,
                background: dpBg(idx, idx === i || idx === j),
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: "0.95em",
                fontWeight: 700,
                color: val ? (isDark ? "#fff" : "#065f46") : t.ink,
                textAlign: "center",
              }}
            >
              {val ? "T" : "F"}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
          {(dp || []).map((_, idx) => (
            <span key={idx} style={{ fontFamily: "'Caveat',cursive", fontSize: "0.72em", color: idx === i ? t.yellow : idx === j ? t.blue : t.inkMuted, minWidth: 40, textAlign: "center" }}>{idx}</span>
          ))}
        </div>
      </div>

      {dict.length > 0 && (
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", color: t.inkMuted }}>
          dict: <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, color: t.ink }}>{dict.join(", ")}</span>
        </div>
      )}

      {word && (
        <div style={{ padding: "8px 14px", borderRadius: 8, border: `2px solid ${t.yellow}`, background: t.yellow + "22", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.95em", fontWeight: 700, color: t.ink }}>
          checking s[{j}..{i}] = "{word}"
        </div>
      )}

      {done && dp.length > 0 && (
        <div style={{ padding: "12px 18px", borderRadius: 10, border: `2px solid ${t.green}`, background: t.green + "22", fontFamily: "'JetBrains Mono',monospace", fontSize: "1.15em", fontWeight: 800, color: t.green }}>
          Answer: {dp[dp.length - 1] ? "true" : "false"}
        </div>
      )}
    </div>
  );
}
