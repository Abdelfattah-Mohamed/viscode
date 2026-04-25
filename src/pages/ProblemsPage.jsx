import { useState, useEffect, useCallback } from "react";
import NavBar from "../components/ui/NavBar";
import SectionHeader from "../components/ui/SectionHeader";
import AccountMenuChip from "../components/ui/AccountMenuChip";
import PageContainer from "../components/ui/PageContainer";
import Button from "../components/ui/Button";
import { PROB_LIST, DIFF_COLOR, CAT_ICON } from "../data/problems";

const FREE_CATEGORY = "Famous Algorithms";

const PRO_VALUE_POINTS = [
  "Unlock every category",
  "Editable custom inputs",
  "Save favorites and flags",
  "Full visual practice library",
];

const STUDY_PATHS = [
  { label: "Start free", detail: "Famous Algorithms", color: "green" },
  { label: "Go deeper", detail: "Arrays, DP, Trees, Graphs", color: "blue" },
  { label: "Practice smarter", detail: "Custom inputs + notes", color: "yellow" },
];

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
        const aFamous = a.category === FREE_CATEGORY ? 0 : 1;
        const bFamous = b.category === FREE_CATEGORY ? 0 : 1;
        if (aFamous !== bFamous) return aFamous - bFamous;
        return a.title.localeCompare(b.title);
      })
    : filtered;
  const freeCount = PROB_LIST.filter((p) => p.category === FREE_CATEGORY).length;
  const premiumCount = PROB_LIST.length - freeCount;
  const categoryCount = categories.length;
  const lockedCount = PROB_LIST.filter((p) => !isPro && p.category !== FREE_CATEGORY).length;
  const visibleLockedCount = list.filter((p) => !isPro && p.category !== FREE_CATEGORY).length;
  const isLocked = (p) => !isPro && p.category !== FREE_CATEGORY;
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

      <PageContainer mobile={mobile} maxWidth={1080} paddingMobile="24px 12px 40px" paddingDesktop="40px 24px 60px">
        <div
          style={{
            marginBottom: 24,
            padding: mobile ? "22px 18px" : "28px 30px",
            border: `1.75px solid ${t.border}`,
            borderRadius: 16,
            background: `linear-gradient(135deg, ${t.surface} 0%, ${t.surfaceAlt} 100%)`,
            boxShadow: t.shadow,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.3fr 0.95fr", gap: mobile ? 22 : 32, alignItems: "center" }}>
            <div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 11px", borderRadius: 999, background: t.blue + "18", border: `1.25px solid ${t.blue}66`, color: t.blue, fontSize: "0.82rem", fontWeight: 800 }}>
                {isPro ? "Pro library unlocked" : `${freeCount} free problems + ${premiumCount} Pro problems`}
              </span>
              <h1 style={{ fontFamily: "'Caveat',cursive", fontSize: mobile ? "2.25rem" : "3rem", lineHeight: 1, color: t.ink, margin: "14px 0 10px" }}>
                Choose what to master next.
              </h1>
              <p style={{ margin: 0, color: t.inkMuted, fontSize: "0.98rem", lineHeight: 1.65, maxWidth: 650 }}>
                Browse step-by-step visual problems across interview topics. Famous Algorithms are free; Pro unlocks the complete practice library and editable input tools.
              </p>
              {!isPro && (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
                  <Button t={t} variant="primary" onClick={() => onNavigate("billing")} style={{ borderRadius: 10 }}>
                    Unlock full library →
                  </Button>
                  <Button t={t} variant="secondary" onClick={() => setFilter(FREE_CATEGORY)} style={{ borderRadius: 10 }}>
                    Try free algorithms
                  </Button>
                </div>
              )}
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {[
                { label: "Total problems", value: `${PROB_LIST.length}+` },
                { label: "Topic categories", value: categoryCount },
                { label: isPro ? "Unlocked problems" : "Premium previews", value: isPro ? PROB_LIST.length : lockedCount },
              ].map((stat) => (
                <div key={stat.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 14px", borderRadius: 12, border: `1.25px solid ${t.border}`, background: t.bg }}>
                  <span style={{ color: t.inkMuted, fontSize: "0.86rem" }}>{stat.label}</span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", color: t.ink, fontWeight: 900 }}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {!isPro && (
          <div
            style={{
              marginBottom: 24,
              border: `1.5px solid ${t.border}`,
              borderRadius: 14,
              background: t.surface,
              padding: mobile ? "16px" : "18px 20px",
              display: "grid",
              gridTemplateColumns: mobile ? "1fr" : "1.1fr 1fr auto",
              alignItems: "center",
              gap: 16,
              boxShadow: t.shadowSm,
            }}
          >
            <div>
              <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1.35rem", fontWeight: 700, color: t.ink }}>
                Upgrade when you are ready for serious practice.
              </div>
              <p style={{ margin: "4px 0 0", color: t.inkMuted, fontSize: "0.88rem", lineHeight: 1.55 }}>
                Pro unlocks {premiumCount} premium problems, editable inputs, and the full set of visual practice categories.
              </p>
            </div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {PRO_VALUE_POINTS.map((point) => (
                <span key={point} style={{ fontSize: "0.78rem", fontWeight: 800, color: t.ink, background: t.surfaceAlt, border: `1.25px solid ${t.border}`, borderRadius: 999, padding: "5px 9px" }}>
                  ✓ {point}
                </span>
              ))}
            </div>
            <Button
              t={t}
              variant="primary"
              onClick={() => onNavigate("billing")}
              style={{ borderRadius: 10, whiteSpace: "nowrap" }}
            >
              View Pro plans
            </Button>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: 12, marginBottom: 24 }}>
          {STUDY_PATHS.map((path) => {
            const color = t[path.color] || t.blue;
            return (
              <div key={path.label} style={{ padding: "14px 15px", border: `1.25px solid ${t.border}`, borderRadius: 12, background: t.surface, boxShadow: t.shadowSm }}>
                <div style={{ color, fontSize: "0.78rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 5 }}>
                  {path.label}
                </div>
                <div style={{ color: t.ink, fontWeight: 800, fontSize: "0.95rem" }}>{path.detail}</div>
              </div>
            );
          })}
        </div>

        {/* Search + filter */}
        <SectionHeader
          t={t}
          title="Browse the library"
          subtitle={`${list.length} result${list.length === 1 ? "" : "s"}${!isPro && visibleLockedCount ? ` · ${visibleLockedCount} premium preview${visibleLockedCount === 1 ? "" : "s"}` : ""}`}
          compact
          style={{ marginBottom: 12 }}
          action={!isPro ? (
            <Button t={t} variant="ghost" size="sm" onClick={() => onNavigate("billing")} style={{ color: t.blue, borderColor: t.blue }}>
              Unlock all
            </Button>
          ) : null}
        />
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", padding: "14px", border: `1.25px solid ${t.border}`, borderRadius: 14, background: t.surface }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: t.inkMuted, pointerEvents: "none" }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by problem, topic, or skill…"
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
                    style={{ background: t.surface, border: `1.5px solid ${isLocked(p) ? t.blue + "99" : t.border}`, borderRadius: 12, padding: "16px 18px", cursor: "pointer", boxShadow: t.shadowSm, transition: "transform 0.15s, box-shadow 0.15s", display: "flex", flexDirection: "column", gap: 12, opacity: isLocked(p) ? 0.96 : 1, position: "relative" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translate(-2px,-2px)"; e.currentTarget.style.boxShadow = t.shadow; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = t.shadowSm; }}
                    onFocus={e => { e.currentTarget.style.transform = "translate(-2px,-2px)"; e.currentTarget.style.boxShadow = `${t.shadow}, 0 0 0 2px ${t.blue}66`; }}
                    onBlur={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = t.shadowSm; }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "1.3rem" }}>{CAT_ICON[p.category] || "📌"}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        {isLocked(p) && (
                          <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.72rem", fontWeight: 700, padding: "2px 8px", border: `1.5px solid ${t.blue}66`, borderRadius: 10, color: t.blue, background: t.blue + "14" }}>
                            🔒 Pro preview
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
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {isLocked(p) && (
                        <span
                          aria-hidden="true"
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            background: t.red + "14",
                            border: `1.5px solid ${t.red}66`,
                            color: t.red,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.82rem",
                            flexShrink: 0,
                          }}
                        >
                          🔒
                        </span>
                      )}
                      <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1.15rem", fontWeight: 700, color: t.ink, lineHeight: 1.3 }}>{p.title}</div>
                    </div>
                    <div style={{ fontSize: "0.86rem", color: t.inkMuted, lineHeight: 1.6, flex: 1 }}>{p.desc}</div>
                    {isLocked(p) ? (
                      <div style={{ padding: "10px 11px", borderRadius: 10, border: `1.25px solid ${t.blue}55`, background: t.blue + "10", color: t.ink, fontSize: "0.8rem", lineHeight: 1.45 }}>
                        <strong>Pro unlock:</strong> full visualization, custom editable inputs, and saved study flow for this topic.
                      </div>
                    ) : !isPro && p.category === FREE_CATEGORY ? (
                      <div style={{ padding: "8px 10px", borderRadius: 10, border: `1.25px solid ${t.green}55`, background: t.green + "10", color: t.green, fontSize: "0.78rem", fontWeight: 800 }}>
                        Free to visualize
                      </div>
                    ) : null}
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
                      {p.tags.slice(0, 2).map(tag => (
                        <span key={tag} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.69rem", padding: "2px 7px", border: `1.5px solid ${t.border}`, borderRadius: 20, background: t.surfaceAlt, color: t.inkMuted }}>{tag}</span>
                      ))}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.84rem", color: t.inkMuted }}>{p.category}</span>
                      <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.9rem", fontWeight: 700, color: isLocked(p) ? t.red : t.blue }}>
                        {isLocked(p) ? "See Pro plans →" : "Visualize →"}
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
