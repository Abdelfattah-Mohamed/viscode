const BAR_AREA_WIDTH = 240;

export default function IntervalsViz({ stepState = {}, problemId, t }) {
  const { intervals = [], merged = [], current = -1, done, lastEnd, count, removedIndices = [], prev, overlap, canAttend, rooms, maxRooms, highlightIdx } = stepState;
  const isNonOverlapping = problemId === "non-overlapping-intervals";
  const isMeetingRooms = problemId === "meeting-rooms";
  const isMeetingRoomsII = problemId === "meeting-rooms-ii";
  const allForRange = [...intervals, ...merged];
  const flat = allForRange.length ? allForRange.flat() : [0, 10];
  const minStart = Math.min(...flat);
  const maxEnd = Math.max(...flat);
  const range = Math.max(maxEnd - minStart, 1);
  const scale = BAR_AREA_WIDTH / range;

  const renderBars = (list, isMerged, options = {}) => {
    const { markRemoved = [], pairHighlight = [] } = options;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {list.map(([start, end], idx) => {
          const w = (end - start) * scale;
          const left = (start - minStart) * scale;
          const isCurrent = (!isMerged && (idx === current || pairHighlight.includes(idx)));
          const isRemoved = markRemoved.includes(idx);
          let border = isCurrent ? "#ea580c" : isMerged ? "#16a34a" : t._resolved === "dark" ? "#6b7280" : "#1f2937";
          let bg = isCurrent ? "#fef08a" : isMerged ? "#dcfce7" : t._resolved === "dark" ? "#374151" : "#ffffff";
          if (isRemoved) {
            border = "#dc2626";
            bg = t._resolved === "dark" ? "#7f1d1d" : "#fef2f2";
          }
          return (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.78rem", color: isRemoved ? t.inkMuted : t.inkMuted, width: 44 }}>[{start},{end}]</span>
              <div style={{ position: "relative", height: 22, width: BAR_AREA_WIDTH, flexShrink: 0 }}>
                <div style={{ position: "absolute", left, width: Math.max(w, 4), height: 12, border: `1.5px solid ${border}`, borderRadius: 4, background: bg, top: 5, opacity: isRemoved ? 0.85 : 1 }} />
              </div>
              {isRemoved && <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.75rem", color: "#dc2626", fontWeight: 700 }}>remove</span>}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {isNonOverlapping && (count !== undefined || lastEnd !== undefined) && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          {lastEnd != null && lastEnd !== -Infinity && (
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", color: t.inkMuted }}>
              end = <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>{lastEnd}</span>
            </span>
          )}
          {lastEnd === -Infinity && (
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", color: t.inkMuted }}>end = −∞</span>
          )}
          {count !== undefined && (
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 700, color: "#dc2626" }}>
              Removals: <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>{count}</span>
            </span>
          )}
        </div>
      )}
      {isMeetingRooms && canAttend !== undefined && canAttend !== null && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          {overlap === true && (
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1rem", fontWeight: 700, color: "#dc2626" }}>Overlap! → false</span>
          )}
          {done && (
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1rem", fontWeight: 700, color: canAttend ? "#16a34a" : "#dc2626" }}>
              Can attend: <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>{canAttend ? "true" : "false"}</span>
            </span>
          )}
        </div>
      )}
      {isMeetingRoomsII && (rooms !== undefined || maxRooms !== undefined) && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          {rooms !== undefined && (
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", color: t.inkMuted }}>
              rooms = <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>{rooms}</span>
            </span>
          )}
          {maxRooms !== undefined && (
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 700, color: "#16a34a" }}>
              maxRooms = <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>{maxRooms}</span>
            </span>
          )}
          {done && maxRooms !== undefined && (
            <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1rem", fontWeight: 700, color: "#16a34a" }}>
              → Min rooms: <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>{maxRooms}</span>
            </span>
          )}
        </div>
      )}
      {intervals.length > 0 && (
        <div>
          <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 600, color: t.inkMuted, marginBottom: 10 }}>
            {isMeetingRooms ? "intervals (sorted by start)" : isMeetingRoomsII ? "intervals" : isNonOverlapping ? "intervals (sorted by end)" : "intervals (sorted)"}
          </div>
          {renderBars(intervals, false, isNonOverlapping ? { markRemoved: removedIndices } : isMeetingRooms ? { pairHighlight: prev != null && current >= 0 ? [prev, current] : [] } : isMeetingRoomsII ? { pairHighlight: highlightIdx != null ? [highlightIdx] : [] } : {})}
        </div>
      )}
      {merged.length > 0 && !isNonOverlapping && (
        <div>
          <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95em", fontWeight: 700, color: "#16a34a", marginBottom: 10 }}>merged</div>
          {renderBars(merged, true)}
        </div>
      )}
    </div>
  );
}
