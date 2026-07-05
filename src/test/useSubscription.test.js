import { describe, expect, it } from "vitest";
import { hasActiveProEntitlement } from "../hooks/useSubscription";

describe("hasActiveProEntitlement", () => {
  const proPlan = { id: "pro" };
  const lifetimePlan = { id: "lifetime" };

  it("grants Pro only for paid plans with active subscription statuses", () => {
    expect(hasActiveProEntitlement({ status: "active" }, proPlan)).toBe(true);
    expect(hasActiveProEntitlement({ status: "trialing" }, proPlan)).toBe(true);
    expect(hasActiveProEntitlement({ status: "active" }, lifetimePlan)).toBe(true);
  });

  it("does not grant Pro for canceled or incomplete paid subscription rows", () => {
    expect(hasActiveProEntitlement({ status: "canceled" }, proPlan)).toBe(false);
    expect(hasActiveProEntitlement({ status: "past_due" }, proPlan)).toBe(false);
    expect(hasActiveProEntitlement({ status: "incomplete" }, proPlan)).toBe(false);
  });

  it("does not grant Pro for free plans even when the row is active", () => {
    expect(hasActiveProEntitlement({ status: "active" }, { id: "free" })).toBe(false);
    expect(hasActiveProEntitlement(null, proPlan)).toBe(false);
  });
});
