export default function MinWindowViz({ s = "", target = "", stepState = {}, t: theme = {} }) {
  const str = stepState.s ?? s;
  const targetStr = stepState.t ?? target;
  const chars = String(str).split("");
  const { l = 0, r = -1, formed = 0, required = 0, bestWindow = "", done = false } = stepState;
  const inWindow = (i) => i >= l && i <= r && r >= 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", color: theme.inkMuted || "#666" }}>
        Find smallest window in <strong>s</strong> that contains all chars of <strong>t</strong>.
      </div>
      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.85em", color: theme.inkMuted, marginBottom: 6 }}>t = "{targetStr}"</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {String(targetStr).split("").map((c, i) => (
            <div key={i} style={{ width: 36, height: 36, border: `2px solid ${theme.purple}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, background: theme.purple + "18" }}>{c}</div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingTop: 24 }}>
        {chars.map((c, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
              border: `2.5px solid ${i === l ? theme.blue : i === r ? theme.purple : inWindow(i) ? theme.yellow : theme.border}`,
              background: inWindow(i) ? theme.yellow + "28" : theme.surface,
              fontFamily: "'JetBrains Mono',monospace", fontWeight: 700,
            }}>{c}</div>
            <span style={{ fontSize: "0.7em", color: theme.inkMuted }}>{i}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontFamily: "'Caveat',cursive", fontSize: "1em" }}>
        <span>formed: <strong>{formed}/{required}</strong></span>
        {bestWindow && <span>best: <strong style={{ color: theme.green }}>"{bestWindow}"</strong></span>}
        {done && <span style={{ color: theme.green }}>✅</span>}
      </div>
    </div>
  );
}
