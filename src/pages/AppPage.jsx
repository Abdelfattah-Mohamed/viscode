import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import NavBar from "../components/ui/NavBar";
import { Card, CardHeader } from "../components/ui/Card";
import AccountMenuChip from "../components/ui/AccountMenuChip";
import { UI_MOTION } from "../components/ui/motion";
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
  ThreeSumViz, ContainerViz, MergeListsViz, MergeKViz, IntervalsViz, CycleViz, GridViz, GraphViz, RpnViz,   DecodeWaysViz, GenerateParenthesesViz, TopKFrequentViz,   MinStackViz, MedianFinderViz, SumTwoIntegersViz,   NumberOf1BitsViz, ReverseBitsViz,   WordBreakViz, LongestCommonSubsequenceViz,   LongestIncreasingSubsequenceViz,   CombinationSumViz,   HouseRobberIIViz, UniquePathsViz, JumpGameViz, SlidingWindowViz, SubsetsViz, PermutationsViz, LongestPalindromeViz, GroupAnagramsViz,   TrappingRainWaterViz, PalindromicSubstringsViz, CharReplacementViz, EncodeDecodeViz, LCAOfBSTViz,
} from "../components/visualizers";
import { PROBLEMS, LANG_META, DIFF_COLOR } from "../data/problems";
import { STEP_GENERATORS } from "../data/stepGenerators";
import { useStepPlayer } from "../hooks/useStepPlayer";
import { useProblemNotes } from "../hooks/useProblemNotes";
import { submitFeedback, trackEvent } from "../utils/analytics";

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
  sharedInput, isPro,
}) {
  const [lang, setLang]              = useState("cpp");
  const [solutionTab, setSolTab]     = useState("Solution");
  const [input, setInput]            = useState(() => (isPro && sharedInput) || PROBLEMS[selectedProblem].defaultInput);
  const [whiteboardFontScale, setWhiteboardFontScale] = useState(1);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [shareMsg, setShareMsg]      = useState("");
  const [whiteboardMaximized, setWhiteboardMaximized] = useState(false);
  const [showWorkspaceTip, setShowWorkspaceTip] = useState(false);
  const [notesOpen, setNotesOpen] = useState(true);
  const [feedbackChoice, setFeedbackChoice] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportText, setReportText] = useState("");
  const [reportStatus, setReportStatus] = useState("");
  const [leftPanelPercent, setLeftPanelPercent] = useState(() => {
    try {
      const saved = localStorage.getItem("viscode-left-panel-percent");
      if (saved != null) {
        const n = Number(saved);
        if (n >= 25 && n <= 75) return n;
      }
    } catch (_) {}
    return 45;
  });
  const [isDraggingGutter, setIsDraggingGutter] = useState(false);
  const leftPanelPercentRef = useRef(leftPanelPercent);
  leftPanelPercentRef.current = leftPanelPercent;

  const mainScrollRef = useRef(null);

  const handleGutterMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    setIsDraggingGutter(true);
  }, []);

  useEffect(() => {
    if (!isDraggingGutter) return;
    const onMove = (e) => {
      const percent = Math.min(75, Math.max(25, (e.clientX / window.innerWidth) * 100));
      setLeftPanelPercent(percent);
    };
    const onUp = () => {
      setIsDraggingGutter(false);
      try {
        localStorage.setItem("viscode-left-panel-percent", String(leftPanelPercentRef.current));
      } catch (_) {}
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDraggingGutter]);

  const problem = PROBLEMS[selectedProblem];
  const canEditInputs = !!isPro;
  const canUseNotes = !!isPro;
  const notesData = useProblemNotes(canUseNotes ? user : null, selectedProblem);
  useEffect(() => {
    try {
      if (!localStorage.getItem("viscode-workspace-tip-dismissed")) {
        setShowWorkspaceTip(true);
      }
    } catch (_) {}
  }, []);

  const dismissWorkspaceTip = useCallback(() => {
    setShowWorkspaceTip(false);
    try {
      localStorage.setItem("viscode-workspace-tip-dismissed", "1");
    } catch (_) {}
  }, []);

  const iconButtonStyle = {
    width: 26,
    height: 26,
    borderRadius: 7,
    border: `1.5px solid ${t.border}`,
    background: t.surfaceAlt,
    color: t.inkMuted,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  };
  const metaPillStyle = {
    fontFamily: "'Caveat',cursive",
    fontSize: "0.8rem",
    padding: "2px 10px",
    border: `1.5px solid ${t.border}`,
    borderRadius: 10,
    fontWeight: 700,
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    mainScrollRef.current?.scrollTo?.(0, 0);
  }, [selectedProblem]);

  useEffect(() => {
    if (!sharedInput || !canEditInputs) setInput(PROBLEMS[selectedProblem].defaultInput);
  }, [selectedProblem, sharedInput, canEditInputs]);

  useEffect(() => {
    setFeedbackChoice(null);
    setReportOpen(false);
    setReportText("");
    setReportStatus("");
  }, [selectedProblem]);

  useEffect(() => {
    if (sharedInput && canEditInputs) setInput(sharedInput);
  }, [sharedInput, canEditInputs]);

  const steps = useMemo(() => {
    const gen  = STEP_GENERATORS[selectedProblem];
    const prob = PROBLEMS[selectedProblem];
    if (!gen || !prob) return [{ stepType: "init", description: "Select a problem", state: {} }];
    const safeInput = prob.inputFields.every(f => input[f] !== undefined && input[f] !== null)
      ? input : (prob.defaultInput || {});
    try {
      const result = gen(safeInput);
      const arr = Array.isArray(result) ? result : [];
      if (arr.length === 0) return [{ stepType: "init", description: "Start", state: {} }, { stepType: "done", description: "Done", state: { done: true } }];
      return arr;
    } catch (_) {
      return [{ stepType: "init", description: "Start", state: {} }, { stepType: "done", description: "Done", state: { done: true } }];
    }
  }, [selectedProblem, input]);

  const player = useStepPlayer(steps, 900);
  const { currentStep, stepIndex, totalSteps } = player;

  const langDef = problem.languages[lang];
  const codeLines = langDef?.code?.length ?? 0;
  const activeLine = (() => {
    if (!currentStep || !langDef?.lineMap || codeLines === 0) return -1;
    const stepType = currentStep.stepType;
    const aliases = {
      update: ["relax", "visit"],
      pop: ["goal_check", "visit", "loop"],
      stack_built: ["dfs1_push", "init"],
      new_scc: ["dfs2_visit", "visit", "init"],
      dfs_recurse: ["recurse", "visit"],
      build_leaf: ["build"],
      build_merge: ["build", "query_combine"],
    };
    const candidates = [
      stepType,
      ...(aliases[stepType] || []),
      "compare",
      "visit",
      "relax",
      "add_edge",
      "pop",
      "push",
      "update",
      "query",
      "find",
      "union",
      "add",
      "recurse",
      "build",
      "build_leaf",
      "build_merge",
      "query_combine",
      "loop_i",
      "loop_w",
      "loop_k",
      "loop_ij",
      "build_edges",
      "init_queue",
      "update_leftMax",
      "add_water_left",
      "update_rightMax",
      "add_water_right",
      "transpose",
      "reverse",
      "scan",
      "mark_zero",
      "sweep",
      "zero_col0",
      "zero_row0",
      "try_start",
      "base",
      "dfs_base",
      "dfs_fail",
      "dfs_mark",
      "dfs_recurse",
      "dfs_backtrack",
      "found",
      "go_right",
      "go_down",
      "go_left",
      "go_up",
      "try_odd",
      "try_even",
      "add_right",
      "shrink",
      "update_best",
      "read_len",
      "push_result",
      "add_push",
      "add_balance",
      "add_rebalance",
      "median",
      "ser_base",
      "ser_recurse",
      "ser_done",
      "des_base",
      "des_build",
      "des_recurse",
      "done",
      "init",
      "loop",
    ];
    const raw = candidates.map((key) => langDef.lineMap[key]).find((line) => Number.isFinite(line)) ?? 1;
    if (raw < 1) return -1;
    return Math.min(raw, codeLines);
  })();
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

  const handleHelpfulFeedback = async (helpful) => {
    setFeedbackChoice(helpful ? "yes" : "no");
    trackEvent("visualization_feedback_vote", {
      problemId: selectedProblem,
      helpful,
      stepType: currentStep?.stepType || "none",
      stepIndex,
      totalSteps,
    });
    await submitFeedback({
      kind: "helpfulness",
      problemId: selectedProblem,
      helpful,
      stepType: currentStep?.stepType || "none",
      stepIndex,
      totalSteps,
    });
  };

  const handleIssueSubmit = async () => {
    const detail = reportText.trim();
    if (!detail) return;
    setReportStatus("sending");
    trackEvent("report_issue_submitted", { problemId: selectedProblem });
    const result = await submitFeedback({
      kind: "issue",
      problemId: selectedProblem,
      title: problem?.title || "",
      detail,
      input,
      stepType: currentStep?.stepType || "none",
      stepIndex,
      totalSteps,
    });
    setReportStatus(result.ok ? "sent" : "failed");
    if (result.ok) {
      setReportText("");
      setTimeout(() => {
        setReportOpen(false);
        setReportStatus("");
      }, 1200);
    }
  };

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
              {problem.visualizer === "array"       && <ArrayVisualizer       nums={selectedProblem === "counting-bits" ? (currentStep?.state?.nums ?? Array(Math.max(0, (input.n ?? 0) + 1)).fill(0)) : selectedProblem === "coin-change" ? (currentStep?.state?.dp ?? (() => { const a = Math.max(0, Number(input?.amount) ?? 11); const d = Array(a + 1).fill(a + 1); d[0] = 0; return d; })()) : selectedProblem === "knapsack-01" ? (currentStep?.state?.dp ?? Array((Number(input?.target) ?? 8) + 1).fill(0)) : (input.nums || [])}   stepState={{ ...currentStep?.state, target: input.target }} t={t} arrayLabel={selectedProblem === "counting-bits" ? "ans" : selectedProblem === "coin-change" || selectedProblem === "knapsack-01" ? "dp" : undefined} />}
              {problem.visualizer === "trapping"    && <TrappingRainWaterViz nums={input.nums?.length ? input.nums : (problem.defaultInput?.nums ?? [])} stepState={currentStep?.state ?? {}} t={t} />}
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
              {problem.visualizer === "lca"          && <LCAOfBSTViz     root={(input.root && input.root.length) ? input.root : (problem.defaultInput?.root || [])}   stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "invertree"   && <InvertTreeViz    root={input.root || []}   stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "sametree"    && <SameTreeViz      p={input.p || []}         q={input.q || []} stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "linkedlist"  && <LinkedListViz    head={currentStep?.state?.head ?? input.head ?? []}   stepState={currentStep?.state ?? {}} problemId={selectedProblem} input={input} t={t} />}
              {problem.visualizer === "threesum"    && <ThreeSumViz      nums={input.nums || []}   stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "container"  && <ContainerViz     heights={input.heights || []} stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "mergelists" && <MergeListsViz    list1={input.list1 || []} list2={input.list2 || []} stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "mergek"     && <MergeKViz       lists={[]} stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "intervals"  && <IntervalsViz     stepState={currentStep?.state ?? {}} problemId={selectedProblem} t={t} />}
              {problem.visualizer === "cycle"      && <CycleViz         head={input.head || []}   stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "grid"       && <GridViz         stepState={currentStep?.state ?? {}} input={input} problemId={selectedProblem} t={t} />}
              {problem.visualizer === "graph"       && <GraphViz        stepState={currentStep?.state ?? {}} problemId={selectedProblem} t={t} />}
              {problem.visualizer === "rpn"         && <RpnViz          stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "decodeways"    && <DecodeWaysViz         s={input.s ?? ""}  stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "genparentheses" && <GenerateParenthesesViz stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "topk"          && <TopKFrequentViz       nums={input.nums || []}   stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "minstack"      && <MinStackViz           stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "medianfinder"  && <MedianFinderViz       stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "sumtwo"       && <SumTwoIntegersViz     stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "onebits"     && <NumberOf1BitsViz     stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "reversebits" && <ReverseBitsViz       stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "wordbreak"  && <WordBreakViz         s={input.s ?? ""} stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "lcs"        && <LongestCommonSubsequenceViz stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "lis"        && <LongestIncreasingSubsequenceViz nums={input.nums ?? []} stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "combinationsum" && <CombinationSumViz stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "robberii" && <HouseRobberIIViz nums={input.nums ?? []} stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "uniquepaths" && <UniquePathsViz stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "jumpgame" && <JumpGameViz nums={input.nums ?? []} stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "palindromicsubstrings" && <PalindromicSubstringsViz s={input.s ?? ""} stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "charreplacement" && <CharReplacementViz s={input.s ?? ""} k={input.k ?? 0} stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "encodedecode" && <EncodeDecodeViz s={input.s ?? ""} stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "slidingwindow" && <SlidingWindowViz s={input.s ?? ""} stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "subsets" && <SubsetsViz nums={input.nums ?? []} stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "permutations" && <PermutationsViz nums={input.nums ?? []} stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "longestpalindrome" && <LongestPalindromeViz s={input.s ?? ""} stepState={currentStep?.state ?? {}} t={t} />}
              {problem.visualizer === "groupanagrams" && <GroupAnagramsViz strs={input.s ?? ""} stepState={currentStep?.state ?? {}} t={t} />}
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

      {/* Main layout: resizable split on desktop, stacked on mobile */}
      <div
        ref={mainScrollRef}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          ...(mobile ? { gap: 12, padding: 10, overflow: "auto" } : { gap: 16, padding: 16, overflow: "hidden" }),
        }}
      >
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: mobile ? "column" : "row",
          minHeight: 0,
          ...(mobile ? { gap: 12 } : { minWidth: 0 }),
        }}>
        {/* LEFT — Problem statement + Code */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            ...(mobile ? { gap: 10, minHeight: 0, minWidth: 0, overflow: "visible" } : { gap: 10, width: `${leftPanelPercent}%`, minWidth: 280, minHeight: 0, overflow: "hidden" }),
          }}
        >
          {/* Problem statement */}
          <Card t={t} density="compact" style={{ flexShrink: 0 }}>
            <CardHeader icon="📋" title={problem.title} t={t} density="compact"
              extra={
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button
                    onClick={() => fav?.toggleFavorite(selectedProblem)}
                    title={fav?.isFavorite(selectedProblem) ? "Remove from favorites" : "Add to favorites"}
                    style={{ ...iconButtonStyle, background: "transparent", border: "none" }}
                  >
                    <StarIcon filled={fav?.isFavorite(selectedProblem)} size={18} />
                  </button>
                  <button
                    onClick={() => fav?.toggleFlagged(selectedProblem)}
                    title={fav?.isFlagged(selectedProblem) ? "Remove flag" : "Flag this problem"}
                    style={{ ...iconButtonStyle, background: "transparent", border: "none" }}
                  >
                    <FlagIcon filled={fav?.isFlagged(selectedProblem)} size={18} />
                  </button>
                  <button onClick={handleShare} title="Copy share link"
                    style={{ ...iconButtonStyle, background: "transparent", border: "none", color: shareMsg ? t.green : t.inkMuted, position: "relative" }}>
                    {shareMsg ? (
                      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    ) : (
                      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                      </svg>
                    )}
                  </button>
                </div>
              }
            />
            <div style={{ padding: "12px 14px", fontSize: "0.85rem", lineHeight: 1.65, color: t.ink }}>
              <p dangerouslySetInnerHTML={{ __html: problem.description.replace(/<code>/g, `<code style="font-family:'JetBrains Mono',monospace;background:${t.surfaceAlt};padding:1px 5px;border-radius:4px;font-size:0.78rem;">`) }} />
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 8 }}>
                <span style={{ ...metaPillStyle, ...DIFF_COLOR[problem.difficulty] }}>{problem.difficulty}</span>
                <span style={{ ...metaPillStyle, color: t.inkMuted, background: t.surfaceAlt }}>{problem.category}</span>
              </div>
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
          <Card t={t} density="compact" style={{ flexShrink: 0, height: mobile ? 320 : "clamp(340px, 45vh, 560px)", display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden", ...(!mobile && { flex: 1, height: "auto", minHeight: 200 }) }}>
            <div style={{ display: "flex", alignItems: "center", borderBottom: `1.5px solid ${t.border}`, background: t.surfaceAlt, flexShrink: 0, paddingLeft: 4, paddingRight: 8 }}>
              {["Solution", "Explanation"].map(tab => (
                <button key={tab} onClick={() => setSolTab(tab)}
                  style={{ fontFamily: "'Caveat',cursive", fontSize: "0.96rem", fontWeight: 700, padding: "8px 14px", border: "none", cursor: "pointer", background: "transparent", color: solutionTab === tab ? t.ink : t.inkMuted, borderBottom: solutionTab === tab ? `2px solid ${t.yellow}` : "2px solid transparent", transition: UI_MOTION.fast, marginBottom: -1 }}>
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
                ? <CodePanel lines={langDef.code} activeLine={activeLine} disableScrollIntoView={whiteboardMaximized} />
                : <ExplanationPanel explanation={problem.explanation} t={t} />}
            </div>
          </Card>
        </div>

        {/* Resizable gutter (desktop only) */}
        {!mobile && (
          <div
            role="separator"
            aria-orientation="vertical"
            onMouseDown={handleGutterMouseDown}
            style={{
              width: 10,
              flexShrink: 0,
              cursor: "col-resize",
              background: "transparent",
              margin: "0 2px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Drag to resize panels"
          >
            <div style={{
              width: 2,
              height: 24,
              borderRadius: 1,
              background: isDraggingGutter ? t.yellow + "99" : t.border,
              transition: UI_MOTION.fast,
            }} />
          </div>
        )}

        {/* RIGHT — Visualizer */}
        <Card t={t} density="compact" style={{ display: "flex", flexDirection: "column", overflow: "hidden", minHeight: mobile ? 420 : 0, flex: mobile ? "none" : 1, minWidth: 0 }}>
          <CardHeader icon="🎨" title="Whiteboard" t={t} density="compact"
            extra={
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {canEditInputs ? (
                  <InputEditor input={input} fields={problem.inputFields} onChange={setInput} onReset={player.reset} t={t} problem={problem} />
                ) : (
                  <button
                    type="button"
                    onClick={() => onNavigate("billing")}
                    title="Editable inputs are available with Pro"
                    style={{
                      fontFamily: "'Caveat',cursive",
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      padding: "5px 10px",
                      borderRadius: 8,
                      border: `1.5px solid ${t.border}`,
                      background: t.surfaceAlt,
                      color: t.ink,
                      cursor: "pointer",
                      boxShadow: t.shadowSm,
                    }}
                  >
                    🔒 Edit inputs
                  </button>
                )}
                {!mobile && <div style={{ width: 1, height: 18, background: t.border, opacity: 0.6 }} />}
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
                <button onClick={() => setShowShortcuts(true)} title="Keyboard shortcuts (?)"
                  style={{ ...iconButtonStyle, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.78rem", fontWeight: 700 }}>
                  ?
                </button>
                <button onClick={() => setWhiteboardMaximized(true)} title="Maximize whiteboard"
                  style={iconButtonStyle}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>
                </button>
              </div>
            }
          />
          {showWorkspaceTip && (
            <div style={{ padding: "8px 12px 0", flexShrink: 0 }}>
              <div style={{ padding: "8px 10px", border: `1.5px solid ${t.border}`, borderRadius: 8, background: t.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <span style={{ fontSize: "0.8rem", color: t.inkMuted }}>
                  Tip: press <strong>Space</strong> to play/pause, <strong>E</strong> to toggle explanation, and use Edit Input for quick scenario testing.
                </span>
                <button onClick={dismissWorkspaceTip} style={{ border: "none", background: "transparent", color: t.inkMuted, cursor: "pointer", fontSize: "0.8rem", padding: 0 }}>
                  Dismiss
                </button>
              </div>
            </div>
          )}
          <div style={{ padding: "8px 12px", flexShrink: 0 }}>
            <div style={{ fontFamily: "'Caveat',cursive", fontSize: `${1.05 * whiteboardFontScale}rem`, fontWeight: 600, padding: "8px 12px", background: stepDescColor + (t._resolved === "dark" ? "33" : "cc"), border: `1.5px solid ${t.border}`, borderRadius: 8, minHeight: 40, display: "flex", alignItems: "center", gap: 8, color: t.ink, transition: UI_MOTION.emphasis }}>
              <span>💡</span>
              <span>{currentStep?.description || "Press ▶ to start the visualization"}</span>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "4px 16px 16px", fontSize: `${whiteboardFontScale}rem` }}>
            {problem.visualizer === "array"       && <ArrayVisualizer       nums={selectedProblem === "counting-bits" ? (currentStep?.state?.nums ?? Array(Math.max(0, (input.n ?? 0) + 1)).fill(0)) : selectedProblem === "coin-change" ? (currentStep?.state?.dp ?? (() => { const a = Math.max(0, Number(input?.amount) ?? 11); const d = Array(a + 1).fill(a + 1); d[0] = 0; return d; })()) : selectedProblem === "knapsack-01" ? (currentStep?.state?.dp ?? Array((Number(input?.target) ?? 8) + 1).fill(0)) : (input.nums || [])}   stepState={{ ...currentStep?.state, target: input.target }} t={t} arrayLabel={selectedProblem === "counting-bits" ? "ans" : selectedProblem === "coin-change" || selectedProblem === "knapsack-01" ? "dp" : undefined} />}
            {problem.visualizer === "trapping"    && <TrappingRainWaterViz nums={input.nums?.length ? input.nums : (problem.defaultInput?.nums ?? [])} stepState={currentStep?.state ?? {}} t={t} />}
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
            {problem.visualizer === "lca"          && <LCAOfBSTViz     root={(input.root && input.root.length) ? input.root : (problem.defaultInput?.root || [])}   stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "invertree"   && <InvertTreeViz    root={input.root || []}   stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "sametree"    && <SameTreeViz      p={input.p || []}         q={input.q || []} stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "linkedlist"  && <LinkedListViz    head={currentStep?.state?.head ?? input.head ?? []}   stepState={currentStep?.state ?? {}} problemId={selectedProblem} input={input} t={t} />}
            {problem.visualizer === "threesum"    && <ThreeSumViz      nums={input.nums || []}   stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "container"  && <ContainerViz     heights={input.heights || []} stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "mergelists" && <MergeListsViz    list1={input.list1 || []} list2={input.list2 || []} stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "mergek"     && <MergeKViz       lists={[]} stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "intervals"  && <IntervalsViz     stepState={currentStep?.state ?? {}} problemId={selectedProblem} t={t} />}
            {problem.visualizer === "cycle"      && <CycleViz         head={input.head || []}   stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "grid"       && <GridViz         stepState={currentStep?.state ?? {}} input={input} problemId={selectedProblem} t={t} />}
            {problem.visualizer === "graph"       && <GraphViz        stepState={currentStep?.state ?? {}} problemId={selectedProblem} t={t} />}
            {problem.visualizer === "rpn"         && <RpnViz          stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "decodeways"    && <DecodeWaysViz         s={input.s ?? ""}  stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "genparentheses" && <GenerateParenthesesViz stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "topk"          && <TopKFrequentViz       nums={input.nums || []}   stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "minstack"      && <MinStackViz           stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "medianfinder"  && <MedianFinderViz       stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "sumtwo"       && <SumTwoIntegersViz     stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "onebits"     && <NumberOf1BitsViz     stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "reversebits" && <ReverseBitsViz       stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "wordbreak"  && <WordBreakViz         s={input.s ?? ""} stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "lcs"        && <LongestCommonSubsequenceViz stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "lis"        && <LongestIncreasingSubsequenceViz nums={input.nums ?? []} stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "combinationsum" && <CombinationSumViz stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "robberii" && <HouseRobberIIViz nums={input.nums ?? []} stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "uniquepaths" && <UniquePathsViz stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "jumpgame" && <JumpGameViz nums={input.nums ?? []} stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "palindromicsubstrings" && <PalindromicSubstringsViz s={input.s ?? ""} stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "charreplacement" && <CharReplacementViz s={input.s ?? ""} k={input.k ?? 0} stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "encodedecode" && <EncodeDecodeViz s={input.s ?? ""} stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "slidingwindow" && <SlidingWindowViz s={input.s ?? ""} stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "subsets" && <SubsetsViz nums={input.nums ?? []} stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "permutations" && <PermutationsViz nums={input.nums ?? []} stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "longestpalindrome" && <LongestPalindromeViz s={input.s ?? ""} stepState={currentStep?.state ?? {}} t={t} />}
            {problem.visualizer === "groupanagrams" && <GroupAnagramsViz strs={input.s ?? ""} stepState={currentStep?.state ?? {}} t={t} />}
          </div>
          <StepControls {...player} t={t} mobile={mobile} />
          <div style={{ borderTop: `1.5px solid ${t.border}`, padding: "10px 12px", background: t.surfaceAlt + "66" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div style={{ fontSize: "0.8rem", color: t.inkMuted }}>
                Was this visualization helpful for understanding the algorithm?
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => handleHelpfulFeedback(true)}
                  style={{
                    border: `1.5px solid ${feedbackChoice === "yes" ? t.green : t.border}`,
                    background: feedbackChoice === "yes" ? t.green + "1a" : t.surface,
                    color: feedbackChoice === "yes" ? t.green : t.ink,
                    borderRadius: 8,
                    padding: "4px 8px",
                    fontSize: "0.78rem",
                    cursor: "pointer",
                  }}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => handleHelpfulFeedback(false)}
                  style={{
                    border: `1.5px solid ${feedbackChoice === "no" ? t.red : t.border}`,
                    background: feedbackChoice === "no" ? t.red + "14" : t.surface,
                    color: feedbackChoice === "no" ? t.red : t.ink,
                    borderRadius: 8,
                    padding: "4px 8px",
                    fontSize: "0.78rem",
                    cursor: "pointer",
                  }}
                >
                  Not yet
                </button>
                <button
                  type="button"
                  onClick={() => setReportOpen((s) => !s)}
                  style={{
                    border: `1.5px solid ${t.blue}`,
                    background: t.blue + "14",
                    color: t.blue,
                    borderRadius: 8,
                    padding: "4px 8px",
                    fontSize: "0.78rem",
                    cursor: "pointer",
                  }}
                >
                  Report issue
                </button>
              </div>
            </div>
            {reportOpen && (
              <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                <textarea
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="Describe what looked wrong (step, input, or mismatch)."
                  rows={3}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: `1.5px solid ${t.border}`,
                    background: t.surface,
                    color: t.ink,
                    fontSize: "0.8rem",
                    fontFamily: "'DM Sans',sans-serif",
                    resize: "vertical",
                  }}
                />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ fontSize: "0.75rem", color: t.inkMuted }}>
                    Includes current problem, step, and input snapshot.
                  </span>
                  <button
                    type="button"
                    onClick={handleIssueSubmit}
                    disabled={reportStatus === "sending" || !reportText.trim()}
                    style={{
                      border: `1.5px solid ${t.blue}`,
                      background: t.blue,
                      color: "#fff",
                      borderRadius: 8,
                      padding: "5px 10px",
                      fontSize: "0.78rem",
                      cursor: reportStatus === "sending" ? "wait" : "pointer",
                      opacity: reportStatus === "sending" || !reportText.trim() ? 0.7 : 1,
                    }}
                  >
                    {reportStatus === "sending" ? "Sending..." : reportStatus === "sent" ? "Sent" : "Send report"}
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* Personal notes (under whiteboard) */}
          {canUseNotes && notesData ? (
            <div style={{ borderTop: `1.5px solid ${t.border}`, padding: "10px 12px 12px", background: t.surfaceAlt + "80" }}>
              <button onClick={() => setNotesOpen((s) => !s)} style={{ width: "100%", border: "none", background: "transparent", padding: 0, cursor: "pointer", textAlign: "left", fontFamily: "'Caveat',cursive", fontSize: "1rem", fontWeight: 700, color: t.ink, marginBottom: notesOpen ? 8 : 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>📝 Personal notes</span>
                <span style={{ color: t.inkMuted, fontSize: "0.85rem" }}>{notesOpen ? "Hide" : "Show"}</span>
              </button>
              {notesOpen && (
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
                    background: t.surface,
                    color: t.ink,
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: "0.85rem",
                    lineHeight: 1.5,
                    resize: "vertical",
                    minHeight: 72,
                    outline: "none",
                  }}
                />
              )}
            </div>
          ) : (
            <div style={{ borderTop: `1.5px solid ${t.border}`, padding: "12px", background: t.surfaceAlt + "80", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1rem", fontWeight: 700, color: t.ink }}>
                  🔒 Personal notes
                </div>
                <div style={{ fontSize: "0.8rem", color: t.inkMuted, marginTop: 2 }}>
                  Save hints, edge cases, and observations with Pro.
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate("billing")}
                style={{
                  fontFamily: "'Caveat',cursive",
                  fontSize: "0.86rem",
                  fontWeight: 700,
                  padding: "5px 10px",
                  borderRadius: 8,
                  border: `1.5px solid ${t.blue}`,
                  background: t.blue + "14",
                  color: t.blue,
                  cursor: "pointer",
                }}
              >
                Unlock notes
              </button>
            </div>
          )}
        </Card>

        </div>

        {/* BOTTOM — Similar problems */}
        <div style={{ flexShrink: 0 }}>
          <SimilarProblems currentId={selectedProblem} onSelect={handleSelectSimilar} t={t} />
        </div>
      </div>
    </div>
  );
}
