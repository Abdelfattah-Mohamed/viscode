import { describe, expect, it } from "vitest";
import { hasActiveProEntitlement } from "../hooks/useSubscription";

describe("hasActiveProEntitlement", () => {
  it("requires a paid plan and an active or trialing status", () => {
    expect(hasActiveProEntitlement({ status: "active" }, { id: "pro" })).toBe(true);
    expect(hasActiveProEntitlement({ status: "trialing" }, { id: "pro_yearly" })).toBe(true);
    expect(hasActiveProEntitlement({ status: "active" }, { id: "pro_weekly" })).toBe(true);
    expect(hasActiveProEntitlement({ status: "active" }, { id: "lifetime" })).toBe(true);

    expect(hasActiveProEntitlement({ status: "canceled" }, { id: "pro" })).toBe(false);
    expect(hasActiveProEntitlement({ status: "past_due" }, { id: "pro" })).toBe(false);
    expect(hasActiveProEntitlement({ status: "incomplete" }, { id: "pro" })).toBe(false);
    expect(hasActiveProEntitlement({ status: "active" }, { id: "free" })).toBe(false);
    expect(hasActiveProEntitlement(undefined, { id: "pro" })).toBe(false);
  });
});
