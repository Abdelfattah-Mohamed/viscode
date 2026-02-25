export default function IntervalsViz({ stepState = {}, t }) {
  const { intervals = [], merged = [], current = -1, done } = stepState;
  const all = merged.length > 0 ? merged : intervals;
  const maxEnd = all.length ? Math.max(...all.flat()) : 10;
  const minStart = all.length ? Math.min(...all.flat()) : 0;
  const range = Math.max(maxEnd - minStart, 1);
  const scale = 280 / range;

  const renderBars = (list, isMerged) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {list.map(([start, end], idx) => {
        const w = (end - start) * scale;
        const left = (start - minStart) * scale;
        const isCurrent = idx === current;
        const border = isCurrent ? t.yellow : isMerged ? t.green : t.border;
        const bg = isMerged ? t.green + "22" : t.surface;
        return (
          <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.85rem", color: t.inkMuted, width: 80 }}>[{start},{end}]</span>
            <div style={{ position: "relative", height: 32, minWidth: range * scale }}>
              <div style={{ position: "absolute", left, width: Math.max(w, 20), height: 24, border: `2px solid ${border}`, borderRadius: 6, background: bg, top: 4 }} />
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {intervals.length > 0 && (
        <div>
          <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 8 }}>intervals (sorted)</div>
          {renderBars(intervals, false)}
        </div>
      )}
      {merged.length > 0 && (
        <div>
          <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 700, color: t.green, marginBottom: 8 }}>merged</div>
          {renderBars(merged, true)}
        </div>
      )}
    </div>
  );
}
