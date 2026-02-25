export default function ContainerViz({ heights = [], stepState = {}, t }) {
  const { left = 0, right = 0, maxArea = 0, bestLeft = -1, bestRight = -1, currentArea, done } = stepState;
  const arr = heights && heights.length > 0 ? heights : [];
  const maxH = Math.max(...arr, 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 10 }}>heights</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, paddingTop: 16 }}>
          {arr.map((h, idx) => {
            const isLeft = idx === left;
            const isRight = idx === right;
            const isBest = idx === bestLeft || idx === bestRight;
            const border = isLeft ? t.blue : isRight ? t.purple : isBest && done ? t.green : t.border;
            const bg = isBest && done ? t.green + "33" : isLeft ? t.blue + "22" : isRight ? t.purple + "22" : t.surface;
            const heightPx = maxH > 0 ? Math.max(24, (h / maxH) * 120) : 40;
            return (
              <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.75em", fontWeight: 700, color: border }}>{idx === left ? "L" : idx === right ? "R" : ""}</div>
                <div style={{ width: 32, height: heightPx, border: `2.5px solid ${border}`, borderBottom: "none", borderTopLeftRadius: 6, borderTopRightRadius: 6, background: bg, transition: "all 0.3s" }} />
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: t.inkMuted }}>{h}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ padding: "8px 14px", border: `2px solid ${t.border}`, borderRadius: 8, background: t.surfaceAlt, fontFamily: "'Caveat',cursive", fontSize: "1rem", fontWeight: 700 }}>
          <span style={{ color: t.inkMuted }}>maxArea </span>
          <span style={{ color: t.green }}>{maxArea}</span>
        </div>
        {currentArea != null && !done && (
          <div style={{ padding: "8px 14px", border: `2px solid ${t.border}`, borderRadius: 8, background: t.surfaceAlt, fontFamily: "'Caveat',cursive", fontSize: "1rem", fontWeight: 700 }}>
            <span style={{ color: t.inkMuted }}>current </span>
            <span style={{ color: t.blue }}>{currentArea}</span>
          </div>
        )}
      </div>
    </div>
  );
}
