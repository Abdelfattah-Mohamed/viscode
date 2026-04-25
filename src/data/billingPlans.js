/**
 * Canonical billing tiers (merged with Supabase `billing_plans` so UI stays correct
 * if the remote table is missing a row, e.g. `pro_weekly`).
 */
export const BILLING_PLAN_CATALOG = [
  {
    id: "free",
    name: "Free",
    description: "Explore the Famous Algorithms collection for free",
    amount_cents: 0,
    interval: "month",
    features: ["Famous Algorithms access", "Step-by-step visualizations", "Code synced with animations"],
  },
  {
    id: "pro_weekly",
    name: "Pro (Weekly)",
    description: "Try full access with a flexible weekly plan",
    amount_cents: 159,
    interval: "week",
    features: ["Unlock every problem category", "Full visualization library", "Editable inputs and live previews", "Saved profile progress", "Cancel anytime"],
  },
  {
    id: "pro",
    name: "Pro (Monthly)",
    description: "Best for steady interview preparation",
    amount_cents: 399,
    interval: "month",
    features: ["Unlock every problem category", "Full visualization library", "Editable inputs and live previews", "Favorites and flagged problems", "Priority learning updates"],
  },
  {
    id: "pro_yearly",
    name: "Pro (Yearly)",
    description: "Best value for long-term practice",
    amount_cents: 3999,
    interval: "year",
    features: ["Everything in Pro Monthly", "Lower effective monthly cost", "All future problem additions", "Priority learning updates", "Best value"],
  },
  {
    id: "lifetime",
    name: "Lifetime",
    description: "One payment for permanent access",
    amount_cents: 8999,
    interval: "one_time",
    features: ["Everything in Pro Yearly", "Permanent Pro access", "All future problem additions", "No renewals", "Highest value over time"],
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
