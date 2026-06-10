import { PROBLEMS } from "../data/problems";

/** Maps a pathname to an app route { page, problemId? }. */
export function getRouteFromPath(pathname) {
  const path = (pathname || window.location.pathname).replace(/\/$/, "") || "/";
  if (path === "/" || path === "/home") return { page: "home" };
  if (path === "/problems") return { page: "problems" };
  if (path === "/profile") return { page: "profile" };
  if (path === "/billing") return { page: "billing" };
  if (path === "/votes") return { page: "votes" };
  if (path === "/terms") return { page: "terms" };
  if (path === "/privacy") return { page: "privacy" };
  if (path === "/refunds") return { page: "refunds" };
  const match = path.match(/^\/problem\/(.+)$/);
  if (match && PROBLEMS[match[1]]) return { page: "app", problemId: match[1] };
  return { page: "home" };
}

/** Maps an app page (and optional problem id) back to a pathname. */
export function pathFor(page, problemId) {
  if (page === "app" && problemId) return `/problem/${problemId}`;
  if (page === "home") return "/";
  if (page === "problems") return "/problems";
  if (page === "profile") return "/profile";
  if (page === "billing") return "/billing";
  if (page === "votes") return "/votes";
  if (page === "terms") return "/terms";
  if (page === "privacy") return "/privacy";
  if (page === "refunds") return "/refunds";
  return "/";
}

export const LEGAL_PAGES = new Set(["terms", "privacy", "refunds"]);
