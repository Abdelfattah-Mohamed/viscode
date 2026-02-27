import { useState, useEffect, useCallback } from "react";
import NavBar from "../components/ui/NavBar";
import ThemeToggle from "../components/ui/ThemeToggle";
import { PROB_LIST, DIFF_COLOR, CAT_ICON } from "../data/problems";

function problemsUrlParams(view, cat, q) {
  const params = new URLSearchParams();
  if (view && view !== "all") params.set("view", view);
  if (cat && cat !== "All") params.set("cat", cat);
  if (q && q.trim()) params.set("q", q.trim());
  const s = params.toString();
  return s ? `/problems?${s}` : "/problems";
}

function parseProblemsUrl() {
  const params = new URLSearchParams(window.location.search);
  const v = params.get("view") || "all";
  const view = ["all", "favorites", "flagged"].includes(v) ? v : "all";
  const cat = params.get("cat") || "All";
  const q = params.get("q") || "";
  return { view, cat, q };
}

const StarIcon = ({ filled, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#f59e0b" : "none"} stroke={filled ? "#f59e0b" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const FlagIcon = ({ filled, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#ef4444" : "none"} stroke={filled ? "#ef4444" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);

export default function ProblemsPage({ t, themeMode, setThemeMode, onNavigate, onSelectProblem, onLogout, username, fav, mobile, recent }) {
  const parsed = parseProblemsUrl();
  const [search, setSearch] = useState(parsed.q);
  const [filter, setFilter] = useState(parsed.cat);
  const [flagFilter, setFlagFilter] = useState(parsed.view);
  const [userMenuOpen, setMenuOpen] = useState(false);

  const updateUrl = useCallback(() => {
    const url = problemsUrlParams(flagFilter, filter, search);
    if (window.location.pathname + (window.location.search || "") !== url) {
      window.history.replaceState(null, "", url);
    }
  }, [flagFilter, filter, search]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  const cats = ["All", ...Array.from(new Set(PROB_LIST.map(p => p.category)))];
  const list = PROB_LIST.filter(p => {
    if (filter !== "All" && p.category !== filter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.desc.toLowerCase().includes(search.toLowerCase())) return false;
    if (flagFilter === "favorites" && !fav?.isFavorite(p.id)) return false;
    if (flagFilter === "flagged" && !fav?.isFlagged(p.id)) return false;
    return true;
  });

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: t.bg, color: t.ink, minHeight: "100vh" }}>
      <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-thumb{background:${t.border};border-radius:3px}`}</style>

      <NavBar page="problems" onNavigate={onNavigate} t={t} themeMode={themeMode} mobile={mobile}
        right={
          <div style={{ display: "flex", alignItems: "center", gap: mobile ? 8 : 12 }}>
            {!mobile && <ThemeToggle mode={themeMode} setMode={setThemeMode} t={t} />}
            {!mobile && <div style={{ width: 1, height: 28, background: t.border, opacity: 0.3 }} />}
            <div style={{ position: "relative" }}>
              <button onClick={() => setMenuOpen(o => !o)}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px", border: `2px solid ${t.border}`, borderRadius: 8, background: "transparent", color: t.ink, cursor: "pointer", fontFamily: "'Caveat',cursive", fontSize: "0.95rem", fontWeight: 700, boxShadow: t.shadowSm }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: t.blue, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.8rem" }}>
                  {username?.[0]?.toUpperCase() || "G"}
                </div>
                {!mobile && (username ?? "User")} ▾
              </button>
              {userMenuOpen && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", background: t.surface, border: `1.5px solid ${t.border}`, borderRadius: 10, boxShadow: t.shadow, zIndex: 300, minWidth: 160, overflow: "hidden" }}>
                  <div style={{ padding: "10px 16px", fontFamily: "'Caveat',cursive", fontSize: "0.9rem", color: t.inkMuted, borderBottom: `1.5px solid ${t.border}` }}>{username ?? "User"}</div>
                  {mobile && <div style={{ padding: "8px 16px", borderBottom: `1.5px solid ${t.border}` }}><ThemeToggle mode={themeMode} setMode={setThemeMode} t={t} /></div>}
                  <button onClick={() => { setMenuOpen(false); onNavigate("profile"); }}
                    style={{ width: "100%", padding: "10px 16px", textAlign: "left", border: "none", background: "transparent", color: t.ink, cursor: "pointer", fontFamily: "'Caveat',cursive", fontSize: "0.95rem", fontWeight: 700 }}>Profile</button>
                  <button onClick={() => { setMenuOpen(false); onLogout(); }}
                    style={{ width: "100%", padding: "10px 16px", textAlign: "left", border: "none", background: "transparent", color: t.red, cursor: "pointer", fontFamily: "'Caveat',cursive", fontSize: "0.95rem", fontWeight: 700 }}>Sign out</button>
                </div>
              )}
            </div>
          </div>
        }
      />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: mobile ? "24px 12px 40px" : "40px 24px 60px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Caveat',cursive", fontSize: "2.4rem", fontWeight: 700, color: t.ink, margin: "0 0 6px" }}>
            Problems <span style={{ color: t.blue }}>({PROB_LIST.length})</span>
          </h1>
          <p style={{ color: t.inkMuted, fontSize: "0.95rem", margin: 0 }}>Click any card to visualize it step-by-step.</p>
        </div>

        {/* Search + filter */}
        <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: t.inkMuted, pointerEvents: "none" }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search problems…"
              style={{ width: "100%", padding: "9px 14px 9px 36px", border: `1.5px solid ${t.border}`, borderRadius: 8, background: t.surface, color: t.ink, fontFamily: "'DM Sans',sans-serif", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {[
              { key: "all", label: "All", icon: null },
              { key: "favorites", label: "Favorites", icon: <StarIcon filled={flagFilter === "favorites"} size={14} /> },
              { key: "flagged", label: "Flagged", icon: <FlagIcon filled={flagFilter === "flagged"} size={14} /> },
            ].map(f => (
              <button key={f.key} onClick={() => setFlagFilter(f.key)}
                style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9rem", fontWeight: 700, padding: "6px 14px", border: `1.5px solid ${flagFilter === f.key ? t.blue : t.border}`, borderRadius: 20, cursor: "pointer", background: flagFilter === f.key ? t.blue + "18" : "transparent", color: flagFilter === f.key ? t.blue : t.inkMuted, transition: "all 0.15s", display: "flex", alignItems: "center", gap: 5 }}>
                {f.icon}{f.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", paddingBottom: 4 }}>
            {cats.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)}
                style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9rem", fontWeight: 700, padding: "6px 14px", border: `1.5px solid ${t.border}`, borderRadius: 20, cursor: "pointer", background: filter === cat ? t.ink : "transparent", color: filter === cat ? t.yellow : t.inkMuted, transition: "all 0.15s" }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Recently Visited */}
        {recent?.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontFamily: "'Caveat',cursive", fontSize: "1.15rem", fontWeight: 700, color: t.ink, margin: "0 0 12px" }}>
              Recently Visited
            </h3>
            <div style={{ display: "flex", gap: 10, overflowX: mobile ? "auto" : "hidden", WebkitOverflowScrolling: "touch", paddingBottom: 6 }}>
              {recent.slice(0, 5).map(id => {
                const p = PROB_LIST.find(x => x.id === id);
                if (!p) return null;
                const dc = DIFF_COLOR[p.difficulty] || {};
                return (
                  <div key={id} onClick={() => onSelectProblem(id)}
                    style={{ flex: mobile ? "0 0 170px" : "1 1 0%", minWidth: 0, padding: "12px 14px", background: t.surface, border: `1.5px solid ${t.border}`, borderRadius: 10, cursor: "pointer", boxShadow: t.shadowSm, transition: "transform 0.12s" }}
                    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                    onMouseLeave={e => e.currentTarget.style.transform = ""}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: "1rem" }}>{CAT_ICON[p.category] || "📌"}</span>
                      <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.68rem", fontWeight: 700, padding: "1px 7px", border: `1.5px solid ${t.border}`, borderRadius: 8, ...dc }}>{p.difficulty}</span>
                    </div>
                    <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1rem", fontWeight: 700, color: t.ink, lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
                    <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.78rem", color: t.inkMuted, marginTop: 2 }}>{p.category}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Grid */}
        {list.length === 0
          ? <div style={{ textAlign: "center", padding: "60px 0", fontFamily: "'Caveat',cursive", fontSize: "1.3rem", color: t.inkMuted }}>No problems match 🤔</div>
          : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
              {list.map(p => {
                const dc = DIFF_COLOR[p.difficulty] || {};
                return (
                  <div key={p.id} onClick={() => onSelectProblem(p.id)}
                    style={{ background: t.surface, border: `1.5px solid ${t.border}`, borderRadius: 12, padding: "18px 20px", cursor: "pointer", boxShadow: t.shadowSm, transition: "transform 0.15s, box-shadow 0.15s", display: "flex", flexDirection: "column", gap: 10 }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translate(-2px,-2px)"; e.currentTarget.style.boxShadow = t.shadow; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = t.shadowSm; }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "1.3rem" }}>{CAT_ICON[p.category] || "📌"}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <button
                          onClick={e => { e.stopPropagation(); fav?.toggleFavorite(p.id); }}
                          title={fav?.isFavorite(p.id) ? "Remove from favorites" : "Add to favorites"}
                          style={{ background: "none", border: "none", padding: 4, cursor: "pointer", color: t.inkMuted, display: "flex", borderRadius: 6 }}
                        >
                          <StarIcon filled={fav?.isFavorite(p.id)} size={16} />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); fav?.toggleFlagged(p.id); }}
                          title={fav?.isFlagged(p.id) ? "Remove flag" : "Flag this problem"}
                          style={{ background: "none", border: "none", padding: 4, cursor: "pointer", color: t.inkMuted, display: "flex", borderRadius: 6 }}
                        >
                          <FlagIcon filled={fav?.isFlagged(p.id)} size={16} />
                        </button>
                        <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.75rem", fontWeight: 700, padding: "2px 9px", border: `1.5px solid ${t.border}`, borderRadius: 10, ...dc }}>{p.difficulty}</span>
                      </div>
                    </div>
                    <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1.15rem", fontWeight: 700, color: t.ink, lineHeight: 1.3 }}>{p.title}</div>
                    <div style={{ fontSize: "0.82rem", color: t.inkMuted, lineHeight: 1.6, flex: 1 }}>{p.desc}</div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
                      {p.tags.slice(0, 3).map(tag => (
                        <span key={tag} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", padding: "2px 7px", border: `1.5px solid ${t.border}`, borderRadius: 20, background: t.surfaceAlt, color: t.inkMuted }}>{tag}</span>
                      ))}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.8rem", color: t.inkMuted }}>{p.category}</span>
                      <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9rem", fontWeight: 700, color: t.blue }}>Visualize →</span>
                    </div>
                  </div>
                );
              })}
            </div>}
      </div>
    </div>
  );
}
