import { PROBLEMS } from "../data/problems";

export const FREE_CATEGORY = "Famous Algorithms";

/** Free-tier problems are the Famous Algorithms category. */
export function isFreeProblem(problemId) {
  return PROBLEMS[problemId]?.category === FREE_CATEGORY;
}

/** Pro users access everything; free users access the free category only. */
export function canAccessProblem(problemId, isPro) {
  return !!isPro || isFreeProblem(problemId);
}
