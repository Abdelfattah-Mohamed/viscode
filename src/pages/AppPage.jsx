import { useState, useMemo } from "react";
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
  DuplicateViz, AnagramViz, StockViz, BinarySearchViz, ClimbingViz,
} from "../components/visualizers";
import { PROBLEMS, LANG_META, DIFF_COLOR } from "../data/problems";
import { STEP_GENERATORS } from "../data/stepGenerators";
import { useStepPlayer } from "../hooks/useStepPlayer";

export default function AppPage({
  selectedProblem, setSelectedProblem,
  t, themeMode, setThemeMode,
  onNavigate, onLogout, username,
}) {
  const [lang, setLang]              = useState("javascript");
  const [solutionTab, setSolTab]     = useState("Solution");
  const [input, setInput]            = useState(() => PROBLEMS[selectedProblem].defaultInput);
  const [userMenuOpen, setMenuOpen] = useState(false);
  const [whiteboardFontScale, setWhiteboardFontScale] = useState(1);

  const problem = PROBLEMS[selectedProblem];

  // Reset input when problem changes
  useMemo(() => { setInput(PROBLEMS[selectedProblem].defaultInput); }, [selectedProblem]);

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

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: t.bg, minHeight: "100vh", color: t.ink, display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes popIn { from { transform: scale(0.4); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 3px; }
      `}</style>

      <NavBar page="app" onNavigate={onNavigate} t={t} themeMode={themeMode}
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ThemeToggle mode={themeMode} setMode={setThemeMode} t={t} />
            <div style={{ width: 1, height: 28, background: t.border, opacity: 0.3 }} />
            {/* User menu */}
            <div style={{ position: "relative" }}>
              <button onClick={() => setMenuOpen(o => !o)}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px", border: `2px solid ${t.border}`, borderRadius: 8, background: "transparent", color: t.ink, cursor: "pointer", fontFamily: "'Caveat',cursive", fontSize: "0.95rem", fontWeight: 700, boxShadow: t.shadowSm }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: t.blue, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.8rem" }}>
                  {username?.[0]?.toUpperCase() || "G"}
                </div>
                {username} ▾
              </button>
              {userMenuOpen && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", background: t.surface, border: `1.5px solid ${t.border}`, borderRadius: 10, boxShadow: t.shadow, zIndex: 300, minWidth: 160, overflow: "hidden" }}>
                  <div style={{ padding: "10px 16px", fontFamily: "'Caveat',cursive", fontSize: "0.9rem", color: t.inkMuted, borderBottom: `1.5px solid ${t.border}` }}>{username}</div>
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
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1.2fr", gridTemplateRows: "1fr auto", gap: 16, padding: 16, overflow: "auto" }}>

        {/* LEFT — Problem statement + Code */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 0 }}>

          {/* Problem statement */}
          <Card t={t} style={{ flexShrink: 0 }}>
            <CardHeader icon="📋" title={problem.title} t={t}
              extra={
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
          <Card
            t={t}
            style={{
              flexShrink: 0,
              height: "clamp(340px, 45vh, 560px)",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              overflow: "hidden",
            }}
          >
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
        </div>

        {/* RIGHT — Visualizer */}
        <Card t={t} style={{ display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
          <CardHeader
            icon="🎨"
            title="Whiteboard"
            t={t}
            extra={
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <button
                    onClick={() => setWhiteboardFontScale(s => Math.max(0.8, s - 0.1))}
                    style={{
                      padding: "2px 6px",
                      borderRadius: 6,
                      border: `1.5px solid ${t.border}`,
                      background: t.surfaceAlt,
                      color: t.ink,
                      cursor: "pointer",
                      fontFamily: "'Caveat',cursive",
                      fontSize: "0.8rem",
                    }}
                  >
                    A-
                  </button>
                  <button
                    onClick={() => setWhiteboardFontScale(s => Math.min(1.4, s + 0.1))}
                    style={{
                      padding: "2px 6px",
                      borderRadius: 6,
                      border: `1.5px solid ${t.border}`,
                      background: t.surfaceAlt,
                      color: t.ink,
                      cursor: "pointer",
                      fontFamily: "'Caveat',cursive",
                      fontSize: "0.8rem",
                    }}
                  >
                    A+
                  </button>
                </div>
                <InputEditor
                  input={input}
                  fields={problem.inputFields}
                  onChange={setInput}
                  onReset={player.reset}
                  t={t}
                />
              </div>
            }
          />
          <div style={{ padding: "10px 14px", flexShrink: 0 }}>
            <div style={{ fontFamily: "'Caveat',cursive", fontSize: `${1.1 * whiteboardFontScale}rem`, fontWeight: 600, padding: "9px 14px", background: stepDescColor + (themeMode === "dark" ? "33" : "cc"), border: `2px solid ${t.border}`, borderRadius: 8, minHeight: 42, display: "flex", alignItems: "center", gap: 8, color: t.ink, transition: "background 0.3s" }}>
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
          </div>
          <StepControls {...player} t={t} />
        </Card>

        {/* BOTTOM — Similar problems (spans both columns) */}
        <div style={{ gridColumn: "1 / -1" }}>
          <SimilarProblems currentId={selectedProblem} onSelect={handleSelectSimilar} t={t} />
        </div>
      </div>
    </div>
  );
}
