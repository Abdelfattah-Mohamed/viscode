export default function ArrayVisualizer({ nums, stepState = {}, t }) {
  const { highlight = [], found = false, i: ci, map = {}, complement } = stepState;
  const cellBg = idx => found && highlight.includes(idx) ? t.green : highlight.includes(idx) ? t.yellow : t.surface;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95rem", fontWeight: 600, color: t.inkMuted, marginBottom: 10 }}>
          nums <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem" }}>(target = {stepState.target ?? "?"})</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, flexWrap: "wrap", paddingTop: 64 }}>
          {nums.map((val, idx) => (
            <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative" }}>
              <div style={{ position: "absolute", bottom: "100%", marginBottom: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, whiteSpace: "nowrap" }}>
                {idx === ci && !found && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1rem", fontWeight: 700, color: t.blue }}>i={idx}</span>}
                {complement !== undefined && !found && idx === ci && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.92rem", color: t.purple }}>need {complement}</span>}
                {found && highlight.includes(idx) && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1.1rem", color: t.green, fontWeight: 700 }}>✓</span>}
              </div>
              <div style={{ width: 54, height: 54, border: `2.5px solid ${t.border}`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Caveat',cursive", fontSize: "1.4rem", fontWeight: 700, background: cellBg(idx), color: t.ink, transform: highlight.includes(idx) ? "translateY(-8px) scale(1.1)" : "scale(1)", boxShadow: highlight.includes(idx) ? t.shadowSm : "none", transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}>{val}</div>
              <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.75rem", color: t.inkMuted }}>{idx}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95rem", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>
          hash map <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem" }}>{"{value → index}"}</span>
        </div>
        {Object.keys(map).length === 0
          ? <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95rem", color: t.inkMuted, fontStyle: "italic" }}>{"{ }  empty"}</div>
          : <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {Object.entries(map).map(([k, v]) => (
                <div key={k} style={{ display: "flex", border: `2px solid ${t.border}`, borderRadius: 8, overflow: "hidden", fontFamily: "'Caveat',cursive", fontSize: "1.05rem", fontWeight: 600, boxShadow: t.shadowSm, animation: "popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}>
                  <span style={{ padding: "3px 10px", background: t.purple, color: "#fff", borderRight: `2px solid ${t.border}` }}>{k}</span>
                  <span style={{ padding: "3px 10px", background: t.surfaceAlt, color: t.ink }}>→ {v}</span>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  );
}
