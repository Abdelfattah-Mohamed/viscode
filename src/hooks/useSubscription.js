import { useState, useEffect, useCallback } from "react";
import {
  getSupabase,
  PROFILES_TABLE,
  USER_SUBSCRIPTIONS_TABLE,
  BILLING_PLANS_TABLE,
} from "../utils/supabase";
import { mergeBillingPlansFromDb } from "../data/billingPlans";

const PLAN_CACHE_TTL_MS = 5 * 60 * 1000;
let plansCache = {
  at: 0,
  plans: null,
};

export function useSubscription(user) {
  const [subscription, setSubscription] = useState(null);
  const [plan, setPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const email = user?.email?.toLowerCase?.() || null;
  const isGuest = !user || user.isGuest;

  const refetch = useCallback(async () => {
    const dev = !!import.meta.env.DEV;
    const t0 = dev ? performance.now() : 0;
    const log = (msg, extra) => {
      if (!dev) return;
      if (extra !== undefined) {
        console.debug(`[billing] ${msg}`, extra);
      } else {
        console.debug(`[billing] ${msg}`);
      }
    };

    if (isGuest || !email) {
      setSubscription(null);
      setPlan(null);
      setPlans([]);
      setLoading(false);
      log("refetch skipped (guest or missing email)");
      return;
    }

    setLoading(true);
    setError(null);
    const sb = getSupabase();
    if (!sb) {
      setLoading(false);
      log("refetch skipped (supabase client unavailable)");
      return;
    }

    try {
      const tProfile0 = dev ? performance.now() : 0;
      const { data: profile, error: profileErr } = await sb
        .from(PROFILES_TABLE)
        .select("id")
        .eq("email", email)
        .maybeSingle();
      if (dev) log(`profile lookup: ${Math.round(performance.now() - tProfile0)}ms`);

      if (profileErr || !profile?.id) {
        setSubscription(null);
        setPlan(null);
        setLoading(false);
        log("profile lookup failed or missing profile", profileErr?.message || null);
        return;
      }

      const profileId = profile.id;

      const now = Date.now();
      const cachedPlansValid = plansCache.plans && now - plansCache.at < PLAN_CACHE_TTL_MS;

      const plansPromise = cachedPlansValid
        ? Promise.resolve({ data: plansCache.plans, error: null })
        : sb.from(BILLING_PLANS_TABLE).select("*").order("amount_cents");

      const subscriptionPromise = sb
        .from(USER_SUBSCRIPTIONS_TABLE)
        .select("*")
        .eq("user_id", profileId)
        .maybeSingle();

      const tParallel0 = dev ? performance.now() : 0;
      const [{ data: plansData, error: plansErr }, { data: subRow, error: subErr }] = await Promise.all([
        plansPromise,
        subscriptionPromise,
      ]);
      if (dev) log(`plans+subscription fetch: ${Math.round(performance.now() - tParallel0)}ms`);

      if (plansErr) {
        setError(plansErr.message);
        setLoading(false);
        log("plans fetch error", plansErr.message);
        return;
      }

      const mergedPlans = mergeBillingPlansFromDb(plansData);
      plansCache = { at: now, plans: plansData };
      setPlans(mergedPlans);

      if (subErr) {
        setError(subErr.message);
        setLoading(false);
        log("subscription fetch error", subErr.message);
        return;
      }

      if (!subRow) {
        // Persist free row asynchronously; don't block initial billing render.
        sb.from(USER_SUBSCRIPTIONS_TABLE).upsert(
          {
            user_id: profileId,
            plan_id: "free",
            status: "active",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        ).then(() => {}).catch(() => {});
        const p = mergedPlans.find((x) => x.id === "free");
        setSubscription({
          plan_id: "free",
          status: "active",
          current_period_end: null,
          cancel_at_period_end: false,
        });
        setPlan(p || null);
      } else {
        setSubscription(subRow);
        const p = mergedPlans.find((x) => x.id === subRow.plan_id);
        setPlan(p || null);
      }
    } catch (e) {
      setError(e?.message || "Failed to load subscription");
      log("refetch exception", e?.message || "unknown error");
    } finally {
      setLoading(false);
      if (dev) log(`refetch total: ${Math.round(performance.now() - t0)}ms`);
    }
  }, [email, isGuest]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const isPro =
    plan?.id === "pro_weekly" ||
    plan?.id === "pro" ||
    plan?.id === "pro_yearly" ||
    plan?.id === "lifetime";
  const planName = plan?.name || "Free";
  const nextBillingDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return {
    subscription,
    plan,
    plans,
    loading,
    error,
    refetch,
    isPro,
    planName,
    nextBillingDate,
  };
}
