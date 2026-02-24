export default function DuplicateViz({ nums, stepState = {}, t }) {
  const { i: ci = -1, seen = [], found = false, duplicate, done } = stepState;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", fontWeight: 600, color: t.inkMuted, marginBottom: 10 }}>nums</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 48 }}>
          {(nums || []).map((val, idx) => {
            const active = idx === ci, isDup = found && idx === ci;
            return (
              <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative" }}>
                <div style={{ position: "absolute", bottom: "100%", marginBottom: 10, textAlign: "center" }}>
                  {active && !found && <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", fontWeight: 700, color: t.blue }}>i={idx}</div>}
                  {isDup && <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", color: t.red, fontWeight: 700 }}>dup!</div>}
                </div>
                <div style={{ width: 54, height: 54, border: `2.5px solid ${t.border}`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Caveat',cursive", fontSize: "1.4em", fontWeight: 700, background: isDup ? t.red + "55" : active ? t.yellow + "88" : t.surface, color: t.ink, transform: active ? "translateY(-8px) scale(1.1)" : "scale(1)", transition: "all 0.3s" }}>{val}</div>
                <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.75em", color: t.inkMuted }}>{idx}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>hash set (seen)</div>
        {seen.length === 0
          ? <div style={{ fontFamily: "'Caveat',cursive", color: t.inkMuted, fontStyle: "italic" }}>{"{ } empty"}</div>
          : <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {seen.map((v, i) => <div key={i} style={{ padding: "6px 16px", border: `2px solid ${v === duplicate && found ? t.red : t.border}`, borderRadius: 8, fontFamily: "'Caveat',cursive", fontSize: "1.1em", fontWeight: 700, background: v === duplicate && found ? t.red + "22" : t.surfaceAlt, color: v === duplicate && found ? t.red : t.ink }}>{v}</div>)}
            </div>}
        {found && <div style={{ marginTop: 12, padding: "10px 14px", background: t.red + "22", border: `2px solid ${t.red}`, borderRadius: 10, fontFamily: "'Caveat',cursive", fontSize: "1.05em", fontWeight: 700, color: t.red }}>🔁 Duplicate: {duplicate} → true</div>}
        {done && !found && <div style={{ marginTop: 12, padding: "10px 14px", background: t.green + "22", border: `2px solid ${t.green}`, borderRadius: 10, fontFamily: "'Caveat',cursive", fontSize: "1.05em", fontWeight: 700, color: t.green }}>✅ No duplicates → false</div>}
      </div>
    </div>
  );
}
