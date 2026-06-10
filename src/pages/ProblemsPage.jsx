import { useState, useEffect, useCallback, useRef } from "react";
import NavBar from "../components/ui/NavBar";
import SectionHeader from "../components/ui/SectionHeader";
import AccountMenuChip from "../components/ui/AccountMenuChip";
import PageContainer from "../components/ui/PageContainer";
import Button from "../components/ui/Button";
import { PROB_LIST, DIFF_COLOR, CAT_ICON } from "../data/problems";
import { trackEvent } from "../utils/analytics";

const FREE_CATEGORY = "Famous Algorithms";

const PRO_VALUE_POINTS = [
  "Every category",
  "Editable inputs",
  "Favorites & flags",
  "Full visual library",
];

const TARGET_PER_PAGE = 16;
const MIN_CARD_WIDTH = 260;
const GRID_GAP = 16;

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
  const [page, setPage] = useState(0);
  const [cols, setCols] = useState(mobile ? 1 : 3);
  const gridMeasureRef = useRef(null);

  // Measure how many cards fit per row so a page fills whole rows (≈16 per page).
  useEffect(() => {
    const el = gridMeasureRef.current;
    if (!el) return;
    const compute = () => {
      const width = el.clientWidth || 0;
      const c = Math.max(1, Math.floor((width + GRID_GAP) / (MIN_CARD_WIDTH + GRID_GAP)));
      setCols(c);
    };
    compute();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(compute);
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // 2 cols -> 16, 3 cols -> 15, 4 cols -> 16, etc. (largest multiple of cols ≤ 16)
  const pageSize = Math.floor(TARGET_PER_PAGE / cols) * cols || TARGET_PER_PAGE;

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
    ...(categories.includes("Sorting") ? ["Sorting"] : []),
    ...categories.filter((c) => c !== "Famous Algorithms" && c !== "Sorting").sort(),
  ];
  const countFor = (cat) => (cat === "All" ? PROB_LIST.length : PROB_LIST.filter((p) => p.category === cat).length);

  useEffect(() => {
    setPage(0);
  }, [search, filter, flagFilter]);

  const filtered = PROB_LIST.filter(p => {
    if (filter !== "All" && p.category !== filter) return false;
    const q = search.trim().toLowerCase();
    if (q) {
      const matchesText =
        p.title.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q) ||
        p.id.includes(q);
      if (!matchesText) return false;
    }
    if (flagFilter === "favorites" && !fav?.isFavorite(p.id)) return false;
    if (flagFilter === "flagged" && !fav?.isFlagged(p.id)) return false;
    return true;
  });
  const orderIndex = new Map(PROB_LIST.map((p, i) => [p.id, i]));
  const list = filter === "All"
    ? [...filtered].sort((a, b) => orderIndex.get(a.id) - orderIndex.get(b.id))
    : filtered;
  const pageCount = Math.max(1, Math.ceil(list.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const pagedList = list.slice(safePage * pageSize, safePage * pageSize + pageSize);
  const freeCount = PROB_LIST.filter((p) => p.category === FREE_CATEGORY).length;
  const premiumCount = PROB_LIST.length - freeCount;
  const categoryCount = categories.length;
  const lockedCount = PROB_LIST.filter((p) => !isPro && p.category !== FREE_CATEGORY).length;
  const visibleLockedCount = list.filter((p) => !isPro && p.category !== FREE_CATEGORY).length;
  const isLocked = (p) => !isPro && p.category !== FREE_CATEGORY;
  const hasActiveFilters = filter !== "All" || flagFilter !== "all" || search.trim() !== "";
  const clearFilters = () => {
    setSearch("");
    setFilter("All");
    setFlagFilter("all");
  };
  const handleCardKeyDown = (e, action) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  };
  const openProblem = (problemId, source) => {
    trackEvent("problem_opened", { problemId, source, fromPage: "problems" });
    onSelectProblem(problemId);
  };
  const goBilling = (source) => {
    trackEvent("landing_cta_click", { destination: "billing", source });
    onNavigate("billing");
  };

  const heroStats = [
    { label: "Problems", value: `${PROB_LIST.length}+` },
    { label: "Categories", value: categoryCount },
    { label: "Free", value: freeCount },
    { label: isPro ? "Unlocked" : "Pro", value: isPro ? PROB_LIST.length : premiumCount },
  ];

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

      <main id="main-content">
      <PageContainer mobile={mobile} maxWidth={1080} paddingMobile="24px 12px 40px" paddingDesktop="36px 24px 60px">
        {/* Header */}
        <div style={{ marginBottom: 22 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 11px", borderRadius: 999, background: t.blue + "18", border: `1.25px solid ${t.blue}66`, color: t.blue, fontSize: "0.8rem", fontWeight: 800 }}>
            {isPro ? "Pro library unlocked" : "Famous Algorithms are free"}
          </span>
          <h1 style={{ fontFamily: "'Caveat',cursive", fontSize: mobile ? "2.3rem" : "3rem", lineHeight: 1.02, color: t.ink, margin: "12px 0 8px" }}>
            Choose what to master next.
          </h1>
          <p style={{ margin: 0, color: t.inkMuted, fontSize: "0.98rem", lineHeight: 1.6, maxWidth: 620 }}>
            Browse step-by-step visual problems across interview topics — watch the code execute while the data structure animates.
          </p>

          {/* Inline stat chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
            {heroStats.map((s) => (
              <div key={s.label} style={{ display: "flex", alignItems: "baseline", gap: 6, padding: "7px 12px", borderRadius: 10, border: `1.25px solid ${t.border}`, background: t.surface }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 900, color: t.ink, fontSize: "0.95rem" }}>{s.value}</span>
                <span style={{ color: t.inkMuted, fontSize: "0.8rem", fontWeight: 600 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Slim Pro banner */}
        {!isPro && (
          <div
            style={{
              marginBottom: 22,
              border: `1.5px solid ${t.blue}55`,
              borderRadius: 14,
              background: `linear-gradient(135deg, ${t.blue}12 0%, ${t.surface} 70%)`,
              padding: mobile ? "14px 16px" : "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1.3rem", fontWeight: 700, color: t.ink }}>
                Unlock {premiumCount} more problems with Pro.
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                {PRO_VALUE_POINTS.map((point) => (
                  <span key={point} style={{ fontSize: "0.76rem", fontWeight: 700, color: t.inkMuted, background: t.surfaceAlt, border: `1px solid ${t.border}`, borderRadius: 999, padding: "3px 9px" }}>
                    ✓ {point}
                  </span>
                ))}
              </div>
            </div>
            <Button t={t} variant="primary" onClick={() => goBilling("upgrade_banner")} style={{ borderRadius: 10, whiteSpace: "nowrap" }}>
              View Pro plans →
            </Button>
          </div>
        )}

        {/* Recently Visited */}
        {recent?.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <SectionHeader t={t} title="Recently Visited" compact style={{ marginBottom: 12 }} />
            <div style={{ display: "flex", gap: 10, overflowX: mobile ? "auto" : "hidden", WebkitOverflowScrolling: "touch", paddingBottom: 6 }}>
              {recent.slice(0, 5).map(id => {
                const p = PROB_LIST.find(x => x.id === id);
                if (!p) return null;
                const dc = DIFF_COLOR[p.difficulty] || {};
                return (
                  <div key={id} onClick={() => openProblem(id, "recent")}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open ${p.title}`}
                    onKeyDown={(e) => handleCardKeyDown(e, () => openProblem(id, "recent_keyboard"))}
                    style={{ flex: mobile ? "0 0 170px" : "1 1 0%", minWidth: 0, padding: "12px 14px", background: t.surface, border: `1.5px solid ${t.border}`, borderRadius: 10, cursor: "pointer", boxShadow: t.shadowSm, transition: "transform 0.12s, box-shadow 0.12s" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = t.shadow; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = t.shadowSm; }}
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

        {/* Sticky search + filter toolbar (full-bleed so cards don't peek at the edges) */}
        <div
          style={{
            position: "sticky",
            top: 52,
            zIndex: 30,
            background: t.bg,
            paddingTop: 10,
            paddingBottom: 12,
            marginBottom: 8,
            marginLeft: mobile ? -12 : -24,
            marginRight: mobile ? -12 : -24,
            paddingLeft: mobile ? 12 : 24,
            paddingRight: mobile ? 12 : 24,
            borderBottom: `1.5px solid ${t.border}`,
            boxShadow: `0 6px 12px -8px ${t.border}`,
          }}
        >
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: t.inkMuted, pointerEvents: "none" }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by problem, topic, or skill…"
                style={{ width: "100%", padding: "10px 36px 10px 36px", border: `1.5px solid ${t.border}`, borderRadius: 10, background: t.surface, color: t.ink, fontFamily: "'DM Sans',sans-serif", fontSize: "0.9rem", outline: "none" }} />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", color: t.inkMuted, cursor: "pointer", fontSize: "1rem", lineHeight: 1, padding: 4 }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Segmented view control */}
            <div style={{ display: "inline-flex", border: `1.5px solid ${t.border}`, borderRadius: 10, overflow: "hidden", background: t.surface }}>
              {[
                { key: "all", label: "All", icon: null },
                { key: "favorites", label: "Favorites", icon: <StarIcon filled={flagFilter === "favorites"} size={14} /> },
                { key: "flagged", label: "Flagged", icon: <FlagIcon filled={flagFilter === "flagged"} size={14} /> },
              ].map((f, i) => {
                const active = flagFilter === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setFlagFilter(f.key)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: mobile ? "8px 10px" : "8px 13px",
                      border: "none",
                      borderLeft: i === 0 ? "none" : `1.5px solid ${t.border}`,
                      background: active ? t.blue + "18" : "transparent",
                      color: active ? t.blue : t.ink,
                      fontFamily: "'DM Sans',sans-serif",
                      fontSize: "0.84rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {f.icon}{f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category chips */}
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: mobile ? "nowrap" : "wrap", overflowX: mobile ? "auto" : "visible", paddingBottom: 4, marginTop: 10, WebkitOverflowScrolling: "touch" }}>
            {cats.map(cat => {
              const active = filter === cat;
              const freeCategory = cat === FREE_CATEGORY;
              return (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    whiteSpace: "nowrap",
                    padding: mobile ? "6px 11px" : "7px 13px",
                    borderRadius: 999,
                    cursor: "pointer",
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: "0.84rem",
                    fontWeight: 700,
                    border: `1.5px solid ${active ? (freeCategory ? t.yellow : t.ink) : freeCategory ? t.yellow : t.border}`,
                    background: active ? (freeCategory ? t.yellow : t.ink) : freeCategory ? t.yellow + "22" : t.surface,
                    color: active ? (freeCategory ? t.ink : t.surface) : t.ink,
                    boxShadow: freeCategory ? t.shadowSm : "none",
                    transition: "all 0.12s",
                  }}
                >
                  {freeCategory && <span aria-hidden="true">{CAT_ICON[FREE_CATEGORY]}</span>}
                  <span>{cat}</span>
                  <span style={{
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: "0.7rem",
                    fontWeight: 800,
                    padding: "1px 6px",
                    borderRadius: 999,
                    background: active ? (freeCategory ? t.ink + "22" : t.surface + "33") : t.surfaceAlt,
                    color: active ? (freeCategory ? t.ink : t.surface) : t.inkMuted,
                    border: `1px solid ${active ? "transparent" : t.border}`,
                  }}>
                    {countFor(cat)}
                  </span>
                  {freeCategory && !isPro && (
                    <span style={{ fontSize: "0.62rem", fontWeight: 900, letterSpacing: "0.04em", padding: "2px 6px", borderRadius: 999, background: active ? t.ink : t.green + "22", color: active ? t.yellow : t.green, border: `1px solid ${active ? t.ink : t.green + "66"}` }}>
                      FREE
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Result meta + clear */}
        <div ref={gridMeasureRef} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", margin: "8px 0 16px" }}>
          <div style={{ fontSize: "0.9rem", color: t.inkMuted }}>
            <strong style={{ color: t.ink }}>{list.length}</strong> result{list.length === 1 ? "" : "s"}
            {filter !== "All" && <> in <strong style={{ color: t.ink }}>{filter}</strong></>}
            {!isPro && visibleLockedCount > 0 && <> · {visibleLockedCount} Pro preview{visibleLockedCount === 1 ? "" : "s"}</>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {hasActiveFilters && (
              <Button t={t} variant="ghost" size="sm" onClick={clearFilters} style={{ borderRadius: 8 }}>
                Clear filters ✕
              </Button>
            )}
            {!isPro && (
              <Button t={t} variant="ghost" size="sm" onClick={() => goBilling("browse_header_unlock")} style={{ color: t.blue, borderColor: t.blue, borderRadius: 8 }}>
                Unlock all
              </Button>
            )}
          </div>
        </div>

        {/* Grid */}
        {list.length === 0
          ? (
            <div style={{ textAlign: "center", padding: "56px 20px" }}>
              <div style={{ fontSize: "2.2rem", marginBottom: 8 }}>🔍</div>
              <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1.5rem", color: t.ink, marginBottom: 6 }}>No problems match your filters</div>
              <p style={{ color: t.inkMuted, fontSize: "0.9rem", margin: "0 0 16px" }}>Try a different search term or category.</p>
              {hasActiveFilters && (
                <Button t={t} variant="secondary" onClick={clearFilters} style={{ borderRadius: 8 }}>
                  Clear all filters
                </Button>
              )}
            </div>
          )
          : <>
          {list.length > pageSize && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
              <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95rem", color: t.inkMuted }}>
                Showing {safePage * pageSize + 1}–{Math.min((safePage + 1) * pageSize, list.length)} of {list.length}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <Button t={t} variant="secondary" disabled={safePage === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} style={{ borderRadius: 8, opacity: safePage === 0 ? 0.5 : 1 }}>
                  ← Prev
                </Button>
                <Button t={t} variant="secondary" disabled={safePage >= pageCount - 1} onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))} style={{ borderRadius: 8, opacity: safePage >= pageCount - 1 ? 0.5 : 1 }}>
                  Next →
                </Button>
              </div>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill,minmax(${MIN_CARD_WIDTH}px,1fr))`, gap: GRID_GAP }}>
              {pagedList.map(p => {
                const dc = DIFF_COLOR[p.difficulty] || {};
                const accent = isLocked(p) ? t.blue : (dc.color || t.border);
                return (
                  <div key={p.id} onClick={() => openProblem(p.id, "grid")}
                    role="button"
                    tabIndex={0}
                    aria-label={`${isLocked(p) ? "Locked problem: " : "Open problem: "}${p.title}`}
                    onKeyDown={(e) => handleCardKeyDown(e, () => openProblem(p.id, "grid_keyboard"))}
                    style={{ background: t.surface, border: `1.5px solid ${isLocked(p) ? t.blue + "66" : t.border}`, borderLeft: `4px solid ${accent}`, borderRadius: 12, padding: "16px 18px", cursor: "pointer", boxShadow: t.shadowSm, transition: "transform 0.15s, box-shadow 0.15s", display: "flex", flexDirection: "column", gap: 11, position: "relative" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = t.shadow; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = t.shadowSm; }}
                    onFocus={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `${t.shadow}, 0 0 0 2px ${t.blue}66`; }}
                    onBlur={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = t.shadowSm; }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "'Caveat',cursive", fontSize: "0.85rem", fontWeight: 700, color: t.inkMuted }}>
                        <span style={{ fontSize: "1.25rem" }}>{CAT_ICON[p.category] || "📌"}</span>
                        {p.category}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
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
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      {isLocked(p) && (
                        <span aria-hidden="true" style={{ flexShrink: 0, width: 24, height: 24, borderRadius: "50%", background: t.blue + "16", border: `1.5px solid ${t.blue}66`, color: t.blue, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", marginTop: 2 }}>
                          🔒
                        </span>
                      )}
                      <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1.2rem", fontWeight: 700, color: t.ink, lineHeight: 1.25 }}>
                        {p.title}
                      </div>
                    </div>

                    <div style={{ fontSize: "0.86rem", color: t.inkMuted, lineHeight: 1.55, flex: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.desc}</div>

                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.75rem", fontWeight: 700, padding: "2px 9px", border: `1.5px solid ${t.border}`, borderRadius: 10, ...dc }}>{p.difficulty}</span>
                      {p.tags.slice(0, 2).map(tag => (
                        <span key={tag} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.68rem", padding: "2px 7px", border: `1.5px solid ${t.border}`, borderRadius: 20, background: t.surfaceAlt, color: t.inkMuted }}>{tag}</span>
                      ))}
                      {!isLocked(p) && !isPro && p.category === FREE_CATEGORY && (
                        <span style={{ fontSize: "0.68rem", fontWeight: 800, padding: "2px 8px", borderRadius: 20, background: t.green + "16", color: t.green, border: `1px solid ${t.green}55` }}>
                          FREE
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${t.border}`, paddingTop: 10, marginTop: 2 }}>
                      <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.84rem", color: t.inkMuted }}>
                        {isLocked(p) ? "Pro" : "Ready"}
                      </span>
                      <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95rem", fontWeight: 700, color: isLocked(p) ? t.blue : t.blue }}>
                        {isLocked(p) ? "Unlock →" : "Visualize →"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          {list.length > pageSize && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, flexWrap: "wrap", gap: 10 }}>
              <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95rem", color: t.inkMuted }}>
                Page {safePage + 1} of {pageCount}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <Button t={t} variant="secondary" disabled={safePage === 0} onClick={() => { setPage((p) => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{ borderRadius: 8, opacity: safePage === 0 ? 0.5 : 1 }}>
                  ← Prev
                </Button>
                <Button t={t} variant="secondary" disabled={safePage >= pageCount - 1} onClick={() => { setPage((p) => Math.min(pageCount - 1, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{ borderRadius: 8, opacity: safePage >= pageCount - 1 ? 0.5 : 1 }}>
                  Next →
                </Button>
              </div>
            </div>
          )}
          </>}
      </PageContainer>
      </main>
    </div>
  );
}
