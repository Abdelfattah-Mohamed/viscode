import NavBar from "../components/ui/NavBar";
import ThemeToggle from "../components/ui/ThemeToggle";

export default function HomePage({ t, themeMode, setThemeMode, onNavigate }) {
  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: t.bg, color: t.ink, minHeight: "100vh" }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 3px; }
      `}</style>

      <NavBar page="home" onNavigate={onNavigate} t={t} themeMode={themeMode}
        right={<ThemeToggle mode={themeMode} setMode={setThemeMode} t={t} />} />

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "72px 24px 56px", maxWidth: 760, margin: "0 auto" }}>
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
        {[{ n: "7", l: "Problems Visualized" }, { n: "4", l: "Languages" }, { n: "Blind 75", l: "Coverage" }, { n: "∞", l: "Practice Runs" }].map((s, i, a) => (
          <div key={i} style={{ padding: "22px 40px", textAlign: "center", borderRight: i < a.length - 1 ? `1.5px solid ${t.border}` : "none" }}>
            <div style={{ fontFamily: "'Caveat',cursive", fontSize: "2rem", fontWeight: 700, color: t.blue }}>{s.n}</div>
            <div style={{ fontSize: "0.82rem", color: t.inkMuted, marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px" }}>
        <h2 style={{ fontFamily: "'Caveat',cursive", fontSize: "2rem", fontWeight: 700, color: t.ink, textAlign: "center", marginBottom: 40 }}>How It Works</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
          {[
            { n: "01", icon: "📋", title: "Pick a Problem",  desc: "Browse 7 Blind 75 problems across Arrays, Sliding Window, Binary Search, and DP." },
            { n: "02", icon: "▶",  title: "Hit Play",        desc: "Watch the algorithm run step-by-step with smooth animations." },
            { n: "03", icon: "💡", title: "Understand Why",  desc: "Plain-English explanations for every decision the algorithm makes." },
            { n: "04", icon: "🔁", title: "Practice",        desc: "Edit the input, switch languages, adjust speed — replay until it clicks." },
          ].map((item, i) => (
            <div key={i} style={{ padding: 20, border: `1.5px solid ${t.border}`, borderRadius: 12, background: t.surface, boxShadow: t.shadowSm }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.68rem", fontWeight: 700, color: t.blue, background: t.blue + "22", padding: "2px 8px", borderRadius: 5 }}>{item.n}</span>
                <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
              </div>
              <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1.1rem", fontWeight: 700, color: t.ink, marginBottom: 6 }}>{item.title}</div>
              <div style={{ fontSize: "0.83rem", color: t.inkMuted, lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

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
