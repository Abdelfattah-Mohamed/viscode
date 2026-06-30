import { describe, expect, it } from "vitest";
import { hasActiveProEntitlement } from "../hooks/useSubscription";

describe("subscription entitlements", () => {
  it("grants Pro for active and trialing paid plans", () => {
    for (const status of ["active", "trialing"]) {
      expect(hasActiveProEntitlement({ status }, { id: "pro" })).toBe(true);
      expect(hasActiveProEntitlement({ status }, { id: "pro_weekly" })).toBe(true);
      expect(hasActiveProEntitlement({ status }, { id: "pro_yearly" })).toBe(true);
      expect(hasActiveProEntitlement({ status }, { id: "lifetime" })).toBe(true);
    }
  });

  it("does not grant Pro when a paid subscription is not active", () => {
    for (const status of ["canceled", "past_due", "incomplete", undefined]) {
      expect(hasActiveProEntitlement({ status }, { id: "pro" })).toBe(false);
    }
  });

  it("does not grant Pro for free or missing plans", () => {
    expect(hasActiveProEntitlement({ status: "active" }, { id: "free" })).toBe(false);
    expect(hasActiveProEntitlement({ status: "active" }, null)).toBe(false);
  });
});
