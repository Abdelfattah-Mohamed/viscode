import { PROBLEMS, LANG_META, CAT_ICON } from "../src/data/problems.js";
import { STEP_GENERATORS } from "../src/data/stepGenerators.js";

const expectedLangs = Object.keys(LANG_META);
const problemIds = Object.keys(PROBLEMS);
const generatorIds = Object.keys(STEP_GENERATORS);
const braceStyleLangs = new Set(["cpp", "java", "javascript"]);
const blockControlPattern = /\b(if|for|while)\s*\(/g;
const freeCategory = "Famous Algorithms";

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

const warnings = [];
const errors = [];

function issue(collection, id, message) {
  collection.push(`${id}: ${message}`);
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function sameShape(value, reference) {
  if (Array.isArray(reference)) {
    return Array.isArray(value);
  }
  if (reference === null || reference === undefined) {
    return true;
  }
  return typeof value === typeof reference;
}

function findMatchingParen(line, openIndex) {
  let depth = 0;
  for (let i = openIndex; i < line.length; i++) {
    const ch = line[i];
    if (ch === "(") {
      depth++;
    } else if (ch === ")") {
      depth--;
      if (depth === 0) {
        return i;
      }
    }
  }
  return -1;
}

function hasUnbracedSingleLineControl(line) {
  const matches = [...line.matchAll(blockControlPattern)];
  for (const match of matches) {
    if (line.slice(0, match.index).trim()) {
      continue;
    }
    const openIndex = line.indexOf("(", match.index);
    const closeIndex = findMatchingParen(line, openIndex);
    if (closeIndex < 0) {
      continue;
    }
    const bodyStart = closeIndex + 1;
    const whitespace = line.slice(bodyStart).match(/^\s*/)?.[0] || "";
    const firstBodyChar = line[bodyStart + whitespace.length];
    if (!firstBodyChar || (firstBodyChar !== "{" && firstBodyChar !== ";")) {
      return true;
    }
  }
  return false;
}

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

function validateProblem(id, problem) {
  if (!problem.title) {
    issue(errors, id, "missing title");
  }
  if (!problem.category) {
    issue(errors, id, "missing category");
  }
  if (problem.category && !CAT_ICON[problem.category]) {
    issue(warnings, id, `category "${problem.category}" has no CAT_ICON entry`);
  }
  if (!problem.visualizer) {
    issue(errors, id, "missing visualizer");
  }
  if (!isPlainObject(problem.example)) {
    issue(errors, id, "missing example object");
  } else {
    for (const key of ["input", "output", "note"]) {
      if (typeof problem.example[key] !== "string" || !problem.example[key].trim()) {
        issue(errors, id, `example.${key} must be a non-empty string`);
      }
    }
  }
  if (!isPlainObject(problem.defaultInput)) {
    issue(errors, id, "missing defaultInput object");
  }
  if (!Array.isArray(problem.inputFields)) {
    issue(errors, id, "inputFields must be an array");
  } else if (isPlainObject(problem.defaultInput)) {
    for (const field of problem.inputFields) {
      if (!(field in problem.defaultInput)) {
        issue(errors, id, `inputFields includes "${field}" but defaultInput does not`);
      }
    }
  }

  const examples = Array.isArray(problem.examples) ? problem.examples : [];
  if (problem.category !== freeCategory) {
    if (examples.length < 3) {
      issue(errors, id, "Pro problems must define at least 3 selectable examples");
    }
    const seenExampleIds = new Set();
    examples.forEach((example, index) => {
      const exampleId = example?.id || `index ${index}`;
      if (!isPlainObject(example)) {
        issue(errors, id, `examples[${index}] must be an object`);
        return;
      }
      if (typeof example.id !== "string" || !example.id.trim()) {
        issue(errors, id, `examples[${index}].id must be a non-empty string`);
      } else if (seenExampleIds.has(example.id)) {
        issue(errors, id, `duplicate example id "${example.id}"`);
      } else {
        seenExampleIds.add(example.id);
      }
      for (const key of ["label", "input", "output", "note"]) {
        if (typeof example[key] !== "string" || !example[key].trim()) {
          issue(errors, id, `example ${exampleId}.${key} must be a non-empty string`);
        }
      }
      if (!isPlainObject(example.values)) {
        issue(errors, id, `example ${exampleId}.values must be an object`);
        return;
      }
      for (const field of problem.inputFields || []) {
        if (!(field in example.values)) {
          issue(errors, id, `example ${exampleId}.values missing "${field}"`);
        } else if (!sameShape(example.values[field], problem.defaultInput?.[field])) {
          issue(errors, id, `example ${exampleId}.values.${field} shape differs from defaultInput`);
        }
      }
    });
  }

  const languages = problem.languages || {};
  for (const lang of expectedLangs) {
    const def = languages[lang];
    if (!def) {
      issue(errors, id, `missing ${lang} language definition`);
      continue;
    }
    if (!Array.isArray(def.code) || def.code.length === 0) {
      issue(errors, id, `${lang}.code must be a non-empty array`);
    } else if (braceStyleLangs.has(lang)) {
      def.code.forEach((line, index) => {
        if (hasUnbracedSingleLineControl(line)) {
          issue(errors, id, `${lang}.code line ${index + 1} has an if/for without braces`);
        }
      });
    }
    if (!isPlainObject(def.lineMap)) {
      issue(errors, id, `${lang}.lineMap must be an object`);
      continue;
    }
    const codeLength = Array.isArray(def.code) ? def.code.length : 0;
    for (const [key, line] of Object.entries(def.lineMap)) {
      if (!Number.isInteger(line)) {
        issue(errors, id, `${lang}.lineMap.${key} must be an integer`);
      } else if (line < 1 || line > codeLength) {
        issue(errors, id, `${lang}.lineMap.${key}=${line} outside 1..${codeLength}`);
      }
    }
  }

  const generator = STEP_GENERATORS[id];
  if (!generator) {
    issue(errors, id, "missing STEP_GENERATORS entry");
    return;
  }

  const generatorInputs = [{ caseId: "defaultInput", values: problem.defaultInput || {} }];
  for (const example of examples) {
    if (isPlainObject(example?.values)) {
      generatorInputs.push({ caseId: `example ${example.id || "unknown"}`, values: example.values });
    }
  }

  const stepTypes = new Set();
  let steps;
  try {
    steps = generator(problem.defaultInput || {});
  } catch (error) {
    issue(errors, id, `generator threw: ${error?.message || error}`);
    return;
  }

  if (!Array.isArray(steps)) {
    issue(errors, id, "generator did not return an array");
    return;
  }
  if (steps.length === 0) {
    issue(warnings, id, "generator returned no steps for defaultInput");
    return;
  }

  const collectSteps = (caseId, caseSteps) => {
    if (!Array.isArray(caseSteps)) {
      issue(errors, id, `${caseId} generator did not return an array`);
      return;
    }
    if (caseSteps.length === 0) {
      issue(warnings, id, `${caseId} generator returned no steps`);
      return;
    }
    caseSteps.forEach((step, index) => {
      if (!isPlainObject(step)) {
        issue(errors, id, `${caseId} step ${index} is not an object`);
        return;
      }
      if (typeof step.stepType !== "string" || !step.stepType.trim()) {
        issue(errors, id, `${caseId} step ${index} has invalid stepType`);
      } else {
        stepTypes.add(step.stepType);
      }
      if (typeof step.description !== "string" || !step.description.trim()) {
        issue(warnings, id, `${caseId} step ${index} has empty description`);
      }
      if (!isPlainObject(step.state)) {
        issue(warnings, id, `${caseId} step ${index} state should be an object`);
      }
    });
  };

  collectSteps("defaultInput", steps);
  for (const { caseId, values } of generatorInputs.slice(1)) {
    try {
      collectSteps(caseId, generator(values));
    } catch (error) {
      issue(errors, id, `${caseId} generator threw: ${error?.message || error}`);
    }
  }

  /*
  steps.forEach((step, index) => {
    if (!isPlainObject(step)) {
      issue(errors, id, `step ${index} is not an object`);
      return;
    }
    if (typeof step.stepType !== "string" || !step.stepType.trim()) {
      issue(errors, id, `step ${index} has invalid stepType`);
    } else {
      stepTypes.add(step.stepType);
    }
    if (typeof step.description !== "string" || !step.description.trim()) {
      issue(warnings, id, `step ${index} has empty description`);
    }
    if (!isPlainObject(step.state)) {
      issue(warnings, id, `step ${index} state should be an object`);
    }
  });
  */

  for (const [lang, def] of Object.entries(languages)) {
    if (!expectedLangs.includes(lang) || !isPlainObject(def?.lineMap)) {
      continue;
    }
    const fallbackTypes = [];
    const missingTypes = [];
    for (const stepType of stepTypes) {
      const resolved = resolveLine(stepType, def.lineMap);
      if (resolved.kind === "fallback") {
        fallbackTypes.push(`${stepType}->${resolved.key}`);
      }
      if (resolved.kind === "missing") {
        missingTypes.push(stepType);
      }
    }
    if (missingTypes.length) {
      issue(errors, id, `${lang} has unmapped stepTypes: ${missingTypes.sort().join(", ")}`);
    }
    if (fallbackTypes.length) {
      issue(warnings, id, `${lang} stepTypes rely on generic fallback: ${fallbackTypes.sort().join(", ")}`);
    }
  }
}

for (const id of problemIds) {
  validateProblem(id, PROBLEMS[id]);
}

for (const id of generatorIds) {
  if (!PROBLEMS[id]) {
    issue(warnings, id, "STEP_GENERATORS entry has no PROBLEMS entry");
  }
}

const categoryCounts = problemIds.reduce((counts, id) => {
  const category = PROBLEMS[id].category || "Uncategorized";
  counts[category] = (counts[category] || 0) + 1;
  return counts;
}, {});

console.log(`Validated ${problemIds.length} problems and ${generatorIds.length} generators.`);
console.log("Categories:");
for (const [category, count] of Object.entries(categoryCounts).sort((a, b) => a[0].localeCompare(b[0]))) {
  console.log(`- ${category}: ${count}`);
}

if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`);
  warnings.forEach((warning) => console.log(`- ${warning}`));
}

if (errors.length) {
  console.error(`\nErrors (${errors.length}):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log("\nNo validation errors found.");
}
