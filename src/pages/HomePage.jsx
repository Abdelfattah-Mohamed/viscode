import NavBar from "../components/ui/NavBar";
import { Card } from "../components/ui/Card";
import SectionHeader from "../components/ui/SectionHeader";
import AccountMenuChip from "../components/ui/AccountMenuChip";
import PageContainer from "../components/ui/PageContainer";

import { PROB_LIST, DIFF_COLOR, CAT_ICON } from "../data/problems";

export default function HomePage({ t, themeMode, setThemeMode, onNavigate, onLogout, username, user, mobile, recent, onSelectProblem, isPro }) {
  const isLocked = (p) => p && !isPro && p.category !== "Famous Algorithms";
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
      <div style={{ textAlign: "center", padding: mobile ? "40px 16px 32px" : "72px 24px 56px", maxWidth: 760, margin: "0 auto" }}>
        <div style={{ marginBottom: 28, animation: "float 3.5s ease-in-out infinite", display: "inline-block" }}>
          <svg width={96} height={96} viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <rect width="40" height="40" rx="9" fill="#1c1c2e" />
            <line x1="20" y1="7"  x2="20"    y2="33"   stroke="white" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="31.26" y1="13.5" x2="8.74"  y2="26.5" stroke="white" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="8.74"  y1="13.5" x2="31.26" y2="26.5" stroke="white" strokeWidth="4.5" strokeLinecap="round" />
          </svg>
        </div>
        <h1 style={{ fontFamily: "'Caveat',cursive", fontSize: "clamp(2.2rem,5vw,3.6rem)", fontWeight: 700, color: t.ink, margin: "0 0 18px", lineHeight: 1.2 }}>
          Learn DSA by <span style={{ color: t.blue }}>Seeing It Work</span>
        </h1>
        <p style={{ fontSize: "1.05rem", color: t.inkMuted, lineHeight: 1.75, margin: "0 0 36px", maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
          VisCode runs algorithms step-by-step with live animations synced to real code in C++, Java, JavaScript, and Python.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => onNavigate("problems")}
            style={{ padding: "14px 36px", border: `2px solid ${t.border}`, borderRadius: 10, background: t.ink, color: t.yellow, fontFamily: "'Caveat',cursive", fontSize: "1.2rem", fontWeight: 700, cursor: "pointer", boxShadow: t.shadow }}>
            Start Visualizing →
          </button>
          <button onClick={() => onNavigate("problems")}
            style={{ padding: "14px 36px", border: `2px solid ${t.border}`, borderRadius: 10, background: "transparent", color: t.ink, fontFamily: "'Caveat',cursive", fontSize: "1.2rem", fontWeight: 700, cursor: "pointer", boxShadow: t.shadowSm }}>
            Browse Problems
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: "flex", justifyContent: "center", borderTop: `1.5px solid ${t.border}`, borderBottom: `1.5px solid ${t.border}`, background: t.surface, flexWrap: "wrap" }}>
        {[{ n: "100+", l: "Problems Visualized" }, { n: "4", l: "Languages" }, { n: "Blind 75", l: "Coverage" }, { n: "∞", l: "Practice Runs" }].map((s, i, a) => (
          <div key={i} style={{ padding: mobile ? "14px 20px" : "22px 40px", textAlign: "center", borderRight: i < a.length - 1 ? `1.5px solid ${t.border}` : "none", flex: mobile ? "1 1 40%" : undefined }}>
            <div style={{ fontFamily: "'Caveat',cursive", fontSize: "2rem", fontWeight: 700, color: t.blue }}>{s.n}</div>
            <div style={{ fontSize: "0.82rem", color: t.inkMuted, marginTop: 2 }}>{s.l}</div>
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
                        <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.7rem", fontWeight: 700, color: t.red }}>
                          🔒 Pro
                        </span>
                      )}
                      <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.7rem", fontWeight: 700, padding: "1px 8px", border: `1.5px solid ${t.border}`, borderRadius: 8, ...dc }}>{p.difficulty}</span>
                    </div>
                  </div>
                  <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1.05rem", fontWeight: 700, color: t.ink, lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
                  <div style={{ fontFamily: "'Caveat',cursive", fontSize: "0.8rem", color: isLocked(p) ? t.red : t.blue, marginTop: 6, fontWeight: 700 }}>
                    {isLocked(p) ? "Upgrade to open →" : "Resume →"}
                  </div>
                </Card>
              );
            })}
          </div>
        </PageContainer>
      )}

      {/* Famous Algorithms */}
      <PageContainer mobile={mobile} paddingMobile="40px 12px 0" paddingDesktop="56px 24px 0">
        <SectionHeader
          t={t}
          title="⭐ Famous Algorithms"
          subtitle="Bellman-Ford, Floyd-Warshall, Kosaraju, Tarjan, Kruskal's MST, A*, Dijkstra, Prim's, BFS, DFS, Union-Find, Fenwick Tree, Segment Tree, 0/1 Knapsack and more."
          compact
          style={{ marginBottom: 20 }}
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
        <button onClick={() => onNavigate("problems", "?cat=Famous+Algorithms")}
          style={{ marginTop: 16, padding: "8px 20px", border: `1.5px solid ${t.border}`, borderRadius: 8, background: "transparent", color: t.blue, fontFamily: "'Caveat',cursive", fontSize: "1rem", fontWeight: 700, cursor: "pointer" }}>
          View all Famous Algorithms →
        </button>
      </PageContainer>

      {/* How it works */}
      <PageContainer mobile={mobile} paddingMobile="48px 12px" paddingDesktop="60px 24px">
        <SectionHeader t={t} title="How It Works" compact style={{ marginBottom: 24, justifyContent: "center", textAlign: "center" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
          {[
            { n: "01", icon: "📋", title: "Pick a Problem",  desc: "Browse 7 Blind 75 problems across Arrays, Sliding Window, Binary Search, and DP." },
            { n: "02", icon: "▶",  title: "Hit Play",        desc: "Watch the algorithm run step-by-step with smooth animations." },
            { n: "03", icon: "💡", title: "Understand Why",  desc: "Plain-English explanations for every decision the algorithm makes." },
            { n: "04", icon: "🔁", title: "Practice",        desc: "Edit the input, switch languages, adjust speed — replay until it clicks." },
          ].map((item, i) => (
            <Card key={i} t={t} density="compact" style={{ padding: 20, boxShadow: t.shadowSm }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.68rem", fontWeight: 700, color: t.blue, background: t.blue + "22", padding: "2px 8px", borderRadius: 5 }}>{item.n}</span>
                <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
              </div>
              <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1.1rem", fontWeight: 700, color: t.ink, marginBottom: 6 }}>{item.title}</div>
              <div style={{ fontSize: "0.83rem", color: t.inkMuted, lineHeight: 1.6 }}>{item.desc}</div>
            </Card>
          ))}
        </div>
      </PageContainer>

      {/* CTA footer */}
      <div style={{ textAlign: "center", padding: "48px 24px 64px", borderTop: `1.5px solid ${t.border}`, background: t.surface }}>
        <h2 style={{ fontFamily: "'Caveat',cursive", fontSize: "2rem", fontWeight: 700, color: t.ink, marginBottom: 14 }}>Ready to level up? 🎯</h2>
        <p style={{ color: t.inkMuted, marginBottom: 28, fontSize: "0.95rem" }}>Ace your next technical interview, one visual at a time.</p>
        <button onClick={() => onNavigate("problems")}
          style={{ padding: "14px 44px", border: `2px solid ${t.border}`, borderRadius: 10, background: t.ink, color: t.yellow, fontFamily: "'Caveat',cursive", fontSize: "1.2rem", fontWeight: 700, cursor: "pointer", boxShadow: t.shadow }}>
          Start for Free →
        </button>
      </div>
    </div>
  );
}
