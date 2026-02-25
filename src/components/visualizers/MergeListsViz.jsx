export default function MergeListsViz({ list1 = [], list2 = [], stepState = {}, t }) {
  const { i = 0, j = 0, merged = [], list1: s1, list2: s2, done } = stepState;
  const a = (s1 && s1.length >= 0 ? s1 : list1) || [];
  const b = (s2 && s2.length >= 0 ? s2 : list2) || [];
  const m = merged || [];

  const renderList = (label, list, highlightIdx) => (
    <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
      <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.85rem", color: t.inkMuted, marginRight: 6 }}>{label}</span>
      {list.map((val, idx) => (
        <div key={idx} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: 40, height: 40, border: `2px solid ${idx === highlightIdx ? t.yellow : t.border}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.9rem", fontWeight: 700, background: idx === highlightIdx ? t.yellow + "22" : t.surface }}>
            {val}
          </div>
          {idx < list.length - 1 && <span style={{ color: t.border, margin: "0 2px" }}>→</span>}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {renderList("list1", a, i)}
      {renderList("list2", b, j)}
      <div style={{ borderTop: `2px solid ${t.border}`, paddingTop: 12 }}>
        <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9rem", fontWeight: 700, color: t.green, marginBottom: 8 }}>merged</div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
          {m.length === 0 ? <span style={{ color: t.inkMuted, fontStyle: "italic" }}>empty</span> : m.map((val, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ width: 40, height: 40, border: `2px solid ${t.green}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.9rem", fontWeight: 700, background: t.green + "18" }}>
                {val}
              </div>
              {idx < m.length - 1 && <span style={{ color: t.border, margin: "0 2px" }}>→</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
