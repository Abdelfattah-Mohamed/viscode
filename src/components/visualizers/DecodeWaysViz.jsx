export default function DecodeWaysViz({ s = "", stepState = {}, t }) {
  const { s: sArr = [], dp = [], i = 0, highlight = [], contrib, done } = stepState;
  const chars = Array.isArray(sArr) && sArr.length ? sArr : (typeof s === "string" ? s.split("") : []);
  const isDark = t._resolved === "dark";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
          string s (digits)
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {chars.map((c, idx) => (
            <div
              key={idx}
              style={{
                width: 40,
                height: 40,
                border: `2.5px solid ${highlight.includes(idx) ? t.yellow : t.border}`,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: "1.1em",
                fontWeight: 700,
                background: highlight.includes(idx) ? t.yellow + "30" : (isDark ? "#374151" : t.surface),
                color: t.ink,
              }}
            >
              {c}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
          {chars.map((_, idx) => (
            <span key={idx} style={{ fontFamily: "'Caveat',cursive", fontSize: "0.75em", color: t.inkMuted, width: 40, textAlign: "center" }}>{idx}</span>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
          dp[i] = ways to decode s[0..i]
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(dp || []).map((val, idx) => {
            const isCurrent = idx === i;
            const isContrib = contrib != null && idx === contrib;
            return (
              <div
                key={idx}
                style={{
                  minWidth: 44,
                  padding: "8px 10px",
                  border: `2px solid ${isCurrent ? t.yellow : isContrib ? t.green : t.border}`,
                  borderRadius: 8,
                  background: isCurrent ? t.yellow + "28" : isContrib ? t.green + "22" : (isDark ? "#374151" : "#e5e7eb"),
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: "1em",
                  fontWeight: 700,
                  color: t.ink,
                  textAlign: "center",
                }}
              >
                {val}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
          {(dp || []).map((_, idx) => (
            <span key={idx} style={{ fontFamily: "'Caveat',cursive", fontSize: "0.75em", color: t.inkMuted, minWidth: 44, textAlign: "center" }}>
              {idx === 0 ? "∅" : `i=${idx}`}
            </span>
          ))}
        </div>
      </div>

      {done && dp.length > 0 && (
        <div style={{ padding: "12px 18px", borderRadius: 10, border: `2px solid ${t.green}`, background: t.green + "22", fontFamily: "'JetBrains Mono',monospace", fontSize: "1.15em", fontWeight: 800, color: t.green }}>
          Answer: {dp[dp.length - 1]}
        </div>
      )}
    </div>
  );
}
