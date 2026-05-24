import { PROBLEMS, LANG_META } from "../src/data/problems.js";
import { STEP_GENERATORS } from "../src/data/stepGenerators.js";

const LANGS = Object.keys(LANG_META);

const aliases = {
  update: ["relax", "visit"],
  pop: ["goal_check", "visit", "loop"],
  stack_built: ["dfs1_push", "init"],
  new_scc: ["dfs2_visit", "visit", "init"],
  dfs_recurse: ["recurse", "visit"],
  build_leaf: ["build"],
  build_merge: ["build", "query_combine"],
};

const fallbackCandidates = [
  "compare", "visit", "relax", "add_edge", "pop", "push", "update",
  "query", "find", "union", "add", "recurse", "build", "build_leaf",
  "build_merge", "query_combine", "loop_i", "loop_w", "loop_k", "loop_ij",
  "build_edges", "init_queue", "update_leftMax", "add_water_left",
  "update_rightMax", "add_water_right", "transpose", "reverse", "scan",
  "mark_zero", "sweep", "zero_col0", "zero_row0", "try_start", "base",
  "dfs_base", "dfs_fail", "dfs_mark", "dfs_recurse", "dfs_backtrack",
  "found", "go_right", "go_down", "go_left", "go_up", "try_odd", "try_even",
  "add_right", "shrink", "update_best", "read_len", "push_result",
  "add_push", "add_balance", "add_rebalance", "median", "ser_base",
  "ser_recurse", "ser_done", "des_base", "des_build", "des_recurse",
  "done", "init", "loop",
];

function resolveLine(stepType, lineMap) {
  const directCandidates = [stepType, ...(aliases[stepType] || [])];
  for (const key of directCandidates) {
    if (Number.isFinite(lineMap[key])) {
      return { kind: "direct", key, line: lineMap[key] };
    }
  }
  for (const key of fallbackCandidates) {
    if (Number.isFinite(lineMap[key])) {
      return { kind: "fallback", key, line: lineMap[key] };
    }
  }
  return { kind: "missing", key: null, line: null };
}

function isPlainObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

const results = {
  totalProblems: 0,
  totalInputs: 0,
  totalSteps: 0,
  totalLineResolutions: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  errors: [],
  warningMessages: [],
  problemResults: [],
};

const problemIds = Object.keys(PROBLEMS);
results.totalProblems = problemIds.length;

for (const id of problemIds) {
  const problem = PROBLEMS[id];
  const generator = STEP_GENERATORS[id];
  const problemResult = {
    id,
    title: problem.title,
    category: problem.category,
    inputs: [],
    lineSync: { direct: 0, fallback: 0, missing: 0 },
    errors: [],
    warnings: [],
  };

  if (!generator) {
    problemResult.errors.push("No step generator found");
    results.errors.push(`${id}: No step generator found`);
    results.failed++;
    results.problemResults.push(problemResult);
    continue;
  }

  const inputs = [{ caseId: "defaultInput", values: problem.defaultInput || {} }];
  if (Array.isArray(problem.examples)) {
    for (const ex of problem.examples) {
      if (isPlainObject(ex?.values)) {
        inputs.push({ caseId: `example-${ex.id}`, values: ex.values });
      }
    }
  }

  let problemHasError = false;

  for (const { caseId, values } of inputs) {
    results.totalInputs++;
    let steps;
    try {
      steps = generator(values);
    } catch (err) {
      problemResult.errors.push(`${caseId}: generator threw: ${err.message}`);
      results.errors.push(`${id} [${caseId}]: generator threw: ${err.message}`);
      problemHasError = true;
      continue;
    }

    if (!Array.isArray(steps)) {
      problemResult.errors.push(`${caseId}: generator did not return an array`);
      results.errors.push(`${id} [${caseId}]: generator did not return an array`);
      problemHasError = true;
      continue;
    }

    if (steps.length === 0) {
      problemResult.warnings.push(`${caseId}: generator returned 0 steps`);
      results.warningMessages.push(`${id} [${caseId}]: generator returned 0 steps`);
      continue;
    }

    const inputResult = { caseId, stepCount: steps.length, lineResolutions: {} };

    for (const lang of LANGS) {
      const langDef = problem.languages?.[lang];
      if (!langDef?.lineMap || !langDef?.code?.length) continue;

      const codeLength = langDef.code.length;
      const lineResolution = { direct: 0, fallback: 0, missing: 0, outOfBounds: 0, lineChanges: 0 };
      let prevLine = -1;
      const linesUsed = new Set();

      for (let si = 0; si < steps.length; si++) {
        const step = steps[si];
        results.totalSteps++;
        results.totalLineResolutions++;

        if (!isPlainObject(step)) {
          problemResult.errors.push(`${caseId} [${lang}] step ${si}: not an object`);
          results.errors.push(`${id} [${caseId}] [${lang}] step ${si}: not an object`);
          problemHasError = true;
          continue;
        }

        if (typeof step.stepType !== "string" || !step.stepType.trim()) {
          problemResult.errors.push(`${caseId} [${lang}] step ${si}: invalid stepType`);
          results.errors.push(`${id} [${caseId}] [${lang}] step ${si}: invalid stepType`);
          problemHasError = true;
          continue;
        }

        if (!isPlainObject(step.state)) {
          problemResult.warnings.push(`${caseId} [${lang}] step ${si}: state is not an object`);
          results.warningMessages.push(`${id} [${caseId}] [${lang}] step ${si}: state is not an object`);
        }

        const resolved = resolveLine(step.stepType, langDef.lineMap);

        if (resolved.kind === "direct") {
          lineResolution.direct++;
          problemResult.lineSync.direct++;
        } else if (resolved.kind === "fallback") {
          lineResolution.fallback++;
          problemResult.lineSync.fallback++;
        } else {
          lineResolution.missing++;
          problemResult.lineSync.missing++;
          problemResult.errors.push(
            `${caseId} [${lang}] step ${si}: stepType "${step.stepType}" has no line mapping`
          );
          results.errors.push(
            `${id} [${caseId}] [${lang}] step ${si}: stepType "${step.stepType}" has no line mapping`
          );
          problemHasError = true;
        }

        if (resolved.line !== null) {
          if (resolved.line < 1 || resolved.line > codeLength) {
            lineResolution.outOfBounds++;
            problemResult.errors.push(
              `${caseId} [${lang}] step ${si}: line ${resolved.line} out of bounds (1..${codeLength})`
            );
            results.errors.push(
              `${id} [${caseId}] [${lang}] step ${si}: line ${resolved.line} out of bounds (1..${codeLength})`
            );
            problemHasError = true;
          } else {
            linesUsed.add(resolved.line);
            if (resolved.line !== prevLine) {
              lineResolution.lineChanges++;
            }
            prevLine = resolved.line;
          }
        }
      }

      inputResult.lineResolutions[lang] = lineResolution;

      if (linesUsed.size <= 1 && steps.length > 3) {
        problemResult.warnings.push(
          `${caseId} [${lang}]: only ${linesUsed.size} distinct line(s) highlighted across ${steps.length} steps`
        );
        results.warningMessages.push(
          `${id} [${caseId}] [${lang}]: only ${linesUsed.size} distinct line(s) highlighted across ${steps.length} steps`
        );
      }

      if (lineResolution.lineChanges === 0 && steps.length > 1) {
        problemResult.warnings.push(
          `${caseId} [${lang}]: code highlight never changes (stuck on line ${prevLine})`
        );
        results.warningMessages.push(
          `${id} [${caseId}] [${lang}]: code highlight never changes (stuck on line ${prevLine})`
        );
      }
    }

    const lastStep = steps[steps.length - 1];
    if (lastStep && lastStep.stepType !== "done" && lastStep.stepType !== "found") {
      const hasTerminalState = lastStep.state?.done === true || lastStep.state?.found === true;
      if (!hasTerminalState) {
        problemResult.warnings.push(
          `${caseId}: last step has stepType "${lastStep.stepType}" (not "done"/"found") and no terminal state`
        );
        results.warningMessages.push(
          `${id} [${caseId}]: last step has stepType "${lastStep.stepType}" (not "done"/"found") and no terminal state`
        );
      }
    }

    problemResult.inputs.push(inputResult);
  }

  if (problemHasError) {
    results.failed++;
  } else {
    results.passed++;
  }
  results.problemResults.push(problemResult);
}

console.log("═══════════════════════════════════════════════════════════════");
console.log("  VISCODE — Comprehensive Visualization & Code-Line Sync Test");
console.log("═══════════════════════════════════════════════════════════════\n");

console.log(`Problems tested:    ${results.totalProblems}`);
console.log(`Input cases tested: ${results.totalInputs}`);
console.log(`Total steps run:    ${results.totalSteps}`);
console.log(`Line resolutions:   ${results.totalLineResolutions}`);
console.log("");
console.log(`✅ Passed: ${results.passed}/${results.totalProblems}`);
console.log(`❌ Failed: ${results.failed}/${results.totalProblems}`);
console.log(`⚠️  Warnings: ${results.warningMessages.length}`);
console.log("");

let totalDirect = 0, totalFallback = 0, totalMissing = 0;
for (const pr of results.problemResults) {
  totalDirect += pr.lineSync.direct;
  totalFallback += pr.lineSync.fallback;
  totalMissing += pr.lineSync.missing;
}
const totalResolved = totalDirect + totalFallback + totalMissing;
console.log("Line Resolution Breakdown:");
console.log(`  Direct (stepType in lineMap):     ${totalDirect} (${((totalDirect/totalResolved)*100).toFixed(1)}%)`);
console.log(`  Fallback (generic candidates):    ${totalFallback} (${((totalFallback/totalResolved)*100).toFixed(1)}%)`);
console.log(`  Missing (no mapping found):       ${totalMissing} (${((totalMissing/totalResolved)*100).toFixed(1)}%)`);
console.log("");

if (results.errors.length) {
  console.log("───────────────────────────────────────────────────────────────");
  console.log(`ERRORS (${results.errors.length}):`);
  console.log("───────────────────────────────────────────────────────────────");
  for (const err of results.errors) {
    console.log(`  ❌ ${err}`);
  }
  console.log("");
}

if (results.warningMessages.length) {
  console.log("───────────────────────────────────────────────────────────────");
  console.log(`WARNINGS (${results.warningMessages.length}):`);
  console.log("───────────────────────────────────────────────────────────────");
  for (const w of results.warningMessages) {
    console.log(`  ⚠️  ${w}`);
  }
  console.log("");
}

console.log("───────────────────────────────────────────────────────────────");
console.log("Per-Problem Summary:");
console.log("───────────────────────────────────────────────────────────────");
console.log(
  "ID".padEnd(40) +
  "Steps".padEnd(8) +
  "Direct".padEnd(9) +
  "Fallback".padEnd(10) +
  "Missing".padEnd(9) +
  "Status"
);
console.log("-".repeat(85));

for (const pr of results.problemResults) {
  const totalSteps = pr.inputs.reduce((sum, inp) => {
    return sum + Object.values(inp.lineResolutions || {}).reduce((s, lr) => s + lr.direct + lr.fallback + lr.missing, 0);
  }, 0);
  const status = pr.errors.length ? "❌ FAIL" : (pr.warnings.length ? "⚠️  WARN" : "✅ PASS");
  console.log(
    pr.id.padEnd(40) +
    String(totalSteps || "-").padEnd(8) +
    String(pr.lineSync.direct).padEnd(9) +
    String(pr.lineSync.fallback).padEnd(10) +
    String(pr.lineSync.missing).padEnd(9) +
    status
  );
}

console.log("\n═══════════════════════════════════════════════════════════════");
if (results.failed > 0) {
  console.log(`RESULT: ❌ ${results.failed} problem(s) failed validation`);
  process.exitCode = 1;
} else {
  console.log("RESULT: ✅ All problems pass visualization & code-line sync checks");
}
console.log("═══════════════════════════════════════════════════════════════");
