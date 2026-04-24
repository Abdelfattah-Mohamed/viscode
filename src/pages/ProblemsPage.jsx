import { useState, useEffect, useCallback } from "react";
import NavBar from "../components/ui/NavBar";
import SectionHeader from "../components/ui/SectionHeader";
import AccountMenuChip from "../components/ui/AccountMenuChip";
import PageContainer from "../components/ui/PageContainer";
import Button from "../components/ui/Button";
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

export default function ProblemsPage({ t, themeMode, setThemeMode, onNavigate, onSelectProblem, onLogout, username, user, fav, mobile, recent, isPro }) {
  const parsed = parseProblemsUrl();
  const [search, setSearch] = useState(parsed.q);
  const [filter, setFilter] = useState(parsed.cat);
  const [flagFilter, setFlagFilter] = useState(parsed.view);

  const updateUrl = useCallback(() => {
    const url = problemsUrlParams(flagFilter, filter, search);
    if (window.location.pathname + (window.location.search || "") !== url) {
      window.history.replaceState(null, "", url);
    }
  }, [flagFilter, filter, search]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  const categories = Array.from(new Set(PROB_LIST.map((p) => p.category)));
  const cats = [
    "All",
    ...(categories.includes("Famous Algorithms") ? ["Famous Algorithms"] : []),
    ...categories.filter((c) => c !== "Famous Algorithms"),
  ];
  const filtered = PROB_LIST.filter(p => {
    if (filter !== "All" && p.category !== filter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.desc.toLowerCase().includes(search.toLowerCase())) return false;
    if (flagFilter === "favorites" && !fav?.isFavorite(p.id)) return false;
    if (flagFilter === "flagged" && !fav?.isFlagged(p.id)) return false;
    return true;
  });
  const list = filter === "All"
    ? [...filtered].sort((a, b) => {
        const aFamous = a.category === "Famous Algorithms" ? 0 : 1;
        const bFamous = b.category === "Famous Algorithms" ? 0 : 1;
        if (aFamous !== bFamous) return aFamous - bFamous;
        return a.title.localeCompare(b.title);
      })
    : filtered;
  const isLocked = (p) => !isPro && p.category !== "Famous Algorithms";
  const handleCardKeyDown = (e, action) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: t.bg, color: t.ink, minHeight: "100vh" }}>
      <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-thumb{background:${t.border};border-radius:3px}`}</style>

      <NavBar page="problems" onNavigate={onNavigate} t={t} themeMode={themeMode} mobile={mobile}
        right={
          <AccountMenuChip
            t={t}
            mobile={mobile}
            themeMode={themeMode}
            setThemeMode={setThemeMode}
            username={username}
            user={user}
            onProfile={() => onNavigate("profile")}
            onLogout={onLogout}
          />
        }
      />

      <PageContainer mobile={mobile} paddingMobile="24px 12px 40px" paddingDesktop="40px 24px 60px">
        <SectionHeader
          t={t}
          title={<span>Problems <span style={{ color: t.blue }}>({PROB_LIST.length})</span></span>}
          subtitle="Click any card to visualize it step-by-step."
          style={{ marginBottom: 24 }}
        />

        {!isPro && (
          <div
            style={{
              marginBottom: 20,
              border: `1.5px solid ${t.border}`,
              borderRadius: 10,
              background: t.surface,
              padding: "12px 14px",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Button
              t={t}
              variant="primary"
              onClick={() => onNavigate("billing")}
              style={{
                marginLeft: "auto",
                borderRadius: 8,
              }}
            >
              Upgrade to unlock all →
            </Button>
          </div>
        )}

        {/* Search + filter */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: t.inkMuted, pointerEvents: "none" }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search problems…"
              style={{ width: "100%", padding: "9px 14px 9px 36px", border: `1.5px solid ${t.border}`, borderRadius: 8, background: t.surface, color: t.ink, fontFamily: "'DM Sans',sans-serif", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", overflowX: mobile ? "auto" : "visible", paddingBottom: mobile ? 4 : 0 }}>
            {[
              { key: "all", label: "All", icon: null },
              { key: "favorites", label: "Favorites", icon: <StarIcon filled={flagFilter === "favorites"} size={14} /> },
              { key: "flagged", label: "Flagged", icon: <FlagIcon filled={flagFilter === "flagged"} size={14} /> },
            ].map(f => (
              <Button key={f.key} t={t} variant="ghost" pill size={mobile ? "sm" : "md"} onClick={() => setFlagFilter(f.key)}
                style={{ borderColor: flagFilter === f.key ? t.blue : t.border, background: flagFilter === f.key ? t.blue + "18" : "transparent", color: flagFilter === f.key ? t.blue : t.ink, display: "flex", alignItems: "center", gap: 5 }}>
                {f.icon}{f.label}
              </Button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: mobile ? "nowrap" : "wrap", overflowX: mobile ? "auto" : "visible", paddingBottom: 4 }}>
            {cats.map(cat => (
              <Button key={cat} t={t} variant="ghost" pill size={mobile ? "sm" : "md"} onClick={() => setFilter(cat)}
                style={{ background: filter === cat ? t.ink : "transparent", color: filter === cat ? t.yellow : t.ink }}>
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Recently Visited */}
        {recent?.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionHeader t={t} title="Recently Visited" compact style={{ marginBottom: 12 }} />
            <div style={{ display: "flex", gap: 10, overflowX: mobile ? "auto" : "hidden", WebkitOverflowScrolling: "touch", paddingBottom: 6 }}>
              {recent.slice(0, 5).map(id => {
                const p = PROB_LIST.find(x => x.id === id);
                if (!p) return null;
                const dc = DIFF_COLOR[p.difficulty] || {};
                return (
                  <div key={id} onClick={() => onSelectProblem(id)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open ${p.title}`}
                    onKeyDown={(e) => handleCardKeyDown(e, () => onSelectProblem(id))}
                    style={{ flex: mobile ? "0 0 170px" : "1 1 0%", minWidth: 0, padding: "12px 14px", background: t.surface, border: `1.5px solid ${t.border}`, borderRadius: 10, cursor: "pointer", boxShadow: t.shadowSm, transition: "transform 0.12s" }}
                    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                    onMouseLeave={e => e.currentTarget.style.transform = ""}
                    onFocus={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `${t.shadowSm}, 0 0 0 2px ${t.blue}66`; }}
                    onBlur={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = t.shadowSm; }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: "1rem" }}>{CAT_ICON[p.category] || "📌"}</span>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        {isLocked(p) && (
                          <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.72rem", fontWeight: 700, padding: "1px 7px", border: `1.5px solid ${t.border}`, borderRadius: 8, color: t.red, background: t.red + "14" }}>
                            🔒 Pro
                          </span>
                        )}
                        <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.72rem", fontWeight: 700, padding: "1px 7px", border: `1.5px solid ${t.border}`, borderRadius: 8, ...dc }}>{p.difficulty}</span>
                      </div>
                    </div>
                    <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1rem", fontWeight: 700, color: t.ink, lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
                    <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.82rem", color: t.inkMuted, marginTop: 2 }}>{p.category}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Grid */}
        {list.length === 0
          ? <div style={{ textAlign: "center", padding: "56px 0", fontFamily: "'Caveat',cursive", fontSize: "1.3rem", color: t.inkMuted }}>No problems match 🤔</div>
          : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
              {list.map(p => {
                const dc = DIFF_COLOR[p.difficulty] || {};
                return (
                  <div key={p.id} onClick={() => onSelectProblem(p.id)}
                    role="button"
                    tabIndex={0}
                    aria-label={`${isLocked(p) ? "Locked problem: " : "Open problem: "}${p.title}`}
                    onKeyDown={(e) => handleCardKeyDown(e, () => onSelectProblem(p.id))}
                    style={{ background: t.surface, border: `1.5px solid ${t.border}`, borderRadius: 12, padding: "16px 18px", cursor: "pointer", boxShadow: t.shadowSm, transition: "transform 0.15s, box-shadow 0.15s", display: "flex", flexDirection: "column", gap: 12, opacity: isLocked(p) ? 0.92 : 1 }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translate(-2px,-2px)"; e.currentTarget.style.boxShadow = t.shadow; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = t.shadowSm; }}
                    onFocus={e => { e.currentTarget.style.transform = "translate(-2px,-2px)"; e.currentTarget.style.boxShadow = `${t.shadow}, 0 0 0 2px ${t.blue}66`; }}
                    onBlur={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = t.shadowSm; }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "1.3rem" }}>{CAT_ICON[p.category] || "📌"}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        {isLocked(p) && (
                          <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.72rem", fontWeight: 700, padding: "2px 8px", border: `1.5px solid ${t.border}`, borderRadius: 10, color: t.red }}>
                            🔒 Pro
                          </span>
                        )}
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
                    <div style={{ fontSize: "0.86rem", color: t.inkMuted, lineHeight: 1.6, flex: 1 }}>{p.desc}</div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
                      {p.tags.slice(0, 2).map(tag => (
                        <span key={tag} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.69rem", padding: "2px 7px", border: `1.5px solid ${t.border}`, borderRadius: 20, background: t.surfaceAlt, color: t.inkMuted }}>{tag}</span>
                      ))}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.84rem", color: t.inkMuted }}>{p.category}</span>
                      <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9rem", fontWeight: 700, color: isLocked(p) ? t.red : t.blue }}>
                        {isLocked(p) ? "Upgrade to view →" : "Visualize →"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>}
      </PageContainer>
    </div>
  );
}
