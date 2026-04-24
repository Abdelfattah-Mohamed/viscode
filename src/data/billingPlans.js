/**
 * Canonical billing tiers (merged with Supabase `billing_plans` so UI stays correct
 * if the remote table is missing a row, e.g. `pro_weekly`).
 */
export const BILLING_PLAN_CATALOG = [
  {
    id: "free",
    name: "Free",
    description: "Basic access",
    amount_cents: 0,
    interval: "month",
    features: ["Limited problems", "Basic visualizations"],
  },
  {
    id: "pro_weekly",
    name: "Pro (Weekly)",
    description: "Full access, billed weekly",
    amount_cents: 159,
    interval: "week",
    features: ["All problems", "All visualizations", "Export", "Priority support"],
  },
  {
    id: "pro",
    name: "Pro (Monthly)",
    description: "Full access, billed monthly",
    amount_cents: 399,
    interval: "month",
    features: ["All problems", "All visualizations", "Export", "Priority support"],
  },
  {
    id: "pro_yearly",
    name: "Pro (Yearly)",
    description: "Full access, billed yearly",
    amount_cents: 3999,
    interval: "year",
    features: ["All problems", "All visualizations", "Export", "Priority support", "Best value"],
  },
  {
    id: "lifetime",
    name: "Lifetime",
    description: "One-time payment, access forever",
    amount_cents: 8999,
    interval: "one_time",
    features: ["All problems", "All visualizations", "Export", "Priority support", "Never pay again"],
  },
];

export function mergeBillingPlansFromDb(dbRows) {
  const byId = Object.fromEntries((dbRows || []).map((p) => [p.id, p]));
  return BILLING_PLAN_CATALOG.map((c) => {
    const row = byId[c.id];
    if (!row) return { ...c };
    const features =
      Array.isArray(row.features) && row.features.length > 0 ? row.features : c.features;
    // Keep catalog price & billing period so UI matches product (DB may be stale after price changes).
    return { ...c, ...row, amount_cents: c.amount_cents, interval: c.interval, features };
  });
}
