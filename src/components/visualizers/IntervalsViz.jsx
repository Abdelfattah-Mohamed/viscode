const BAR_AREA_WIDTH = 240;

export default function IntervalsViz({ stepState = {}, t }) {
  const { intervals = [], merged = [], current = -1, done } = stepState;
  const allForRange = [...intervals, ...merged];
  const flat = allForRange.length ? allForRange.flat() : [0, 10];
  const minStart = Math.min(...flat);
  const maxEnd = Math.max(...flat);
  const range = Math.max(maxEnd - minStart, 1);
  const scale = BAR_AREA_WIDTH / range;

  const renderBars = (list, isMerged) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {list.map(([start, end], idx) => {
        const w = (end - start) * scale;
        const left = (start - minStart) * scale;
        const isCurrent = idx === current && !isMerged;
        const border = isCurrent ? "#ea580c" : isMerged ? "#16a34a" : t._resolved === "dark" ? "#6b7280" : "#1f2937";
        const bg = isCurrent ? "#fef08a" : isMerged ? "#dcfce7" : t._resolved === "dark" ? "#374151" : "#ffffff";
        return (
          <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.78rem", color: t.inkMuted, width: 44 }}>[{start},{end}]</span>
            <div style={{ position: "relative", height: 22, width: BAR_AREA_WIDTH, flexShrink: 0 }}>
              <div style={{ position: "absolute", left, width: Math.max(w, 4), height: 12, border: `1.5px solid ${border}`, borderRadius: 4, background: bg, top: 5 }} />
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {intervals.length > 0 && (
        <div>
          <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 10 }}>intervals (sorted)</div>
          {renderBars(intervals, false)}
        </div>
      )}
      {merged.length > 0 && (
        <div>
          <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 700, color: "#16a34a", marginBottom: 10 }}>merged</div>
          {renderBars(merged, true)}
        </div>
      )}
    </div>
  );
}
