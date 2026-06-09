import NavBar from "../components/ui/NavBar";
import { Card } from "../components/ui/Card";
import Button from "../components/ui/Button";
import SectionHeader from "../components/ui/SectionHeader";
import AccountMenuChip from "../components/ui/AccountMenuChip";
import PageContainer from "../components/ui/PageContainer";
import { trackEvent } from "../utils/analytics";

import { PROB_LIST, DIFF_COLOR, CAT_ICON } from "../data/problems";

const FREE_CATEGORY = "Famous Algorithms";

export default function HomePage({ t, themeMode, setThemeMode, onNavigate, onLogout, username, user, mobile, recent, onSelectProblem, isPro, learning }) {
  const categoryCount = new Set(PROB_LIST.map((p) => p.category)).size;
  const isLocked = (p) => p && !isPro && p.category !== FREE_CATEGORY;
  const dueReviews = learning?.dueReviewItems || [];

  const handleCardKeyDown = (e, action) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  };
  const goTo = (destination, source) => {
    trackEvent("landing_cta_click", { destination, source });
    onNavigate(destination);
  };
  const openProblemFromHome = (problemId, source) => {
    trackEvent("problem_opened", { problemId, source });
    onSelectProblem(problemId);
  };

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: t.bg, color: t.ink, minHeight: "100vh" }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 3px; }
      `}</style>

      <NavBar page="home" onNavigate={onNavigate} t={t} themeMode={themeMode} mobile={mobile}
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

      {/* Hero */}
      <PageContainer mobile={mobile} maxWidth={760} paddingMobile="40px 16px 32px" paddingDesktop="72px 24px 48px">
        <div style={{ textAlign: "center" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 12px", borderRadius: 999, background: t.surface, border: `1.25px solid ${t.border}`, color: t.inkMuted, fontSize: "0.84rem", fontWeight: 800 }}>
            Interactive algorithm learning platform
          </span>
          <h1 style={{ fontFamily: "'Caveat',cursive", fontSize: "clamp(2.4rem,5.2vw,3.8rem)", fontWeight: 700, color: t.ink, margin: "16px 0 14px", lineHeight: 1.05 }}>
            Understand algorithms by watching the code execute.
          </h1>
          <p style={{ fontSize: "1.05rem", color: t.inkMuted, lineHeight: 1.7, margin: "0 auto 26px", maxWidth: 580 }}>
            VisCode combines line-by-line code, animated data structures, and clear explanations — so you move from memorizing solutions to understanding patterns.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Button t={t} variant="primary" size="lg" onClick={() => goTo("problems", "hero_primary")} style={{ borderWidth: 2 }}>
              Explore problems →
            </Button>
            {!isPro ? (
              <Button t={t} variant="secondary" size="lg" onClick={() => goTo("billing", "hero_secondary")} style={{ borderWidth: 2 }}>
                View Pro options
              </Button>
            ) : (
              <Button t={t} variant="ghost" size="lg" onClick={() => goTo("problems", "hero_pro_browse")} style={{ borderWidth: 2, boxShadow: t.shadowSm }}>
                Browse full library
              </Button>
            )}
          </div>
        </div>
      </PageContainer>

      {/* Stats bar */}
      <div style={{ display: "flex", justifyContent: "center", borderTop: `1.5px solid ${t.border}`, borderBottom: `1.5px solid ${t.border}`, background: t.surface, flexWrap: "wrap" }}>
        {[{ n: `${PROB_LIST.length}+`, l: "Visual Problems" }, { n: `${categoryCount}`, l: "Topic Categories" }, { n: "4", l: "Code Languages" }, { n: "∞", l: "Practice Runs" }].map((s, i, a) => (
          <div key={i} style={{ padding: mobile ? "14px 20px" : "22px 40px", textAlign: "center", borderRight: i < a.length - 1 ? `1.5px solid ${t.border}` : "none", flex: mobile ? "1 1 40%" : undefined }}>
            <div style={{ fontFamily: "'Caveat',cursive", fontSize: "2rem", fontWeight: 700, color: t.blue }}>{s.n}</div>
            <div style={{ fontSize: "0.86rem", color: t.inkMuted, marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Continue where you left off */}
      {recent?.length > 0 && (
        <PageContainer mobile={mobile} paddingMobile="32px 12px 0" paddingDesktop="48px 24px 0">
          <SectionHeader t={t} title="Continue Where You Left Off" compact style={{ marginBottom: 16 }} />
          <div style={{ display: "flex", gap: 12, overflowX: mobile ? "auto" : "hidden", WebkitOverflowScrolling: "touch", paddingBottom: 8 }}>
            {recent.slice(0, 5).map(id => {
              const p = PROB_LIST.find(x => x.id === id);
              if (!p) return null;
              const dc = DIFF_COLOR[p.difficulty] || {};
              return (
              <Card key={id} t={t} density="compact" onClick={() => openProblemFromHome(id, "recent")}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${p.title}`}
                  onKeyDown={(e) => handleCardKeyDown(e, () => openProblemFromHome(id, "recent_keyboard"))}
                  style={{ flex: mobile ? "0 0 180px" : "1 1 0%", minWidth: 0, padding: "14px 16px", cursor: "pointer", boxShadow: t.shadowSm, transition: "transform 0.12s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = ""}
                  onFocus={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `${t.shadowSm}, 0 0 0 2px ${t.blue}66`; }}
                  onBlur={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = t.shadowSm; }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: "1.1rem" }}>{CAT_ICON[p.category] || "📌"}</span>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {isLocked(p) && (
                        <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.74rem", fontWeight: 700, color: t.red, padding: "1px 8px", borderRadius: 8, border: `1.5px solid ${t.border}`, background: t.red + "14" }}>
                          🔒 Pro
                        </span>
                      )}
                      <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.74rem", fontWeight: 700, padding: "1px 8px", border: `1.5px solid ${t.border}`, borderRadius: 8, ...dc }}>{p.difficulty}</span>
                    </div>
                  </div>
                  <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1.05rem", fontWeight: 700, color: t.ink, lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
                  <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.84rem", color: isLocked(p) ? t.red : t.blue, marginTop: 6, fontWeight: 700 }}>
                    {isLocked(p) ? "Upgrade to open →" : "Resume →"}
                  </div>
                </Card>
              );
            })}
          </div>
        </PageContainer>
      )}

      {/* Review queue */}
      {dueReviews.length > 0 && (
        <PageContainer mobile={mobile} maxWidth={1080} paddingMobile="20px 12px 0" paddingDesktop="24px 24px 0">
          <Card t={t} density="compact" style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1.2rem", fontWeight: 700, color: t.ink }}>
                  Review queue
                </div>
                <div style={{ fontSize: "0.83rem", color: t.inkMuted }}>
                  {dueReviews.length} problem{dueReviews.length === 1 ? "" : "s"} due for spaced repetition.
                </div>
              </div>
              <Button t={t} variant="secondary" onClick={() => openProblemFromHome(dueReviews[0].problemId, "review_queue")} style={{ borderRadius: 8 }}>
                Start review
              </Button>
            </div>
          </Card>
        </PageContainer>
      )}

      {/* Famous Algorithms */}
      <PageContainer mobile={mobile} paddingMobile="40px 12px 0" paddingDesktop="48px 24px 0">
        <SectionHeader
          t={t}
          title="Start with Famous Algorithms"
          subtitle="Explore core graph, dynamic programming, and data structure algorithms — free for everyone."
          compact
          style={{ marginBottom: 20 }}
          action={!isPro ? (
            <Button t={t} variant="ghost" size="sm" onClick={() => goTo("billing", "famous_header")} style={{ color: t.blue, borderColor: t.blue }}>
              View full library
            </Button>
          ) : null}
        />
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8, flexWrap: mobile ? "nowrap" : "wrap", WebkitOverflowScrolling: "touch" }}>
          {PROB_LIST.filter(p => p.category === "Famous Algorithms").slice(0, mobile ? 6 : 14).map(p => {
            const dc = DIFF_COLOR[p.difficulty] || {};
            return (
              <Card key={p.id} t={t} density="compact" onClick={() => openProblemFromHome(p.id, "famous_strip")}
                role="button"
                tabIndex={0}
                aria-label={`Open ${p.title}`}
                onKeyDown={(e) => handleCardKeyDown(e, () => openProblemFromHome(p.id, "famous_strip_keyboard"))}
                style={{ flex: mobile ? "0 0 140px" : "1 1 120px", minWidth: 0, padding: "12px 14px", cursor: "pointer", boxShadow: t.shadowSm, transition: "transform 0.12s" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={e => e.currentTarget.style.transform = ""}
                onFocus={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `${t.shadowSm}, 0 0 0 2px ${t.blue}66`; }}
                onBlur={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = t.shadowSm; }}>
                <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.7rem", fontWeight: 700, padding: "1px 6px", border: `1.5px solid ${t.border}`, borderRadius: 6, ...dc }}>{p.difficulty}</span>
                <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.95rem", fontWeight: 700, color: t.ink, marginTop: 6, lineHeight: 1.25 }}>{p.title}</div>
              </Card>
            );
          })}
        </div>
        <Button t={t} variant="ghost" onClick={() => { trackEvent("landing_cta_click", { destination: "problems", source: "view_all_famous" }); onNavigate("problems", "?cat=Famous+Algorithms"); }}
          style={{ marginTop: 16, borderRadius: 8, color: t.blue }}>
          View all Famous Algorithms →
        </Button>
      </PageContainer>

      {/* CTA footer */}
      <div style={{ textAlign: "center", padding: "48px 24px 56px", marginTop: 48, borderTop: `1.5px solid ${t.border}`, background: t.surface }}>
        <h2 style={{ fontFamily: "'Caveat',cursive", fontSize: "2rem", fontWeight: 700, color: t.ink, marginBottom: 12 }}>
          {isPro ? "Continue your practice session" : "Ready to start practicing?"}
        </h2>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Button t={t} variant="primary" size="lg" onClick={() => goTo("problems", "footer_primary")}
            style={{ padding: "14px 44px", borderWidth: 2 }}>
            Browse problems
          </Button>
          {!isPro && (
            <Button t={t} variant="secondary" size="lg" onClick={() => goTo("billing", "footer_secondary")}
              style={{ padding: "14px 36px", borderWidth: 2 }}>
              View Pro plans
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
