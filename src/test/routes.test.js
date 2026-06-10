import { describe, it, expect } from "vitest";
import { getRouteFromPath, pathFor, LEGAL_PAGES } from "../utils/routes";

describe("routing", () => {
  it("maps core paths to pages", () => {
    expect(getRouteFromPath("/")).toEqual({ page: "home" });
    expect(getRouteFromPath("/home")).toEqual({ page: "home" });
    expect(getRouteFromPath("/problems")).toEqual({ page: "problems" });
    expect(getRouteFromPath("/billing")).toEqual({ page: "billing" });
    expect(getRouteFromPath("/votes")).toEqual({ page: "votes" });
    expect(getRouteFromPath("/profile")).toEqual({ page: "profile" });
  });

  it("maps legal paths to public pages", () => {
    expect(getRouteFromPath("/terms")).toEqual({ page: "terms" });
    expect(getRouteFromPath("/privacy")).toEqual({ page: "privacy" });
    expect(getRouteFromPath("/refunds")).toEqual({ page: "refunds" });
    expect(LEGAL_PAGES.has("terms")).toBe(true);
    expect(LEGAL_PAGES.has("privacy")).toBe(true);
    expect(LEGAL_PAGES.has("refunds")).toBe(true);
  });

  it("maps known problem urls to the app page", () => {
    expect(getRouteFromPath("/problem/two-sum")).toEqual({ page: "app", problemId: "two-sum" });
  });

  it("falls back to home for unknown problems and paths", () => {
    expect(getRouteFromPath("/problem/not-a-problem")).toEqual({ page: "home" });
    expect(getRouteFromPath("/nope")).toEqual({ page: "home" });
  });

  it("round-trips pages through pathFor", () => {
    for (const page of ["home", "problems", "profile", "billing", "votes", "terms", "privacy", "refunds"]) {
      expect(getRouteFromPath(pathFor(page))).toEqual({ page });
    }
    expect(pathFor("app", "two-sum")).toBe("/problem/two-sum");
  });

  it("strips trailing slashes", () => {
    expect(getRouteFromPath("/problems/")).toEqual({ page: "problems" });
  });
});
