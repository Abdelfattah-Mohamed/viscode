import { useState, useEffect } from "react";
import NavBar from "../components/ui/NavBar";
import ThemeToggle from "../components/ui/ThemeToggle";
import { Card } from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useSubscription } from "../hooks/useSubscription";
import {
  createCheckoutSession,
  createUpgradePortalSession,
  cancelSubscription,
  resumeSubscription,
} from "../utils/billingApi";

function formatPrice(cents, interval) {
  if (cents === 0) return "$0";
  const d = (cents / 100).toFixed(2);
  if (interval === "week") return `$${d}/week`;
  if (interval === "month") return `$${d}/month`;
  if (interval === "year") return `$${d}/year`;
  if (interval === "one_time") return `$${d} once`;
  return `$${d}`;
}

const PLAN_ORDER = {
  free: 0,
  pro_weekly: 1,
  pro: 2,
  pro_yearly: 3,
  lifetime: 4,
};

export default function BillingPage({ user, t, themeMode, setThemeMode, onNavigate, onLogout, mobile }) {
  const {
    subscription,
    plan,
    plans,
    loading,
    error,
    refetch,
    isPro,
    planName,
    nextBillingDate,
  } = useSubscription(user);

  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [canceling, setCanceling] = useState(false);
  const [resuming, setResuming] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      setMessage({ type: "success", text: "Thank you! Your subscription is active." });
      refetch();
      window.history.replaceState({}, "", "/billing");
    } else if (params.get("upgraded") === "true") {
      setMessage({ type: "success", text: "Plan update completed." });
      refetch();
      window.history.replaceState({}, "", "/billing");
    } else if (params.get("canceled") === "true") {
      setMessage({ type: "info", text: "Checkout was canceled." });
      window.history.replaceState({}, "", "/billing");
    }
  }, [refetch]);

  const handleUpgrade = async (planId) => {
    if (!user?.email || checkoutPlan) return;
    setCheckoutPlan(planId);
    setMessage(null);
    const canUseHostedUpgrade =
      !!subscription?.stripe_subscription_id &&
      plan?.id !== "lifetime" &&
      planId !== "lifetime";

    if (canUseHostedUpgrade) {
      const portalResult = await createUpgradePortalSession(user.email, plan?.id, planId);
      if (portalResult.error) {
        if (
          portalResult.error.includes("No active recurring subscription found") ||
          portalResult.error.includes("Current plan is not upgradable")
        ) {
          const checkoutFallback = await createCheckoutSession(user.email, planId);
          if (checkoutFallback.error) {
            setCheckoutPlan(null);
            setMessage({ type: "error", text: checkoutFallback.error });
            return;
          }
          if (checkoutFallback.url) {
            window.location.replace(checkoutFallback.url);
            return;
          }
        }
        setCheckoutPlan(null);
        setMessage({ type: "error", text: portalResult.error });
        return;
      }
      if (portalResult.url) {
        window.location.replace(portalResult.url);
        return;
      }
      setCheckoutPlan(null);
      setMessage({ type: "error", text: "No Stripe upgrade URL received. Please try again." });
      return;
    }

    const result = await createCheckoutSession(user.email, planId);
    if (result.error) {
      setCheckoutPlan(null);
      setMessage({ type: "error", text: result.error });
      return;
    }
    if (result.url) {
      window.location.replace(result.url);
      return;
    }
    setCheckoutPlan(null);
    setMessage({ type: "error", text: "No checkout URL received. Please try again." });
  };

  const handleCancel = async () => {
    if (!user?.email || canceling || resuming) return;
    const ok = window.confirm("Cancel your subscription at period end?");
    if (!ok) return;
    setCanceling(true);
    setMessage(null);
    const result = await cancelSubscription(user.email);
    setCanceling(false);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
      return;
    }
    setMessage({ type: "success", text: "Your subscription will cancel at the end of the current period." });
    refetch();
  };

  const handleResume = async () => {
    if (!user?.email || resuming || canceling) return;
    setResuming(true);
    setMessage(null);
    const result = await resumeSubscription(user.email);
    setResuming(false);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
      return;
    }
    setMessage({ type: "success", text: "Cancellation removed. Your subscription will renew normally." });
    refetch();
  };

  const paidPlans = plans.filter((p) => p.id !== "free");
  const currentPlanRank = PLAN_ORDER[plan?.id] ?? 0;
  const upgradePlans = paidPlans.filter((p) => (PLAN_ORDER[p.id] ?? 0) > currentPlanRank);
  const isGuest = !user || user.isGuest;

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: t.bg, color: t.ink, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-thumb{background:${t.border};border-radius:3px}`}</style>

      <NavBar
        page="billing"
        onNavigate={onNavigate}
        t={t}
        themeMode={themeMode}
        mobile={mobile}
        right={
          <div style={{ display: "flex", alignItems: "center", gap: mobile ? 8 : 12 }}>
            {!mobile && <ThemeToggle mode={themeMode} setMode={setThemeMode} t={t} />}
            {!mobile && <div style={{ width: 1, height: 28, background: t.border, opacity: 0.3 }} />}
            <Button
              t={t}
              variant="ghost"
              onClick={onLogout}
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "0.9rem",
                fontWeight: 600,
                padding: "6px 14px",
                borderWidth: 2,
                borderColor: t.red,
                borderRadius: 8,
                color: t.red,
              }}
            >
              Sign out
            </Button>
          </div>
        }
      />

      <div style={{ flex: 1, maxWidth: 560, margin: "0 auto", padding: "32px 24px 60px", width: "100%" }}>
        <h1 style={{ fontFamily: "'Caveat',cursive", fontSize: "1.8rem", fontWeight: 700, color: t.ink, marginBottom: 8 }}>
          Billing & subscription
        </h1>
        <p style={{ margin: 0, fontSize: "0.9rem", color: t.inkMuted, marginBottom: 24 }}>
          Manage your plan and billing.
        </p>

        {message && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              marginBottom: 20,
              background:
                message.type === "success"
                  ? t.green + "22"
                  : message.type === "error"
                    ? t.red + "22"
                    : t.surfaceAlt,
              border: `1px solid ${message.type === "error" ? t.red : t.border}`,
              color: message.type === "error" ? t.red : t.ink,
              fontSize: "0.9rem",
            }}
          >
            {message.text}
          </div>
        )}

        {isGuest ? (
          <Card t={t}>
            <p style={{ margin: 0, padding: 20, color: t.inkMuted, textAlign: "center" }}>
              Sign in with your account to view and manage your subscription.
            </p>
          </Card>
        ) : loading ? (
          <Card t={t}>
            <p style={{ margin: 0, padding: 24, color: t.inkMuted, textAlign: "center" }}>Loading…</p>
          </Card>
        ) : error ? (
          <Card t={t}>
            <p style={{ margin: 0, padding: 24, color: t.red, textAlign: "center" }}>{error}</p>
          </Card>
        ) : (
          <>
            <Card t={t} style={{ marginBottom: 24, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: `1.5px solid ${t.border}`, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "1.2rem" }}>📋</span>
                <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1.2rem", fontWeight: 700, color: t.ink }}>
                  Current plan
                </span>
              </div>
              <div style={{ padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1.35rem", fontWeight: 700, color: t.ink }}>{planName}</div>
                    <div style={{ fontSize: "0.85rem", color: t.inkMuted, marginTop: 4 }}>
                      {plan && formatPrice(plan.amount_cents, plan.interval)}
                      {subscription?.status && (
                        <span style={{ marginLeft: 8, textTransform: "capitalize" }}>· {subscription.status}</span>
                      )}
                    </div>
                    {nextBillingDate && isPro && (
                      <div style={{ fontSize: "0.84rem", color: t.inkMuted, marginTop: 4 }}>
                        Next billing date: {nextBillingDate}
                        {subscription?.cancel_at_period_end && " (canceled at period end)"}
                      </div>
                    )}
                  </div>
                  {isPro && (
                    <span
                      style={{
                        fontFamily: "'Caveat',cursive",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        padding: "4px 12px",
                        borderRadius: 20,
                        background: t.green + "2b",
                        color: t.green,
                        border: `1px solid ${t.green}`,
                      }}
                    >
                      Pro
                    </span>
                  )}
                </div>
                {plan?.features && Array.isArray(plan.features) && plan.features.length > 0 && (
                  <ul style={{ margin: "16px 0 0", paddingLeft: 20, fontSize: "0.88rem", color: t.inkMuted, lineHeight: 1.6 }}>
                    {plan.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                )}
                {!!subscription?.stripe_subscription_id && plan?.id !== "lifetime" && (
                  <div style={{ marginTop: 14 }}>
                    {subscription?.cancel_at_period_end ? (
                      <Button
                        t={t}
                        variant="ghost"
                        onClick={handleResume}
                        disabled={resuming || canceling}
                        style={{
                          fontFamily: "'Caveat',cursive",
                          fontSize: "0.83rem",
                          fontWeight: 700,
                          borderRadius: 8,
                          borderColor: t.blue,
                          color: t.blue,
                          cursor: resuming || canceling ? "not-allowed" : "pointer",
                          opacity: resuming || canceling ? 0.6 : 1,
                        }}
                      >
                        {resuming ? "Resuming..." : "Undo cancellation"}
                      </Button>
                    ) : (
                      <Button
                        t={t}
                        variant="ghost"
                        onClick={handleCancel}
                        disabled={canceling || resuming}
                        style={{
                          fontFamily: "'Caveat',cursive",
                          fontSize: "0.83rem",
                          fontWeight: 700,
                          borderRadius: 8,
                          borderColor: t.red,
                          color: t.red,
                          cursor: canceling || resuming ? "not-allowed" : "pointer",
                          opacity: canceling || resuming ? 0.6 : 1,
                        }}
                      >
                        {canceling ? "Canceling..." : "Cancel subscription"}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {upgradePlans.length > 0 && (
              <Card t={t} style={{ overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: `1.5px solid ${t.border}`, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "1.2rem" }}>⬆️</span>
                  <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1.2rem", fontWeight: 700, color: t.ink }}>
                    Upgrade
                  </span>
                </div>
                <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
                  {upgradePlans.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        padding: "16px 18px",
                        background: t.surfaceAlt,
                        borderRadius: 10,
                        border: `1.5px solid ${t.border}`,
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                        <div>
                          <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1.15rem", fontWeight: 700, color: t.ink }}>{p.name}</div>
                          {p.description && (
                            <div style={{ fontSize: "0.86rem", color: t.inkMuted, marginTop: 2 }}>{p.description}</div>
                          )}
                        </div>
                        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "1rem", fontWeight: 700, color: t.ink }}>
                          {formatPrice(p.amount_cents, p.interval)}
                        </div>
                      </div>
                      {p.features && Array.isArray(p.features) && p.features.length > 0 && (
                        <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.84rem", color: t.inkMuted, lineHeight: 1.5 }}>
                          {p.features.slice(0, 4).map((f, i) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      )}
                      <Button
                        t={t}
                        variant="secondary"
                        onClick={() => handleUpgrade(p.id)}
                        disabled={!!checkoutPlan}
                        style={{
                          fontSize: "1rem",
                          fontWeight: 700,
                          borderRadius: 8,
                          background: t.blue,
                          color: "#fff",
                          cursor: checkoutPlan ? "wait" : "pointer",
                          opacity: checkoutPlan ? 0.8 : 1,
                          alignSelf: "flex-start",
                          boxShadow: t.shadowSm,
                        }}
                      >
                        {checkoutPlan === p.id ? "Redirecting…" : `Upgrade to ${p.name}`}
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            {plan?.id === "lifetime" && (
              <p style={{ margin: "12px 2px 0", fontSize: "0.9rem", color: t.inkMuted }}>
                You're on the highest plan.
              </p>
            )}

        <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Button
            t={t}
            variant="secondary"
            onClick={() => onNavigate("profile")}
            style={{
              fontSize: "1.05rem",
              fontWeight: 700,
              borderRadius: 8,
              boxShadow: t.shadowSm,
            }}
          >
            ← Profile
          </Button>
          <Button
            t={t}
            variant="secondary"
            onClick={() => onNavigate("home")}
            style={{
              fontSize: "1.05rem",
              fontWeight: 700,
              borderRadius: 8,
              boxShadow: t.shadowSm,
            }}
          >
            Home
          </Button>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
