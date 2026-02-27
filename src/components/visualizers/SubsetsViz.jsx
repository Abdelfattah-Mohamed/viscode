export default function SubsetsViz({ nums = [], stepState = {}, t }) {
  const arr = Array.isArray(nums) ? nums : [];
  const {
    i: start = 0,
    j: loopJ = -1,
    path = [],
    res = [],
    action = null,
    done = false,
  } = stepState;
  const isDark = t._resolved === "dark";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 4 }}>
        Backtracking: at each step add current subset to result, then try including each remaining element.
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ padding: "8px 14px", border: `2px solid ${t.border}`, borderRadius: 8, background: isDark ? "#374151" : t.surfaceAlt }}>
          <span style={{ fontFamily: "'Caveat',cursive", color: t.inkMuted, marginRight: 6 }}>i (start)</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: t.blue }}>{start}</span>
        </div>
        {loopJ >= 0 && (
          <div style={{ padding: "8px 14px", border: `2px solid ${t.border}`, borderRadius: 8, background: isDark ? "#374151" : t.surfaceAlt }}>
            <span style={{ fontFamily: "'Caveat',cursive", color: t.inkMuted, marginRight: 6 }}>j (loop)</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: t.yellow }}>{loopJ}</span>
          </div>
        )}
        {action && (
          <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", color: t.inkMuted, fontStyle: "italic" }}>{action}</span>
        )}
      </div>

      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
          nums
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(arr || []).map((val, idx) => (
            <div
              key={idx}
              style={{
                minWidth: 44,
                padding: "8px 10px",
                border: `2px solid ${idx === loopJ ? t.yellow : t.border}`,
                borderRadius: 8,
                background: idx === loopJ ? t.yellow + "30" : (isDark ? "#374151" : "#e5e7eb"),
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
        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
          {arr.map((_, idx) => (
            <span key={idx} style={{ fontFamily: "'Caveat',cursive", fontSize: "0.75em", color: t.inkMuted, minWidth: 44, textAlign: "center" }}>{idx}</span>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
          path (current subset)
        </div>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "1.1em", fontWeight: 700, color: t.yellow, padding: "12px 16px", border: `2px solid ${t.border}`, borderRadius: 8, background: isDark ? "#1f2937" : t.surface }}>
          {(path || []).length ? `[${path.join(", ")}]` : "[]"}
        </div>
      </div>

      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
          res (subsets so far)
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 180, overflow: "auto" }}>
          {(res || []).length === 0 && (
            <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", color: t.inkMuted, fontStyle: "italic" }}>none yet</div>
          )}
          {(res || []).map((r, idx) => (
            <div key={idx} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.95em", fontWeight: 600, color: t.green, padding: "8px 12px", border: `2px solid ${t.green}50`, borderRadius: 6, background: t.green + "15" }}>
              [{Array.isArray(r) ? r.join(", ") : r}]
            </div>
          ))}
        </div>
      </div>

      {done && (
        <div style={{ padding: "12px 18px", borderRadius: 10, border: `2px solid ${t.green}`, background: t.green + "22", fontFamily: "'JetBrains Mono',monospace", fontSize: "1.05em", fontWeight: 800, color: t.green }}>
          Done: {res?.length ?? 0} subset(s)
        </div>
      )}
    </div>
  );
}
