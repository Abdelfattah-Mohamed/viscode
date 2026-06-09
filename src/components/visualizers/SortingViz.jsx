export default function SortingViz({ nums = [], stepState = {}, t }) {
  const {
    nums: stateNums,
    highlight = [],
    sortedLeft = 0,
    sortedRight = nums.length,
    pivot = null,
    done = false,
    auxLabel,
    aux,
  } = stepState;

  const arr = Array.isArray(stateNums) && stateNums.length ? stateNums : nums;
  if (!arr.length) {
    return (
      <div style={{ padding: 12, color: t.inkMuted, fontFamily: "'Caveat',cursive" }}>
        Empty array — add numbers to visualize sorting.
      </div>
    );
  }

  const maxVal = Math.max(...arr.map((x) => Number(x) || 0), 1);
  const hiSet = new Set(highlight.map((i) => Number(i)));
  const pivotIdx = pivot != null ? Number(pivot) : null;

  const barBg = (idx) => {
    if (done) return t.green + "28";
    if (Number.isFinite(pivotIdx) && idx === pivotIdx) return t.purple + "38";
    if (idx < sortedLeft || idx >= sortedRight) return t.green + "22";
    if (hiSet.has(idx)) return t.yellow + "40";
    return t.surfaceAlt;
  };

  const borderCol = (idx) => {
    if (hiSet.has(idx)) return "#ea580c";
    if (Number.isFinite(pivotIdx) && idx === pivotIdx) return t.purple;
    return t.border;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, minHeight: 160, padding: "8px 4px" }}>
        {arr.map((raw, idx) => {
          const v = Number(raw) || 0;
          const h = Math.max(18, Math.round((v / maxVal) * 120));
          return (
            <div key={`bar-${idx}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div
                title={`index ${idx}, value ${v}`}
                style={{
                  width: 34,
                  height: h,
                  borderRadius: 10,
                  border: `2px solid ${borderCol(idx)}`,
                  background: barBg(idx),
                  boxShadow: hiSet.has(idx) ? `0 0 0 2px ${t.blue}33` : t.shadowSm,
                  transition: "height 0.2s ease, background 0.15s ease",
                }}
              />
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", fontWeight: 800, color: t.inkMuted }}>
                {v}
              </span>
            </div>
          );
        })}
      </div>
      {Array.isArray(aux) && aux.length > 0 && (
        <div style={{ border: `1.5px solid ${t.border}`, borderRadius: 12, padding: "10px 12px", background: t.surfaceAlt }}>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.76rem", fontWeight: 800, color: t.inkMuted, marginBottom: 8 }}>
            {auxLabel || "Auxiliary"}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {aux.map((x, i) => (
              <span
                key={`ax-${i}`}
                style={{
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: "0.74rem",
                  fontWeight: 800,
                  padding: "4px 8px",
                  borderRadius: 8,
                  border: `1px solid ${t.border}`,
                  background: t.surface,
                  color: t.ink,
                }}
              >
                {String(x)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
