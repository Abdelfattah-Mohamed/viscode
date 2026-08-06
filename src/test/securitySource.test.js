import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function read(relPath) {
  return readFileSync(resolve(process.cwd(), relPath), "utf8");
}

describe("stripe-webhook fail-closed persistence", () => {
  it("returns 500 when entitlement or invoice writes fail", () => {
    const src = read("supabase/functions/stripe-webhook/index.ts");

    // Must capture PostgREST errors (supabase-js does not throw on them).
    expect(src).toMatch(/error:\s*upsertError/);
    expect(src).toMatch(/error:\s*updateError/);
    expect(src).toMatch(/error:\s*insertError/);
    expect(src).toMatch(/error:\s*lookupError/);
    expect(src).toMatch(/error:\s*invoiceLookupError/);

    // Fail closed so Stripe retries instead of permanently dropping the entitlement.
    expect(src).toMatch(/upsertError\.message[\s\S]*?,\s*500/);
    expect(src).toMatch(/updateError\.message[\s\S]*?,\s*500/);
    expect(src).toMatch(/insertError\.message[\s\S]*?,\s*500/);
    expect(src).toMatch(/lookupError\.message[\s\S]*?,\s*500/);
    expect(src).toMatch(/invoiceLookupError\.message[\s\S]*?,\s*500/);
  });
});
