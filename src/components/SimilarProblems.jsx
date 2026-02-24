import { getSimilar, DIFF_COLOR, CAT_ICON } from "../data/problems";

export default function SimilarProblems({ currentId, onSelect, t }) {
  const similar = getSimilar(currentId);
  if (!similar.length) return null;

  return (
    <div>
      <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1.1rem", fontWeight: 700, color: t.inkMuted, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
        <span>🔗</span> Similar Problems
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {similar.map(p => {
          const dc = DIFF_COLOR[p.difficulty] || {};
          return (
            <div key={p.id} onClick={() => onSelect(p.id)}
              style={{ background: t.surface, border: `1.5px solid ${t.border}`, borderRadius: 12, padding: "14px 16px", cursor: "pointer", boxShadow: t.shadowSm, transition: "transform 0.15s, box-shadow 0.15s", display: "flex", flexDirection: "column", gap: 8 }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translate(-2px,-2px)"; e.currentTarget.style.boxShadow = t.shadow; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = t.shadowSm; }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1.05rem", fontWeight: 700, color: t.ink, lineHeight: 1.2, flex: 1 }}>
                  {CAT_ICON[p.category]} {p.title}
                </span>
                <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.72rem", fontWeight: 700, padding: "2px 8px", border: `1.5px solid ${t.border}`, borderRadius: 10, ...dc, whiteSpace: "nowrap" }}>
                  {p.difficulty}
                </span>
              </div>
              <div style={{ fontSize: "0.8rem", color: t.inkMuted, lineHeight: 1.55 }}>{p.desc}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 2 }}>
                {p.tags.slice(0, 3).map(tag => (
                  <span key={tag} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.68rem", padding: "2px 8px", border: `1.5px solid ${t.border}`, borderRadius: 20, background: t.surfaceAlt, color: t.inkMuted }}>
                    {tag}
                  </span>
                ))}
              </div>
              <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.85rem", fontWeight: 700, color: t.blue, marginTop: "auto" }}>Visualize →</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
