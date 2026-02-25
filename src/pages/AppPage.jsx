import { useState, useMemo, useEffect, useCallback } from "react";
import NavBar from "../components/ui/NavBar";
import ThemeToggle from "../components/ui/ThemeToggle";
import { Card, CardHeader } from "../components/ui/Card";
import StepControls from "../components/ui/StepControls";
import InputEditor from "../components/ui/InputEditor";
import CodePanel from "../components/CodePanel";
import ExplanationPanel from "../components/ExplanationPanel";
import SimilarProblems from "../components/SimilarProblems";
import {
  ArrayVisualizer, ConsecutiveVisualizer,
  DuplicateViz, AnagramViz, StockViz, BinarySearchViz, ClimbingViz, SubtreeViz,
  PalindromeViz, ParenthesesViz, ProductViz, MaxProductViz, RobberViz,
  MissingViz, TreeDepthViz, InvertTreeViz, SameTreeViz, LinkedListViz,
  ThreeSumViz, ContainerViz, MergeListsViz, IntervalsViz, CycleViz, GridViz,
} from "../components/visualizers";
import { PROBLEMS, LANG_META, DIFF_COLOR } from "../data/problems";
import { STEP_GENERATORS } from "../data/stepGenerators";
import { useStepPlayer } from "../hooks/useStepPlayer";
import { useProblemNotes } from "../hooks/useProblemNotes";

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

const SHORTCUTS = [
  { keys: "Space",         desc: "Play / Pause" },
  { keys: "→  or  D",     desc: "Next step" },
  { keys: "←  or  A",     desc: "Previous step" },
  { keys: "Home",          desc: "Jump to start" },
  { keys: "End",           desc: "Jump to end" },
  { keys: "L",             desc: "Cycle language" },
  { keys: "E",             desc: "Toggle Explanation / Solution" },
  { keys: "?",             desc: "Show this help" },
];

const LANG_ORDER = Object.keys(LANG_META);

export default function AppPage({
  selectedProblem, setSelectedProblem,
  t, themeMode, setThemeMode,
  onNavigate, onLogout, user, username, fav, mobile,
  sharedInput,
}) {
  const [lang, setLang]              = useState("cpp");
  const [solutionTab, setSolTab]     = useState("Solution");
  const [input, setInput]            = useState(() => sharedInput || PROBLEMS[selectedProblem].defaultInput);
  const [userMenuOpen, setMenuOpen]  = useState(false);
  const [whiteboardFontScale, setWhiteboardFontScale] = useState(1);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [shareMsg, setShareMsg]      = useState("");
  const [whiteboardMaximized, setWhiteboardMaximized] = useState(false);

  const problem = PROBLEMS[selectedProblem];
  const notesData = useProblemNotes(user, selectedProblem);

  useMemo(() => {
    if (!sharedInput) setInput(PROBLEMS[selectedProblem].defaultInput);
  }, [selectedProblem]);

  useEffect(() => {
    if (sharedInput) setInput(sharedInput);
  }, [sharedInput]);

  const steps = useMemo(() => {
    const gen  = STEP_GENERATORS[selectedProblem];
    const prob = PROBLEMS[selectedProblem];
    if (!gen || !prob) return [];
    const safeInput = prob.inputFields.every(f => input[f] !== undefined && input[f] !== null)
      ? input : prob.defaultInput;
    try { return gen(safeInput); } catch (_) { return []; }
  }, [selectedProblem, input]);

  const player = useStepPlayer(steps, 900);
  const { currentStep } = player;

  const langDef    = problem.languages[lang];
  const activeLine = currentStep ? (langDef.lineMap[currentStep.stepType] ?? -1) : -1;
  const isFinished = currentStep?.stepType === "found" || currentStep?.stepType === "done";
  const stepDescColor = isFinished ? t.green : t.yellow;

  const handleSelectSimilar = id => {
    setSelectedProblem(id);
    setInput(PROBLEMS[id].defaultInput);
    setSolTab("Solution");
  };

  const handleShare = useCallback(() => {
    const params = new URLSearchParams();
    params.set("p", selectedProblem);
    params.set("input", encodeURIComponent(JSON.stringify(input)));
    const url = `${window.location.origin}${window.location.pathname}?${params}`;
    navigator.clipboard.writeText(url).then(() => {
      setShareMsg("Link copied!");
      setTimeout(() => setShareMsg(""), 2000);
    }).catch(() => {
      setShareMsg("Copy failed");
      setTimeout(() => setShareMsg(""), 2000);
    });
  }, [selectedProblem, input]);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const handler = (e) => {
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || e.target.isContentEditable) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          player.isPlaying ? player.pause() : player.play();
          break;
        case "ArrowRight":
        case "KeyD":
          e.preventDefault();
          player.next();
          break;
        case "ArrowLeft":
        case "KeyA":
          e.preventDefault();
          player.prev();
          break;
        case "Home":
          e.preventDefault();
          player.jumpToStart();
          break;
        case "End":
          e.preventDefault();
          player.jumpToEnd();
          break;
        case "KeyL":
          setLang(prev => {
            const idx = LANG_ORDER.indexOf(prev);
            return LANG_ORDER[(idx + 1) % LANG_ORDER.length];
          });
          break;
        case "KeyE":
          setSolTab(prev => prev === "Solution" ? "Explanation" : "Solution");
          break;
        case "Slash":
          if (e.shiftKey) { e.preventDefault(); setShowShortcuts(s => !s); }
          break;
        case "Escape":
          setWhiteboardMaximized(false);
          break;
        default: break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [player]);

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: t.bg, minHeight: "100vh", color: t.ink, display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes popIn { from { transform: scale(0.4); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 3px; }
      `}</style>

      {/* Maximized whiteboard overlay */}
      {whiteboardMaximized && (
        <div
          onClick={() => setWhiteboardMaximized(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.7)", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", padding: 24,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: t.surface, border: `2px solid ${t.border}`, borderRadius: 16, boxShadow: t.shadow,
              width: "100%", maxWidth: 1200, height: "90vh", maxHeight: 900,
              display: "flex", flexDirection: "column", overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1.5px solid ${t.border}`, background: t.surfaceAlt, flexShrink: 0 }}>
              <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1.2rem", fontWeight: 700, color: t.ink }}>🎨 Whiteboard</span>
              <button onClick={() => setWhiteboardMaximized(false)} title="Exit full screen (Esc)"
                style={{ width: 36, height: 36, borderRadius: 8, border: `2px solid ${t.border}`, background: t.surface, color: t.ink, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div style={{ padding: "12px 16px", flexShrink: 0 }}>
              <div style={{ fontFamily: "'Caveat',cursive", fontSize: `${1.1 * whiteboardFontScale}rem`, fontWeight: 600, padding: "10px 16px", background: stepDescColor + (t._resolved === "dark" ? "33" : "cc"), border: `2px solid ${t.border}`, borderRadius: 8, minHeight: 44, display: "flex", alignItems: "center", gap: 8, color: t.ink }}>
                <span>💡</span>
                <span>{currentStep?.description || "Press ▶ to start the visualization"}</span>
              </div>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: "8px 20px 20px", fontSize: `${whiteboardFontScale}rem` }}>
              {problem.visualizer === "array"       && <ArrayVisualizer       nums={input.nums || []}   stepState={{ ...currentStep?.state, target: input.target }} t={t} />}
              {problem.visualizer === "consecutive" && <ConsecutiveVisualizer nums={input.nums || []}   stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "duplicate"   && <DuplicateViz          nums={input.nums || []}   stepState={currentStep?.state} t={t} />}
              {problem.visualizer === "anagram"     && <AnagramViz            s={input.s || ""}         tStr={input.t || ""} stepState={currentStep?.state} t={t} />}
              {problem.visualizer === "stock"       && <StockViz              prices={input.prices || []} stepState={currentStep?.state} t={t} />}
              {problem.visualizer === "binsearch"   && <BinarySearchViz       nums={input.nums || []}   stepState={currentStep?.state} t={t} />}
              {problem.visualizer === "climbing"    && <ClimbingViz           n={input.n}               stepState={currentStep?.state} t={t} />}
              {problem.visualizer === "subtree"     && <SubtreeViz            root={input.root || []}   subRoot={input.subRoot || []} stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "palindrome"  && <PalindromeViz    s={input.s || ""}         stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "parentheses" && <ParenthesesViz   s={input.s || ""}         stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "product"     && <ProductViz       nums={input.nums || []}   stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "maxproduct"  && <MaxProductViz    nums={input.nums || []}   stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "robber"      && <RobberViz        nums={input.nums || []}   stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "missing"     && <MissingViz       nums={input.nums || []}   stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "treedepth"   && <TreeDepthViz     root={input.root || []}   stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "invertree"   && <InvertTreeViz    root={input.root || []}   stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "sametree"    && <SameTreeViz      p={input.p || []}         q={input.q || []} stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "linkedlist"  && <LinkedListViz    head={input.head || []}   stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "threesum"    && <ThreeSumViz      nums={input.nums || []}   stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "container"  && <ContainerViz     heights={input.heights || []} stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "mergelists" && <MergeListsViz    list1={input.list1 || []} list2={input.list2 || []} stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "intervals"  && <IntervalsViz     stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "cycle"      && <CycleViz         head={input.head || []}   stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "grid"       && <GridViz         stepState={currentStep?.state ?? {}} input={input} problemId={selectedProblem} t={t} />}
            </div>
            <div style={{ flexShrink: 0, borderTop: `1.5px solid ${t.border}` }}>
              <StepControls {...player} t={t} mobile={mobile} />
            </div>
          </div>
        </div>
      )}

      {/* Keyboard shortcuts overlay */}
      {showShortcuts && (
        <div onClick={() => setShowShortcuts(false)} style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: t.surface, border: `1.5px solid ${t.border}`, borderRadius: 14, boxShadow: t.shadow, padding: "24px 28px", maxWidth: 380, width: "90%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1.3rem", fontWeight: 700, color: t.ink }}>Keyboard Shortcuts</span>
              <button onClick={() => setShowShortcuts(false)} style={{ background: "none", border: "none", color: t.inkMuted, cursor: "pointer", fontSize: "1.2rem", padding: 4 }}>✕</button>
            </div>
            {SHORTCUTS.map((s, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: i < SHORTCUTS.length - 1 ? `1px solid ${t.border}30` : "none" }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.78rem", fontWeight: 600, color: t.ink, padding: "2px 8px", background: t.surfaceAlt, borderRadius: 5, border: `1px solid ${t.border}` }}>{s.keys}</span>
                <span style={{ fontSize: "0.85rem", color: t.inkMuted }}>{s.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <NavBar page="app" onNavigate={onNavigate} t={t} themeMode={themeMode} mobile={mobile}
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
                    style={{ width: "100%", padding: "10px 16px", textAlign: "left", border: "none", background: "transparent", color: t.ink, cursor: "pointer", fontFamily: "'Caveat',cursive", fontSize: "0.95rem", fontWeight: 700 }}>
                    Profile
                  </button>
                  <button onClick={() => { setMenuOpen(false); onLogout(); }}
                    style={{ width: "100%", padding: "10px 16px", textAlign: "left", border: "none", background: "transparent", color: t.red, cursor: "pointer", fontFamily: "'Caveat',cursive", fontSize: "0.95rem", fontWeight: 700 }}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        }
      />

      {/* Main grid */}
      <div style={{
        flex: 1, display: mobile ? "flex" : "grid",
        ...(mobile
          ? { flexDirection: "column", gap: 12, padding: 10, overflow: "auto" }
          : { gridTemplateColumns: "1fr minmax(380px, 1.2fr)", gridTemplateRows: "1fr auto", gap: 16, padding: 16, overflow: "hidden", minWidth: 0 }
        ),
      }}>

        {/* LEFT — Problem statement + Code */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 0, minWidth: 0, overflow: mobile ? "visible" : "auto" }}>

          {/* Problem statement */}
          <Card t={t} style={{ flexShrink: 0 }}>
            <CardHeader icon="📋" title={problem.title} t={t}
              extra={
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button
                    onClick={() => fav?.toggleFavorite(selectedProblem)}
                    title={fav?.isFavorite(selectedProblem) ? "Remove from favorites" : "Add to favorites"}
                    style={{ background: "none", border: "none", padding: 4, cursor: "pointer", color: t.inkMuted, display: "flex", borderRadius: 6 }}
                  >
                    <StarIcon filled={fav?.isFavorite(selectedProblem)} size={18} />
                  </button>
                  <button
                    onClick={() => fav?.toggleFlagged(selectedProblem)}
                    title={fav?.isFlagged(selectedProblem) ? "Remove flag" : "Flag this problem"}
                    style={{ background: "none", border: "none", padding: 4, cursor: "pointer", color: t.inkMuted, display: "flex", borderRadius: 6 }}
                  >
                    <FlagIcon filled={fav?.isFlagged(selectedProblem)} size={18} />
                  </button>
                  <button onClick={handleShare} title="Copy share link"
                    style={{ background: "none", border: "none", padding: 4, cursor: "pointer", color: shareMsg ? t.green : t.inkMuted, display: "flex", borderRadius: 6, position: "relative" }}>
                    {shareMsg ? (
                      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    ) : (
                      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                      </svg>
                    )}
                  </button>
                  <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.8rem", padding: "1px 9px", border: `1.5px solid ${t.border}`, borderRadius: 10, ...DIFF_COLOR[problem.difficulty], fontWeight: 700 }}>{problem.difficulty}</span>
                  <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.8rem", color: t.inkMuted }}>{problem.category}</span>
                </div>
              }
            />
            <div style={{ padding: "12px 14px", fontSize: "0.85rem", lineHeight: 1.65, color: t.ink }}>
              <p dangerouslySetInnerHTML={{ __html: problem.description.replace(/<code>/g, `<code style="font-family:'JetBrains Mono',monospace;background:${t.surfaceAlt};padding:1px 5px;border-radius:4px;font-size:0.78rem;">`) }} />
              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.85rem", padding: "3px 12px", border: `2px solid ${t.border}`, borderRadius: 20, fontWeight: 600, background: t.blue + "22", color: t.ink }}>⏱ {problem.timeComplexity}</span>
                <span style={{ fontFamily: "'Caveat',cursive", fontSize: "0.85rem", padding: "3px 12px", border: `2px solid ${t.border}`, borderRadius: 20, fontWeight: 600, background: t.purple + "22", color: t.ink }}>💾 {problem.spaceComplexity}</span>
              </div>
              <div style={{ marginTop: 10, padding: "8px 10px", background: t.surfaceAlt, borderRadius: 8, border: `1.5px solid ${t.border}30`, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.76rem", color: t.inkMuted }}>
                <div><span style={{ color: t.blue }}>Input:</span>  {problem.example.input}</div>
                <div><span style={{ color: t.green }}>Output:</span> {problem.example.output}</div>
                <div style={{ marginTop: 2, fontStyle: "italic" }}>{problem.example.note}</div>
              </div>
            </div>
          </Card>

          {/* Code panel */}
          <Card t={t} style={{ flexShrink: 0, height: mobile ? 320 : "clamp(340px, 45vh, 560px)", display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", borderBottom: `1.5px solid ${t.border}`, background: t.surfaceAlt, flexShrink: 0, paddingLeft: 4, paddingRight: 10 }}>
              {["Solution", "Explanation"].map(tab => (
                <button key={tab} onClick={() => setSolTab(tab)}
                  style={{ fontFamily: "'Caveat',cursive", fontSize: "1rem", fontWeight: 700, padding: "9px 16px", border: "none", cursor: "pointer", background: "transparent", color: solutionTab === tab ? t.ink : t.inkMuted, borderBottom: solutionTab === tab ? `3px solid ${t.yellow}` : "3px solid transparent", transition: "all 0.15s", marginBottom: -1 }}>
                  {tab === "Solution" ? "💻 Solution" : "📖 Explanation"}
                </button>
              ))}
              {solutionTab === "Solution" && (
                <div style={{ position: "relative", marginLeft: "auto" }}>
                  <select value={lang} onChange={e => setLang(e.target.value)}
                    style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.75rem", fontWeight: 600, padding: "4px 28px 4px 10px", border: `2px solid ${t.border}`, borderRadius: 7, background: LANG_META[lang].iconBg, color: LANG_META[lang].iconColor, cursor: "pointer", appearance: "none", WebkitAppearance: "none", outline: "none", minWidth: 108 }}>
                    {Object.entries(LANG_META).map(([id, def]) => (
                      <option key={id} value={id} style={{ background: t.surface, color: t.ink }}>{def.label}</option>
                    ))}
                  </select>
                  <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: "0.6rem", color: LANG_META[lang].iconColor, opacity: 0.8 }}>▼</span>
                </div>
              )}
            </div>
            <div style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {solutionTab === "Solution"
                ? <CodePanel lines={langDef.code} activeLine={activeLine} />
                : <ExplanationPanel explanation={problem.explanation} t={t} />}
            </div>
          </Card>

          {/* Personal notes (only for logged-in, non-guest users) */}
          {notesData && (
            <Card t={t} style={{ flexShrink: 0 }}>
              <CardHeader icon="📝" title="Personal notes" t={t} />
              <div style={{ padding: "0 14px 14px", marginTop: 10 }}>
                <textarea
                  value={notesData.notes}
                  onChange={notesData.handleChange}
                  onBlur={notesData.handleBlur}
                  placeholder="Edge cases, hints, observations…"
                  disabled={notesData.loading}
                  rows={3}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px 12px",
                    border: `1.5px solid ${t.border}`,
                    borderRadius: 8,
                    background: t.surfaceAlt,
                    color: t.ink,
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: "0.85rem",
                    lineHeight: 1.5,
                    resize: "vertical",
                    minHeight: 72,
                    outline: "none",
                  }}
                />
              </div>
            </Card>
          )}
        </div>

        {/* RIGHT — Visualizer */}
        <Card t={t} style={{ display: "flex", flexDirection: "column", overflow: "hidden", minHeight: mobile ? 420 : 0 }}>
          <CardHeader icon="🎨" title="Whiteboard" t={t}
            extra={
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button onClick={() => setWhiteboardMaximized(true)} title="Maximize whiteboard"
                  style={{ width: 26, height: 26, borderRadius: 7, border: `1.5px solid ${t.border}`, background: t.surfaceAlt, color: t.inkMuted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>
                </button>
                <button onClick={() => setShowShortcuts(true)} title="Keyboard shortcuts (?)"
                  style={{ width: 26, height: 26, borderRadius: 7, border: `1.5px solid ${t.border}`, background: t.surfaceAlt, color: t.inkMuted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.78rem", fontWeight: 700, padding: 0 }}>
                  ?
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <button onClick={() => setWhiteboardFontScale(s => Math.max(0.8, s - 0.1))}
                    style={{ padding: "2px 6px", borderRadius: 6, border: `1.5px solid ${t.border}`, background: t.surfaceAlt, color: t.ink, cursor: "pointer", fontFamily: "'Caveat',cursive", fontSize: "0.8rem" }}>
                    A-
                  </button>
                  <button onClick={() => setWhiteboardFontScale(s => Math.min(1.4, s + 0.1))}
                    style={{ padding: "2px 6px", borderRadius: 6, border: `1.5px solid ${t.border}`, background: t.surfaceAlt, color: t.ink, cursor: "pointer", fontFamily: "'Caveat',cursive", fontSize: "0.8rem" }}>
                    A+
                  </button>
                </div>
                <InputEditor input={input} fields={problem.inputFields} onChange={setInput} onReset={player.reset} t={t} />
              </div>
            }
          />
          <div style={{ padding: "10px 14px", flexShrink: 0 }}>
            <div style={{ fontFamily: "'Caveat',cursive", fontSize: `${1.1 * whiteboardFontScale}rem`, fontWeight: 600, padding: "9px 14px", background: stepDescColor + (t._resolved === "dark" ? "33" : "cc"), border: `2px solid ${t.border}`, borderRadius: 8, minHeight: 42, display: "flex", alignItems: "center", gap: 8, color: t.ink, transition: "background 0.3s" }}>
              <span>💡</span>
              <span>{currentStep?.description || "Press ▶ to start the visualization"}</span>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "4px 18px 18px", fontSize: `${whiteboardFontScale}rem` }}>
            {problem.visualizer === "array"       && <ArrayVisualizer       nums={input.nums || []}   stepState={{ ...currentStep?.state, target: input.target }} t={t} />}
            {problem.visualizer === "consecutive" && <ConsecutiveVisualizer nums={input.nums || []}   stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "duplicate"   && <DuplicateViz          nums={input.nums || []}   stepState={currentStep?.state} t={t} />}
            {problem.visualizer === "anagram"     && <AnagramViz            s={input.s || ""}         tStr={input.t || ""} stepState={currentStep?.state} t={t} />}
            {problem.visualizer === "stock"       && <StockViz              prices={input.prices || []} stepState={currentStep?.state} t={t} />}
            {problem.visualizer === "binsearch"   && <BinarySearchViz       nums={input.nums || []}   stepState={currentStep?.state} t={t} />}
            {problem.visualizer === "climbing"    && <ClimbingViz           n={input.n}               stepState={currentStep?.state} t={t} />}
            {problem.visualizer === "subtree"     && <SubtreeViz            root={input.root || []}   subRoot={input.subRoot || []} stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "palindrome"  && <PalindromeViz    s={input.s || ""}         stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "parentheses" && <ParenthesesViz   s={input.s || ""}         stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "product"     && <ProductViz       nums={input.nums || []}   stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "maxproduct"  && <MaxProductViz    nums={input.nums || []}   stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "robber"      && <RobberViz        nums={input.nums || []}   stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "missing"     && <MissingViz       nums={input.nums || []}   stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "treedepth"   && <TreeDepthViz     root={input.root || []}   stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "invertree"   && <InvertTreeViz    root={input.root || []}   stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "sametree"    && <SameTreeViz      p={input.p || []}         q={input.q || []} stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "linkedlist"  && <LinkedListViz    head={input.head || []}   stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "threesum"    && <ThreeSumViz      nums={input.nums || []}   stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "container"  && <ContainerViz     heights={input.heights || []} stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "mergelists" && <MergeListsViz    list1={input.list1 || []} list2={input.list2 || []} stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "intervals"  && <IntervalsViz     stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "cycle"      && <CycleViz         head={input.head || []}   stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "grid"       && <GridViz         stepState={currentStep?.state ?? {}} input={input} problemId={selectedProblem} t={t} />}
          </div>
          <StepControls {...player} t={t} mobile={mobile} />
        </Card>

        {/* BOTTOM — Similar problems */}
        <div style={{ gridColumn: "1 / -1" }}>
          <SimilarProblems currentId={selectedProblem} onSelect={handleSelectSimilar} t={t} />
        </div>
      </div>
    </div>
  );
}
