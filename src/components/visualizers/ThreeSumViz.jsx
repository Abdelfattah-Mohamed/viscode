export default function ThreeSumViz({ nums = [], stepState = {}, t }) {
  const { nums: stateNums, i, left, right, triples = [], highlight = [], done } = stepState;
  const arr = stateNums && stateNums.length > 0 ? stateNums : nums;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 10 }}>nums (sorted)</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, flexWrap: "wrap", paddingTop: 56 }}>
          {arr.map((val, idx) => {
            const isI = idx === i;
            const isL = idx === left;
            const isR = idx === right;
            const isHighlight = highlight.includes(idx);
            const bg = done && isHighlight ? t.green + "33" : isHighlight ? t.yellow + "44" : isI ? t.blue + "22" : isL ? t.purple + "22" : isR ? t.purple + "22" : t.surface;
            const border = isI ? t.blue : isL || isR ? t.purple : isHighlight ? t.yellow : t.border;
            return (
              <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ position: "absolute", bottom: "100%", marginBottom: 8, whiteSpace: "nowrap", fontSize: "0.8rem", fontWeight: 700 }}>
                  {isI && <span style={{ color: t.blue }}>i</span>}
                  {isL && <span style={{ color: t.purple }}>L</span>}
                  {isR && <span style={{ color: t.purple }}>R</span>}
                </div>
                <div style={{ width: 44, height: 44, border: `2.5px solid ${border}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: "1rem", fontWeight: 700, background: bg, color: t.ink }}>
                  {val}
                </div>
                <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.7em", color: t.inkMuted }}>{idx}</span>
              </div>
            );
          })}
        </div>
      </div>
      {triples.length > 0 && (
        <div style={{ padding: "10px 14px", border: `2px solid ${t.border}`, borderRadius: 10, background: t.surfaceAlt }}>
          <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9em", fontWeight: 700, color: t.inkMuted, marginBottom: 8 }}>Triples found</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {triples.map((triple, k) => (
              <span key={k} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.85rem", padding: "4px 10px", background: t.green + "22", border: `1px solid ${t.green}`, borderRadius: 6, color: t.ink }}>
                [{triple.join(", ")}]
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
