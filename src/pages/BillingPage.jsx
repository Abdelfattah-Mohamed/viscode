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

const ORIGINAL_DISCOUNT_PRICES = {
  pro: 689,
  pro_yearly: 4788,
};

function PriceWithDiscount({ plan, t }) {
  const originalCents = ORIGINAL_DISCOUNT_PRICES[plan?.id];
  if (!plan) return null;
  if (!originalCents) return <>{formatPrice(plan.amount_cents, plan.interval)}</>;
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
      <span style={{ textDecoration: "line-through", color: t.inkMuted, fontSize: "0.82em" }}>
        ${(originalCents / 100).toFixed(2)}
      </span>
      <span>{formatPrice(plan.amount_cents, plan.interval)}</span>
    </span>
  );
}

const PLAN_ORDER = {
  free: 0,
  pro_weekly: 1,
  pro: 2,
  pro_yearly: 3,
  lifetime: 4,
};

const SUBSCRIPTION_BENEFITS = [
  {
    title: "Unlock the full problem library",
    text: "Practice arrays, trees, graphs, dynamic programming, sliding window, stacks, linked lists, and more beyond the free Famous Algorithms set.",
  },
  {
    title: "Learn with synced code + visuals",
    text: "Every step highlights the matching code line while the whiteboard shows how data changes, so users understand why the algorithm works.",
  },
  {
    title: "Practice with custom inputs",
    text: "Edit arrays, matrices, trees, graphs, strings, and weighted edges with guided input tools and live previews.",
  },
  {
    title: "Build a personal study flow",
    text: "Keep favorites, flagged problems, profile progress, and notes in one place for focused interview preparation.",
  },
];

const TRUST_POINTS = [
  "Secure hosted checkout",
  "Cancel recurring plans anytime",
  "Instant access after payment",
];

const PLAN_BADGES = {
  pro: "Popular",
  pro_yearly: "Best value",
  lifetime: "Pay once",
};

const PLAN_VALUE_NOTES = {
  pro_weekly: "Low commitment. Great when you only need a short practice sprint.",
  pro: "A balanced plan for consistent weekly practice and interview preparation.",
  pro_yearly: "Save compared with monthly billing and keep access for the full year.",
  lifetime: "Best long-term option if you want permanent access with no renewals.",
};

const BILLING_FAQS = [
  {
    question: "What stays free?",
    answer: "The Famous Algorithms category remains available on the free plan so learners can try the core experience first.",
  },
  {
    question: "What happens after upgrading?",
    answer: "After checkout, your account updates to Pro and premium problems become available.",
  },
  {
    question: "Can users cancel?",
    answer: "Recurring subscriptions can be canceled at period end. Access remains active until the paid period finishes.",
  },
];

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
      window.history.replaceState({}, "", "/billing");
    } else if (params.get("upgraded") === "true") {
      setMessage({ type: "success", text: "Plan update completed." });
      window.history.replaceState({}, "", "/billing");
    } else if (params.get("canceled") === "true") {
      setMessage({ type: "info", text: "Checkout was canceled." });
      window.history.replaceState({}, "", "/billing");
    }
  }, []);

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
      setMessage({ type: "error", text: "No upgrade URL received. Please try again." });
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
  const messageTone = message?.type === "error" ? "error" : message?.type === "success" ? "success" : "info";
  const messageBg = messageTone === "error" ? t.red + "14" : messageTone === "success" ? t.green + "14" : t.surfaceAlt;
  const messageBorder = messageTone === "error" ? t.red : messageTone === "success" ? t.green : t.border;
  const messageIcon = messageTone === "error" ? "⚠" : messageTone === "success" ? "✓" : "i";

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

      <div style={{ flex: 1, maxWidth: 1040, margin: "0 auto", padding: mobile ? "24px 16px 48px" : "36px 24px 64px", width: "100%" }}>
        <Card
          t={t}
          style={{
            marginBottom: 24,
            padding: mobile ? "24px 20px" : "30px 34px",
            background: `linear-gradient(135deg, ${t.surface} 0%, ${t.surfaceAlt} 100%)`,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.45fr 0.9fr", gap: mobile ? 22 : 34, alignItems: "center" }}>
            <div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 11px", borderRadius: 999, background: t.yellow + "33", border: `1.5px solid ${t.yellow}`, color: t.ink, fontSize: "0.82rem", fontWeight: 800 }}>
                Pro learning workspace
              </span>
              <h1 style={{ fontFamily: "'Caveat',cursive", fontSize: mobile ? "2.2rem" : "2.8rem", lineHeight: 1, fontWeight: 700, color: t.ink, margin: "16px 0 10px" }}>
                Upgrade from watching algorithms to mastering them.
              </h1>
              <p style={{ margin: 0, fontSize: "1rem", color: t.inkMuted, lineHeight: 1.65, maxWidth: 620 }}>
                Pro unlocks the full VisCode problem library, richer visualizations, custom inputs, and a cleaner study flow for interview preparation.
              </p>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {TRUST_POINTS.map((point) => (
                <div key={point} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", borderRadius: 12, background: t.bg, border: `1.5px solid ${t.border}`, color: t.ink, fontSize: "0.9rem", fontWeight: 700 }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", background: t.green + "22", color: t.green, border: `1px solid ${t.green}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem" }}>✓</span>
                  {point}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {message && (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 8,
              marginBottom: 24,
              background: messageBg,
              border: `1.5px solid ${messageBorder}`,
              color: messageTone === "error" ? t.red : t.ink,
              fontSize: "0.88rem",
              display: "flex",
              alignItems: "center",
              gap: 10,
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 20, height: 20, borderRadius: "50%", border: `1.5px solid ${messageBorder}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 700 }}>
                {messageIcon}
              </span>
              <span>{message.text}</span>
            </div>
            {messageTone === "error" && (
              <Button t={t} variant="ghost" size="sm" onClick={refetch} style={{ borderColor: t.red, color: t.red }}>
                Retry
              </Button>
            )}
          </div>
        )}

        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
            <div>
              <h2 style={{ fontFamily: "'Caveat',cursive", fontSize: "1.65rem", margin: 0, color: t.ink }}>
                What Pro unlocks
              </h2>
              <p style={{ margin: "4px 0 0", color: t.inkMuted, fontSize: "0.92rem", lineHeight: 1.5 }}>
                Clear value for learners before they subscribe.
              </p>
            </div>
            <span style={{ fontSize: "0.82rem", color: t.inkMuted, border: `1px solid ${t.border}`, borderRadius: 999, padding: "5px 10px", background: t.surface }}>
              Famous Algorithms stay free
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(4, minmax(0, 1fr))", gap: 14 }}>
            {SUBSCRIPTION_BENEFITS.map((benefit, index) => (
              <Card key={benefit.title} t={t} density="compact" style={{ padding: "16px 15px", boxShadow: t.shadowSm }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: [t.blue, t.green, t.yellow, t.red][index] + "22", border: `1.5px solid ${[t.blue, t.green, t.yellow, t.red][index]}66`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, marginBottom: 10 }}>
                  {index + 1}
                </div>
                <h3 style={{ margin: "0 0 7px", color: t.ink, fontSize: "0.98rem", lineHeight: 1.25 }}>
                  {benefit.title}
                </h3>
                <p style={{ margin: 0, color: t.inkMuted, fontSize: "0.84rem", lineHeight: 1.55 }}>
                  {benefit.text}
                </p>
              </Card>
            ))}
          </div>
        </div>

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
              <div style={{ padding: "16px 20px", borderBottom: `1.5px solid ${t.border}`, display: "flex", alignItems: "center", gap: 8, background: t.surfaceAlt }}>
                <span style={{ fontSize: "1.2rem" }}>📋</span>
                <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1.2rem", fontWeight: 700, color: t.ink }}>
                  Your subscription
                </span>
              </div>
              <div style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1.35rem", fontWeight: 700, color: t.ink }}>{planName}</div>
                    <div style={{ fontSize: "0.85rem", color: t.inkMuted, marginTop: 4 }}>
                      {plan && <PriceWithDiscount plan={plan} t={t} />}
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
                    {subscription?.cancel_at_period_end && (
                      <div style={{ marginTop: 8, fontSize: "0.83rem", color: t.red, background: t.red + "14", border: `1px solid ${t.red}66`, borderRadius: 8, padding: "6px 8px", display: "inline-block" }}>
                        Cancelation pending. Access remains active until period end.
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
                <div style={{ marginTop: 18, padding: "14px 15px", borderRadius: 12, background: t.surfaceAlt, border: `1.25px solid ${t.border}` }}>
                  <div style={{ fontSize: "0.86rem", fontWeight: 800, color: t.ink, marginBottom: 8 }}>
                    Included in your current plan
                  </div>
                  {plan?.features && Array.isArray(plan.features) && plan.features.length > 0 ? (
                    <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: "8px 14px" }}>
                      {plan.features.map((f, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: "0.86rem", color: t.inkMuted, lineHeight: 1.45 }}>
                          <span style={{ color: t.green, fontWeight: 900 }}>✓</span>
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: "0.86rem", color: t.inkMuted }}>Plan details are loading.</p>
                  )}
                </div>
                {!!subscription?.stripe_subscription_id && plan?.id !== "lifetime" && (
                  <div style={{ marginTop: 16 }}>
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
                <div style={{ padding: "18px 20px", borderBottom: `1.5px solid ${t.border}`, display: "flex", alignItems: mobile ? "flex-start" : "center", justifyContent: "space-between", gap: 12, flexDirection: mobile ? "column" : "row", background: t.surfaceAlt }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: "1.2rem" }}>⬆️</span>
                    <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1.3rem", fontWeight: 700, color: t.ink }}>
                      Choose your Pro plan
                    </span>
                  </div>
                  <span style={{ fontSize: "0.84rem", color: t.inkMuted }}>
                    All paid plans unlock the full VisCode learning experience.
                  </span>
                </div>
                <div style={{ padding: "18px 20px", display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: 16 }}>
                  {upgradePlans.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        padding: "18px",
                        background: t.surfaceAlt,
                        borderRadius: 14,
                        border: `1.75px solid ${PLAN_BADGES[p.id] ? t.blue : t.border}`,
                        display: "flex",
                        flexDirection: "column",
                        gap: 14,
                        position: "relative",
                        boxShadow: PLAN_BADGES[p.id] ? t.shadowSm : "none",
                      }}
                    >
                      {PLAN_BADGES[p.id] && (
                        <span style={{ position: "absolute", top: 14, right: 14, padding: "4px 9px", borderRadius: 999, background: t.blue + "18", color: t.blue, border: `1px solid ${t.blue}66`, fontSize: "0.76rem", fontWeight: 800 }}>
                          {PLAN_BADGES[p.id]}
                        </span>
                      )}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                        <div style={{ paddingRight: PLAN_BADGES[p.id] ? 86 : 0 }}>
                          <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1.15rem", fontWeight: 700, color: t.ink }}>{p.name}</div>
                          {p.description && (
                            <div style={{ fontSize: "0.86rem", color: t.inkMuted, marginTop: 2 }}>{p.description}</div>
                          )}
                        </div>
                        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "1.05rem", fontWeight: 800, color: t.ink }}>
                          <PriceWithDiscount plan={p} t={t} />
                        </div>
                      </div>
                      {PLAN_VALUE_NOTES[p.id] && (
                        <p style={{ margin: 0, color: t.inkMuted, fontSize: "0.84rem", lineHeight: 1.5 }}>
                          {PLAN_VALUE_NOTES[p.id]}
                        </p>
                      )}
                      {p.features && Array.isArray(p.features) && p.features.length > 0 && (
                        <div style={{ display: "grid", gap: 7 }}>
                          {p.features.slice(0, 4).map((f, i) => (
                            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: "0.84rem", color: t.inkMuted, lineHeight: 1.45 }}>
                              <span style={{ color: t.green, fontWeight: 900 }}>✓</span>
                              <span>{f}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <Button
                        t={t}
                        variant={PLAN_BADGES[p.id] ? "primary" : "secondary"}
                        onClick={() => handleUpgrade(p.id)}
                        disabled={!!checkoutPlan}
                        style={{
                          fontSize: "1rem",
                          fontWeight: 700,
                          borderRadius: 8,
                          cursor: checkoutPlan ? "wait" : "pointer",
                          opacity: checkoutPlan ? 0.8 : 1,
                          alignSelf: "stretch",
                          boxShadow: t.shadowSm,
                          marginTop: "auto",
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

            <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 16 }}>
              <Card t={t} density="compact" style={{ padding: 18, boxShadow: t.shadowSm, background: t.surfaceAlt }}>
                <h3 style={{ margin: "0 0 8px", fontFamily: "'Caveat',cursive", fontSize: "1.25rem", color: t.ink }}>
                  Why learners upgrade
                </h3>
                <p style={{ margin: 0, color: t.inkMuted, fontSize: "0.88rem", lineHeight: 1.6 }}>
                  Free users can explore algorithm visuals. Pro users get the complete practice workspace: more problem types, richer examples, custom input tooling, and a smoother path from concept to interview-ready understanding.
                </p>
              </Card>
              <Card t={t} density="compact" style={{ padding: 18, boxShadow: t.shadowSm }}>
                <h3 style={{ margin: "0 0 8px", fontFamily: "'Caveat',cursive", fontSize: "1.25rem", color: t.ink }}>
                  Secure hosted billing
                </h3>
                <p style={{ margin: 0, color: t.inkMuted, fontSize: "0.88rem", lineHeight: 1.6 }}>
                  Payment details are handled through a secure hosted checkout. VisCode stores subscription status only, so users can upgrade, cancel, or resume recurring access without exposing card details in the app.
                </p>
              </Card>
            </div>

            <Card t={t} style={{ marginTop: 24, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: `1.5px solid ${t.border}`, background: t.surfaceAlt }}>
                <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1.25rem", fontWeight: 700, color: t.ink }}>
                  Common billing questions
                </div>
              </div>
              <div style={{ padding: "18px 20px", display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: 14 }}>
                {BILLING_FAQS.map((item) => (
                  <div key={item.question} style={{ padding: "14px 13px", borderRadius: 12, border: `1.25px solid ${t.border}`, background: t.surfaceAlt }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: 800, color: t.ink, marginBottom: 6 }}>
                      {item.question}
                    </div>
                    <p style={{ margin: 0, color: t.inkMuted, fontSize: "0.83rem", lineHeight: 1.55 }}>
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
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
