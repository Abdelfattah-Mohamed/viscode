const PAID_PLAN_IDS = new Set(["pro_weekly", "pro", "pro_yearly", "lifetime"]);
const ENTITLED_STATUSES = new Set(["active", "trialing"]);

export function isPaidPlanId(planId) {
  return PAID_PLAN_IDS.has(planId);
}

export function isSubscriptionEntitled(subscription, now = Date.now()) {
  if (!subscription || !isPaidPlanId(subscription.plan_id)) return false;
  if (!ENTITLED_STATUSES.has(subscription.status)) return false;
  if (subscription.plan_id === "lifetime") return true;
  if (!subscription.current_period_end) return true;

  const periodEnd = new Date(subscription.current_period_end).getTime();
  return Number.isFinite(periodEnd) && periodEnd > now;
}
