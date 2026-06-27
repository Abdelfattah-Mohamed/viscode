import { describe, expect, it } from "vitest";
import { isPaidPlanId, isSubscriptionEntitled } from "../utils/entitlements";

describe("subscription entitlements", () => {
  const now = new Date("2026-06-26T12:00:00.000Z").getTime();
  const future = new Date(now + 60_000).toISOString();
  const past = new Date(now - 60_000).toISOString();

  it("recognizes paid plan ids", () => {
    expect(isPaidPlanId("pro_weekly")).toBe(true);
    expect(isPaidPlanId("pro")).toBe(true);
    expect(isPaidPlanId("pro_yearly")).toBe(true);
    expect(isPaidPlanId("lifetime")).toBe(true);
    expect(isPaidPlanId("free")).toBe(false);
  });

  it("requires an entitled status for paid recurring plans", () => {
    expect(isSubscriptionEntitled({ plan_id: "pro", status: "active", current_period_end: future }, now)).toBe(true);
    expect(isSubscriptionEntitled({ plan_id: "pro", status: "trialing", current_period_end: future }, now)).toBe(true);
    expect(isSubscriptionEntitled({ plan_id: "pro", status: "canceled", current_period_end: future }, now)).toBe(false);
    expect(isSubscriptionEntitled({ plan_id: "pro", status: "past_due", current_period_end: future }, now)).toBe(false);
  });

  it("does not grant access to expired or free subscriptions", () => {
    expect(isSubscriptionEntitled({ plan_id: "pro_yearly", status: "active", current_period_end: past }, now)).toBe(false);
    expect(isSubscriptionEntitled({ plan_id: "free", status: "active", current_period_end: null }, now)).toBe(false);
  });

  it("keeps active lifetime subscriptions entitled without a period end", () => {
    expect(isSubscriptionEntitled({ plan_id: "lifetime", status: "active", current_period_end: null }, now)).toBe(true);
  });
});
