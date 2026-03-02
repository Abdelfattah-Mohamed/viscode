import { useState, useEffect, useCallback } from "react";
import {
  getSupabase,
  PROFILES_TABLE,
  USER_SUBSCRIPTIONS_TABLE,
  BILLING_PLANS_TABLE,
} from "../utils/supabase";

export function useSubscription(user) {
  const [subscription, setSubscription] = useState(null);
  const [plan, setPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const email = user?.email?.toLowerCase?.() || null;
  const isGuest = !user || user.isGuest;

  const refetch = useCallback(async () => {
    if (isGuest || !email) {
      setSubscription(null);
      setPlan(null);
      setPlans([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const sb = getSupabase();
    if (!sb) {
      setLoading(false);
      return;
    }

    try {
      const { data: profile, error: profileErr } = await sb
        .from(PROFILES_TABLE)
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (profileErr || !profile?.id) {
        setSubscription(null);
        setPlan(null);
        setLoading(false);
        return;
      }

      const profileId = profile.id;

      const { data: plansData } = await sb.from(BILLING_PLANS_TABLE).select("*").order("amount_cents");
      setPlans(plansData || []);

      const { data: subRow, error: subErr } = await sb
        .from(USER_SUBSCRIPTIONS_TABLE)
        .select("*")
        .eq("user_id", profileId)
        .maybeSingle();

      if (subErr) {
        setError(subErr.message);
        setLoading(false);
        return;
      }

      if (!subRow) {
        await sb.from(USER_SUBSCRIPTIONS_TABLE).upsert(
          {
            user_id: profileId,
            plan_id: "free",
            status: "active",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
        const p = (plansData || []).find((x) => x.id === "free");
        setSubscription({
          plan_id: "free",
          status: "active",
          current_period_end: null,
          cancel_at_period_end: false,
        });
        setPlan(p || null);
      } else {
        setSubscription(subRow);
        const p = (plansData || []).find((x) => x.id === subRow.plan_id);
        setPlan(p || null);
      }
    } catch (e) {
      setError(e?.message || "Failed to load subscription");
    } finally {
      setLoading(false);
    }
  }, [email, isGuest]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const isPro = plan?.id === "pro" || plan?.id === "pro_yearly" || plan?.id === "lifetime";
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
