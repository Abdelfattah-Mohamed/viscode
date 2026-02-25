export default function LinkedListViz({ head = [], stepState = {}, t }) {
  const { prevIdx, currIdx, nextIdx, reversed = [], done } = stepState;
  const nodes = Array.isArray(head) ? head : [];

  const splitPoint = reversed.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 10 }}>
          linked list
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap", paddingTop: 36 }}>
          {nodes.map((val, idx) => {
            const isPrev = idx === prevIdx;
            const isCurr = idx === currIdx;
            const isNext = idx === nextIdx;
            const isReversed = idx < splitPoint;

            const border = isCurr ? t.yellow : isPrev ? t.blue : isNext ? t.purple : isReversed ? t.green + "88" : t.border;
            const bg = isCurr ? t.yellow + "30" : isPrev ? t.blue + "20" : isNext ? t.purple + "20" : isReversed ? t.green + "14" : t.surface;

            return (
              <div key={idx} style={{ display: "flex", alignItems: "center", position: "relative" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative" }}>
                  <div style={{ position: "absolute", bottom: "100%", marginBottom: 6, whiteSpace: "nowrap", display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                    {isPrev && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.8em", fontWeight: 700, color: t.blue }}>prev</span>}
                    {isCurr && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.8em", fontWeight: 700, color: t.yellow }}>curr</span>}
                    {isNext && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.8em", fontWeight: 700, color: t.purple }}>next</span>}
                  </div>
                  <div style={{
                    width: 48, height: 48,
                    border: `2.5px solid ${border}`,
                    borderRadius: 24,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'JetBrains Mono',monospace", fontSize: "1em", fontWeight: 700,
                    background: bg, color: t.ink,
                    transform: isCurr ? "scale(1.12)" : "scale(1)",
                    boxShadow: isCurr ? t.shadowSm : "none",
                    transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
                  }}>
                    {val}
                  </div>
                </div>

                {idx < nodes.length - 1 && (
                  <div style={{
                    width: 32, display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'JetBrains Mono',monospace", fontSize: "1.1em", fontWeight: 700,
                    color: isReversed && idx + 1 <= splitPoint ? t.green : t.border,
                    transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
                  }}>
                    {isReversed && idx + 1 <= splitPoint ? "←" : "→"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {done && (
        <div style={{
          padding: "10px 16px", borderRadius: 8, textAlign: "center",
          border: `2px solid ${t.green}`,
          background: t.green + "18",
          fontFamily: "'Caveat',cursive", fontSize: "1.1rem", fontWeight: 700,
          color: t.green,
        }}>
          ✅ List reversed!
        </div>
      )}
    </div>
  );
}
