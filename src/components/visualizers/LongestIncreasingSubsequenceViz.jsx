export default function LongestIncreasingSubsequenceViz({ nums = [], stepState = {}, t }) {
  const { nums: stateNums = [], tails = [], lisSeq = [], i = -1, pos = -1, extend, replace, done } = stepState;
  const arr = (stateNums?.length ? stateNums : nums) || [];
  const isDark = t._resolved === "dark";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
          nums
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {arr.map((val, idx) => (
            <div
              key={idx}
              style={{
                minWidth: 44,
                padding: "8px 10px",
                border: `2px solid ${idx === i ? t.yellow : t.border}`,
                borderRadius: 8,
                background: idx === i ? t.yellow + "30" : (isDark ? "#374151" : "#e5e7eb"),
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: "1em",
                fontWeight: 700,
                color: t.ink,
                textAlign: "center",
              }}
            >
              {val}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
          {arr.map((_, idx) => (
            <span key={idx} style={{ fontFamily: "'Caveat',cursive", fontSize: "0.75em", color: t.inkMuted, minWidth: 44, textAlign: "center" }}>{idx}</span>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
          tails helper array (not always an actual subsequence)
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          {(tails || []).length === 0 ? (
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.9em", color: t.inkMuted }}>[]</span>
          ) : (
            (tails || []).map((val, idx) => (
              <div
                key={idx}
                style={{
                  minWidth: 44,
                  padding: "8px 10px",
                  border: `2px solid ${idx === pos && (extend || replace) ? t.yellow : done ? t.green + "99" : t.border}`,
                  borderRadius: 8,
                  background: idx === pos && replace ? t.yellow + "40" : idx === pos && extend ? t.green + "30" : done ? t.green + "18" : (isDark ? "#374151" : "#e5e7eb"),
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: "1em",
                  fontWeight: 700,
                  color: t.ink,
                  textAlign: "center",
                }}
              >
                {val}
              </div>
            ))
          )}
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
          {(tails || []).map((_, idx) => (
            <span key={idx} style={{ fontFamily: "'Caveat',cursive", fontSize: "0.75em", color: t.inkMuted, minWidth: 44, textAlign: "center" }}>len={idx + 1}</span>
          ))}
        </div>
      </div>

      {done && (lisSeq || []).length > 0 && (
        <div style={{ border: `1.5px solid ${t.blue}`, background: t.blue + "14", borderRadius: 10, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.74em", color: t.inkMuted }}>
            One valid LIS sequence
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {lisSeq.map((v, idx) => (
              <div key={`lis-${idx}`} style={{ minWidth: 40, padding: "7px 9px", borderRadius: 8, border: `1.5px solid ${t.blue}88`, background: t.surface, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.9em", fontWeight: 800, color: t.ink, textAlign: "center" }}>
                {v}
              </div>
            ))}
          </div>
        </div>
      )}

      {done && (tails || []).length > 0 && (
        <div style={{ padding: "12px 18px", borderRadius: 10, border: `2px solid ${t.green}`, background: t.green + "22", fontFamily: "'JetBrains Mono',monospace", fontSize: "1.15em", fontWeight: 800, color: t.green }}>
          Answer: {tails.length}
        </div>
      )}
    </div>
  );
}
