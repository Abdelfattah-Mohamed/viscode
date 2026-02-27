export default function EncodeDecodeViz({ s = "", stepState = {}, t = {} }) {
  const str = typeof s === "string" ? s : "";
  const chars = str ? str.split("") : [];
  const {
    i = 0,
    res = [],
    len = null,
    token = "",
    done = false,
  } = stepState;

  const n = chars.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 4 }}>
        Decode: read length before #, then read that many chars. Format: length#string
      </div>

      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
          encoded string s
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, flexWrap: "wrap", paddingTop: 40 }}>
          {chars.map((c, idx) => {
            const isI = idx === i && !done;
            const isHash = c === "#";
            return (
              <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, position: "relative" }}>
                <div style={{ position: "absolute", bottom: "100%", marginBottom: 6, whiteSpace: "nowrap" }}>
                  {isI && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", fontWeight: 700, color: t.blue }}>i</span>}
                </div>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    border: `2.5px solid ${isI ? t.blue : isHash ? t.purple : t.border}`,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: "1em",
                    fontWeight: 700,
                    background: isI ? t.blue + "25" : isHash ? t.purple + "20" : t.surface,
                    color: t.ink,
                    transform: isI ? "translateY(-2px) scale(1.05)" : "scale(1)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {c === "#" ? "#" : c}
                </div>
                <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.7em", color: t.inkMuted }}>{idx}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        <div style={{ padding: "8px 14px", border: `2px solid ${t.border}`, borderRadius: 8, background: t.surfaceAlt }}>
          <span style={{ fontFamily: "'Caveat',cursive", color: t.inkMuted, marginRight: 6 }}>i</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: t.blue }}>{i}</span>
        </div>
        {len != null && (
          <div style={{ padding: "8px 14px", border: `2px solid ${t.border}`, borderRadius: 8, background: t.surfaceAlt }}>
            <span style={{ fontFamily: "'Caveat',cursive", color: t.inkMuted, marginRight: 6 }}>len</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: t.purple }}>{len}</span>
          </div>
        )}
        {token && !done && (
          <div style={{ padding: "8px 14px", border: `2px solid ${t.border}`, borderRadius: 8, background: t.green + "20" }}>
            <span style={{ fontFamily: "'Caveat',cursive", color: t.inkMuted, marginRight: 6 }}>token</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: t.green }}>&quot;{token}&quot;</span>
          </div>
        )}
        {done && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1.05em", fontWeight: 700, color: t.green }}>✅ Done</span>}
      </div>

      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
          res (decoded strings)
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          {res.length === 0 ? (
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", color: t.inkMuted, fontStyle: "italic" }}>[]</span>
          ) : (
            res.map((r, idx) => (
              <div key={idx} style={{ padding: "6px 12px", border: `2px solid ${t.border}`, borderRadius: 8, background: t.surfaceAlt, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.9em", fontWeight: 600, color: t.green }}>
                &quot;{r}&quot;
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
