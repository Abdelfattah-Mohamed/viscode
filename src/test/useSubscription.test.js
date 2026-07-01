import { describe, expect, it } from "vitest";
import { hasPaidAccess } from "../hooks/useSubscription";

describe("hasPaidAccess", () => {
  it("requires a paid plan and an active-like subscription status", () => {
    expect(hasPaidAccess("pro", "active")).toBe(true);
    expect(hasPaidAccess("pro_yearly", "trialing")).toBe(true);
    expect(hasPaidAccess("pro_weekly", "past_due")).toBe(true);
    expect(hasPaidAccess("lifetime", "active")).toBe(true);

    expect(hasPaidAccess("pro", "canceled")).toBe(false);
    expect(hasPaidAccess("pro", "incomplete")).toBe(false);
    expect(hasPaidAccess("pro", undefined)).toBe(false);
    expect(hasPaidAccess("free", "active")).toBe(false);
  });
});
