import NavBar from "../components/ui/NavBar";
import { Card } from "../components/ui/Card";
import Button from "../components/ui/Button";
import SectionHeader from "../components/ui/SectionHeader";
import AccountMenuChip from "../components/ui/AccountMenuChip";
import PageContainer from "../components/ui/PageContainer";

import { PROB_LIST, DIFF_COLOR, CAT_ICON } from "../data/problems";

const FREE_CATEGORY = "Famous Algorithms";

const PRO_BENEFITS = [
  { icon: "01", title: "Complete topic coverage", desc: "Practice across arrays, trees, graphs, dynamic programming, sliding window, stacks, linked lists, and more." },
  { icon: "02", title: "Custom input practice", desc: "Adjust arrays, matrices, trees, strings, and weighted graphs to test edge cases and deepen understanding." },
  { icon: "03", title: "Personal study notes", desc: "Capture patterns, mistakes, hints, and interview reminders directly beside each problem." },
  { icon: "04", title: "Structured review workflow", desc: "Use favorites, flags, recent problems, and synced code lines to keep practice organized." },
];

const WORKFLOW_POINTS = [
  "Visualize each algorithm step by step",
  "Follow highlighted code as state changes",
  "Review explanations in plain language",
  "Return to recent and flagged problems",
];

export default function HomePage({ t, themeMode, setThemeMode, onNavigate, onLogout, username, user, mobile, recent, onSelectProblem, isPro }) {
  const freeCount = PROB_LIST.filter((p) => p.category === FREE_CATEGORY).length;
  const premiumCount = PROB_LIST.length - freeCount;
  const categoryCount = new Set(PROB_LIST.map((p) => p.category)).size;
  const isLocked = (p) => p && !isPro && p.category !== FREE_CATEGORY;
  const handleCardKeyDown = (e, action) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  };
  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: t.bg, color: t.ink, minHeight: "100vh" }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
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
      <PageContainer mobile={mobile} maxWidth={1080} paddingMobile="36px 16px 28px" paddingDesktop="68px 24px 52px">
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.2fr 0.8fr", gap: mobile ? 28 : 42, alignItems: "center" }}>
          <div style={{ textAlign: mobile ? "center" : "left" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 12px", borderRadius: 999, background: t.surface, border: `1.25px solid ${t.border}`, color: t.inkMuted, fontSize: "0.84rem", fontWeight: 800 }}>
              Interactive algorithm learning platform
            </span>
            <h1 style={{ fontFamily: "'Caveat',cursive", fontSize: "clamp(2.4rem,5.2vw,4rem)", fontWeight: 700, color: t.ink, margin: "16px 0 14px", lineHeight: 1.05 }}>
              Understand algorithms by watching the code execute.
            </h1>
            <p style={{ fontSize: "1.05rem", color: t.inkMuted, lineHeight: 1.75, margin: "0 0 24px", maxWidth: 620, marginLeft: mobile ? "auto" : 0, marginRight: mobile ? "auto" : 0 }}>
              VisCode combines line-by-line code, animated data structures, and guided explanations so learners can move from memorizing solutions to understanding patterns.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: 8, margin: "0 0 24px", maxWidth: 640 }}>
              {WORKFLOW_POINTS.map((point) => (
                <div key={point} style={{ display: "flex", alignItems: "center", gap: 8, color: t.inkMuted, fontSize: "0.88rem" }}>
                  <span style={{ color: t.green, fontWeight: 900 }}>✓</span>
                  <span>{point}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: mobile ? "center" : "flex-start", flexWrap: "wrap" }}>
              <Button t={t} variant="primary" size="lg" onClick={() => onNavigate("problems")} style={{ borderWidth: 2 }}>
                Explore problems →
              </Button>
              {!isPro ? (
                <Button t={t} variant="secondary" size="lg" onClick={() => onNavigate("billing")} style={{ borderWidth: 2 }}>
                  View Pro options
                </Button>
              ) : (
                <Button t={t} variant="ghost" size="lg" onClick={() => onNavigate("problems")} style={{ borderWidth: 2, boxShadow: t.shadowSm }}>
                  Browse full library
                </Button>
              )}
            </div>
          </div>

          <Card t={t} density="compact" style={{ padding: mobile ? 16 : 18, background: `linear-gradient(135deg, ${t.surface} 0%, ${t.surfaceAlt} 100%)`, alignSelf: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "#1c1c2e", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: t.shadowSm, flexShrink: 0 }}>
                <svg width={26} height={26} viewBox="0 0 40 40" fill="none" aria-hidden="true">
                  <line x1="20" y1="7" x2="20" y2="33" stroke="white" strokeWidth="4.5" strokeLinecap="round" />
                  <line x1="31.26" y1="13.5" x2="8.74" y2="26.5" stroke="white" strokeWidth="4.5" strokeLinecap="round" />
                  <line x1="8.74" y1="13.5" x2="31.26" y2="26.5" stroke="white" strokeWidth="4.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1.15rem", fontWeight: 700, color: t.ink, lineHeight: 1 }}>
                  Learning dashboard
                </div>
                <div style={{ fontSize: "0.78rem", color: t.inkMuted, marginTop: 3 }}>
                  Code, visuals, and practice tools
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {[
                { label: "Supported languages", value: "4" },
                { label: "Free algorithm set", value: freeCount },
                { label: "Practice library", value: `${PROB_LIST.length}+` },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "9px 10px", borderRadius: 10, background: t.bg, border: `1.25px solid ${t.border}` }}>
                  <span style={{ color: t.inkMuted, fontSize: "0.8rem" }}>{item.label}</span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 900, color: t.ink, fontSize: "0.86rem" }}>{item.value}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1.25px solid ${t.border}`, color: t.inkMuted, fontSize: "0.8rem", lineHeight: 1.5 }}>
              Built for guided repetition: pick a problem, run the visualizer, review the code, then revisit it later.
            </div>
          </Card>
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

      {!isPro && (
        <PageContainer mobile={mobile} maxWidth={1080} paddingMobile="32px 12px 0" paddingDesktop="44px 24px 0">
          <Card t={t} style={{ padding: mobile ? 18 : 22, background: t.surface }}>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr auto", gap: 18, alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1.55rem", fontWeight: 700, color: t.ink, marginBottom: 6 }}>
                  Start with the free algorithm set, then unlock the full workflow.
                </div>
                <p style={{ margin: 0, color: t.inkMuted, fontSize: "0.92rem", lineHeight: 1.6 }}>
                  Famous Algorithms are available for everyone. Pro adds the full topic library, custom inputs, personal notes, and better tools for repeated interview practice.
                </p>
              </div>
              <Button t={t} variant="primary" onClick={() => onNavigate("billing")} style={{ borderRadius: 10, whiteSpace: "nowrap" }}>
                Compare Pro plans →
              </Button>
            </div>
          </Card>
        </PageContainer>
      )}

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
              <Card key={id} t={t} density="compact" onClick={() => onSelectProblem(id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${p.title}`}
                  onKeyDown={(e) => handleCardKeyDown(e, () => onSelectProblem(id))}
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

      {/* Famous Algorithms */}
      <PageContainer mobile={mobile} paddingMobile="40px 12px 0" paddingDesktop="48px 24px 0">
        <SectionHeader
          t={t}
          title="Start with Famous Algorithms"
          subtitle="Explore core graph, dynamic programming, and data structure algorithms before moving into the full practice library."
          compact
          style={{ marginBottom: 20 }}
          action={!isPro ? (
            <Button t={t} variant="ghost" size="sm" onClick={() => onNavigate("billing")} style={{ color: t.blue, borderColor: t.blue }}>
              View full library
            </Button>
          ) : null}
        />
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8, flexWrap: mobile ? "nowrap" : "wrap", WebkitOverflowScrolling: "touch" }}>
          {PROB_LIST.filter(p => p.category === "Famous Algorithms").slice(0, mobile ? 6 : 14).map(p => {
            const dc = DIFF_COLOR[p.difficulty] || {};
            return (
              <Card key={p.id} t={t} density="compact" onClick={() => onSelectProblem(p.id)}
                role="button"
                tabIndex={0}
                aria-label={`Open ${p.title}`}
                onKeyDown={(e) => handleCardKeyDown(e, () => onSelectProblem(p.id))}
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
        <Button t={t} variant="ghost" onClick={() => onNavigate("problems", "?cat=Famous+Algorithms")}
          style={{ marginTop: 16, borderRadius: 8, color: t.blue }}>
          View all Famous Algorithms →
        </Button>
      </PageContainer>

      {/* Pro value */}
      {!isPro && (
        <PageContainer mobile={mobile} maxWidth={1080} paddingMobile="44px 12px 0" paddingDesktop="56px 24px 0">
          <SectionHeader
            t={t}
            title="What Pro adds"
            subtitle="Pro expands VisCode into a complete interview-preparation workspace."
            compact
            style={{ marginBottom: 18 }}
            action={(
              <Button t={t} variant="primary" size="sm" onClick={() => onNavigate("billing")}>
                View plans
              </Button>
            )}
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
            {PRO_BENEFITS.map((item) => (
              <Card key={item.title} t={t} density="compact" style={{ padding: 18, boxShadow: t.shadowSm, background: t.surface }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 10, background: t.blue + "18", color: t.blue, border: `1.25px solid ${t.blue}66`, fontSize: "0.75rem", fontWeight: 900, marginBottom: 10 }}>{item.icon}</div>
                <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1.12rem", fontWeight: 700, color: t.ink, marginBottom: 6 }}>
                  {item.title}
                </div>
                <p style={{ margin: 0, fontSize: "0.86rem", color: t.inkMuted, lineHeight: 1.6 }}>
                  {item.desc}
                </p>
              </Card>
            ))}
          </div>
        </PageContainer>
      )}

      {/* How it works */}
      <PageContainer mobile={mobile} paddingMobile="48px 12px" paddingDesktop="56px 24px">
        <SectionHeader t={t} title="A Clear Learning Loop" compact style={{ marginBottom: 24, justifyContent: "center", textAlign: "center" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
          {[
            { n: "01", icon: "📋", title: "Select a topic",  desc: "Choose a free algorithm or continue into the complete practice library." },
            { n: "02", icon: "▶",  title: "Run the walkthrough", desc: "Watch the algorithm advance step by step while the matching code line stays highlighted." },
            { n: "03", icon: "💡", title: "Connect the idea", desc: "Use concise explanations to understand the decision behind each state change." },
            { n: "04", icon: "🔁", title: "Review and repeat", desc: "Use editable inputs, notes, favorites, and flags to reinforce patterns over time." },
          ].map((item, i) => (
            <Card key={i} t={t} density="compact" style={{ padding: 20, boxShadow: t.shadowSm }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.68rem", fontWeight: 700, color: t.blue, background: t.blue + "22", padding: "2px 8px", borderRadius: 5 }}>{item.n}</span>
                <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
              </div>
              <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1.1rem", fontWeight: 700, color: t.ink, marginBottom: 6 }}>{item.title}</div>
              <div style={{ fontSize: "0.87rem", color: t.inkMuted, lineHeight: 1.6 }}>{item.desc}</div>
            </Card>
          ))}
        </div>
      </PageContainer>

      {/* CTA footer */}
      <div style={{ textAlign: "center", padding: "48px 24px 56px", borderTop: `1.5px solid ${t.border}`, background: t.surface }}>
        <h2 style={{ fontFamily: "'Caveat',cursive", fontSize: "2rem", fontWeight: 700, color: t.ink, marginBottom: 12 }}>
          {isPro ? "Continue your practice session" : "Build a stronger interview routine"}
        </h2>
        <p style={{ color: t.inkMuted, marginBottom: 24, fontSize: "0.95rem" }}>
          {isPro ? "Use the full workspace to keep building interview confidence." : "Start with free algorithms, then upgrade when you want the full library and advanced practice tools."}
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Button t={t} variant="primary" size="lg" onClick={() => onNavigate("problems")}
            style={{ padding: "14px 44px", borderWidth: 2 }}>
            Browse problems
          </Button>
          {!isPro && (
            <Button t={t} variant="secondary" size="lg" onClick={() => onNavigate("billing")}
              style={{ padding: "14px 36px", borderWidth: 2 }}>
              View Pro plans
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
