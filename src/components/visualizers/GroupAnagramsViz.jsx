export default function GroupAnagramsViz({ strs = [], stepState = {}, t }) {
  const arr = Array.isArray(strs) ? strs : (typeof strs === "string" ? strs.split(",").map((x) => x.trim()).filter(Boolean) : []);
  const {
    i: currentI = -1,
    s: currentStr = "",
    key: currentKey = "",
    map = {},
    action = null,
    done = false,
  } = stepState;
  const isDark = t._resolved === "dark";

  const mapEntries = Object.entries(map || {});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 4 }}>
        Group by key: key = sorted(s). Anagrams share the same key.
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        {currentI >= 0 && (
          <div style={{ padding: "8px 14px", border: `2px solid ${t.border}`, borderRadius: 8, background: isDark ? "#374151" : t.surfaceAlt }}>
            <span style={{ fontFamily: "'Caveat',cursive", color: t.inkMuted, marginRight: 6 }}>i</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: t.blue }}>{currentI}</span>
          </div>
        )}
        {currentStr && (
          <div style={{ padding: "8px 14px", border: `2px solid ${t.border}`, borderRadius: 8, background: t.blue + "22" }}>
            <span style={{ fontFamily: "'Caveat',cursive", color: t.inkMuted, marginRight: 6 }}>s</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: t.ink }}>&quot;{currentStr}&quot;</span>
          </div>
        )}
        {currentKey && (
          <div style={{ padding: "8px 14px", border: `2px solid ${t.border}`, borderRadius: 8, background: t.yellow + "22" }}>
            <span style={{ fontFamily: "'Caveat',cursive", color: t.inkMuted, marginRight: 6 }}>key</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: t.ink }}>&quot;{currentKey}&quot;</span>
          </div>
        )}
        {action && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", color: t.inkMuted, fontStyle: "italic" }}>{action}</span>}
      </div>

      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
          strs
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {arr.map((str, idx) => (
            <div
              key={idx}
              style={{
                padding: "8px 14px",
                border: `2px solid ${idx === currentI ? t.blue : t.border}`,
                borderRadius: 8,
                background: idx === currentI ? t.blue + "25" : (isDark ? "#374151" : "#e5e7eb"),
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: "1em",
                fontWeight: 700,
                color: t.ink,
              }}
            >
              &quot;{str}&quot; {idx === currentI && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.8em", color: t.blue }}>(i={idx})</span>}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
          map (key → list of strings)
        </div>
        {mapEntries.length === 0 ? (
          <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", color: t.inkMuted, fontStyle: "italic" }}>{"{ }  empty"}</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {mapEntries.map(([k, list]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, padding: "6px 12px", background: t.purple + "30", borderRadius: 8, border: `2px solid ${t.purple}`, color: t.ink }}>key &quot;{k}&quot;</span>
                <span style={{ color: t.inkMuted }}>→</span>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(list || []).map((item, j) => (
                    <span key={j} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.95em", padding: "6px 12px", background: t.green + "22", border: `2px solid ${t.green}50`, borderRadius: 8, color: t.ink }}>&quot;{item}&quot;</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {done && mapEntries.length > 0 && (
        <div style={{ padding: "12px 18px", borderRadius: 10, border: `2px solid ${t.green}`, background: t.green + "22", fontFamily: "'Caveat',cursive", fontSize: "1.05em", fontWeight: 700, color: t.green }}>
          Return map.values() → {mapEntries.length} group(s)
        </div>
      )}
    </div>
  );
}
