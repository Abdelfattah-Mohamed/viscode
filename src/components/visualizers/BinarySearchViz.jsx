export default function BinarySearchViz({ nums, stepState = {}, t }) {
  const { left = -1, right = -1, mid = -1, found = -1, eliminated = [] } = stepState;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", color: t.inkMuted, marginBottom: 10 }}>nums (sorted)</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 50 }}>
          {(nums || []).map((val, idx) => {
            const isFound = idx === found, isMid = idx === mid && found === -1, isElim = eliminated.includes(idx);
            return (
              <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative" }}>
                <div style={{ position: "absolute", bottom: "100%", marginBottom: 8, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  {idx === left  && found === -1 && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.85em", fontWeight: 700, color: t.blue }}>L</span>}
                  {idx === right && found === -1 && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.85em", fontWeight: 700, color: t.purple }}>R</span>}
                  {isMid   && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.85em", fontWeight: 700, color: t.yellow }}>mid</span>}
                  {isFound && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1em",    fontWeight: 700, color: t.green  }}>found</span>}
                </div>
                <div style={{ width: 54, height: 54, border: `2px solid ${isFound ? t.green : isMid ? t.yellow : t.border}`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Caveat',cursive", fontSize: "1.3em", fontWeight: 700, background: isFound ? t.green + "44" : isMid ? t.yellow + "44" : t.surface, color: isElim ? t.inkMuted : t.ink, opacity: isElim ? 0.25 : 1, transform: isFound || isMid ? "translateY(-8px) scale(1.1)" : "scale(1)", transition: "all 0.3s" }}>{val}</div>
                <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.75em", color: t.inkMuted }}>{idx}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {[{ label: "L", val: left  >= 0 ? left  : "—", color: t.blue   },
          { label: "R", val: right >= 0 ? right : "—", color: t.purple },
          { label: "mid", val: mid >= 0 ? mid   : "—", color: t.yellow }].map(x => (
          <div key={x.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", border: `2px solid ${t.border}`, borderRadius: 10, background: t.surfaceAlt }}>
            <span style={{ fontFamily: "'Caveat',cursive", color: t.inkMuted, fontWeight: 600 }}>{x.label}</span>
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1.5em", fontWeight: 700, color: x.color }}>{x.val}</span>
          </div>
        ))}
        {found >= 0 && <div style={{ display: "flex", alignItems: "center", padding: "8px 16px", border: `2px solid ${t.green}`, borderRadius: 10, background: t.green + "18" }}><span style={{ fontFamily: "'Caveat',cursive", fontSize: "1.05em", fontWeight: 700, color: t.green }}>✅ Found at index {found}</span></div>}
      </div>
    </div>
  );
}
