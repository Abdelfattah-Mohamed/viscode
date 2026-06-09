import { useState, useEffect } from "react";
import NavBar from "../components/ui/NavBar";
import ThemeToggle from "../components/ui/ThemeToggle";
import { Card } from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useSubscription } from "../hooks/useSubscription";
import { BILLING_PLAN_CATALOG } from "../data/billingPlans";
import {
  createCheckoutSession,
  createUpgradePortalSession,
  cancelSubscription,
  resumeSubscription,
} from "../utils/billingApi";
import { trackEvent } from "../utils/analytics";

function formatPrice(cents, interval) {
  if (cents === 0) return "$0";
  const d = (cents / 100).toFixed(2);
  if (interval === "week") return `$${d}`;
  if (interval === "month") return `$${d}`;
  if (interval === "year") return `$${d}`;
  if (interval === "one_time") return `$${d}`;
  return `$${d}`;
}

function intervalSuffix(interval) {
  if (interval === "week") return "/week";
  if (interval === "month") return "/month";
  if (interval === "year") return "/year";
  if (interval === "one_time") return "one-time";
  return "";
}

const ORIGINAL_DISCOUNT_PRICES = {
  pro: 689,
  pro_yearly: 4788,
};

function PriceTag({ plan, t }) {
  if (!plan) return null;
  const originalCents = ORIGINAL_DISCOUNT_PRICES[plan.id];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Always reserve the strikethrough line so prices align across cards */}
      <span style={{ textDecoration: "line-through", color: t.inkMuted, fontSize: "0.95rem", lineHeight: 1.2, visibility: originalCents ? "visible" : "hidden" }}>
        ${((originalCents || plan.amount_cents) / 100).toFixed(2)}
      </span>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "2.2rem", fontWeight: 800, color: t.ink, lineHeight: 1 }}>
          {formatPrice(plan.amount_cents, plan.interval)}
        </span>
        <span style={{ fontSize: "0.82rem", color: t.inkMuted, fontWeight: 700 }}>
          {intervalSuffix(plan.interval)}
        </span>
      </div>
    </div>
  );
}

const PLAN_ORDER = {
  free: 0,
  pro_weekly: 1,
  pro: 2,
  pro_yearly: 3,
  lifetime: 4,
};

const PLAN_BADGES = {
  pro: "Most popular",
  pro_yearly: "Best value",
  lifetime: "Pay once",
};

const PLAN_SUBTITLE = {
  pro_weekly: "Flexible short-term access.",
  pro: "Best for steady weekly practice.",
  pro_yearly: "Save vs. monthly billing.",
  lifetime: "One payment, forever access.",
};

const PLAN_RENEW_NOTE = {
  pro_weekly: "Renews weekly · cancel anytime",
  pro: "Renews monthly · cancel anytime",
  pro_yearly: "Renews yearly · cancel anytime",
  lifetime: "Does not auto-renew",
};

const BILLING_FAQS = [
  {
    question: "What stays free?",
    answer: "The Famous Algorithms category is always free, so you can try the core experience before subscribing.",
  },
  {
    question: "What happens after I upgrade?",
    answer: "After secure checkout your account becomes Pro instantly and every premium problem unlocks.",
  },
  {
    question: "Can I cancel?",
    answer: "Yes. Recurring plans can be canceled at period end and stay active until the paid period finishes.",
  },
  {
    question: "How does renewal work?",
    answer: "Weekly, monthly, and yearly plans renew automatically. Lifetime is a one-time payment that never renews.",
  },
  {
    question: "Is there a trial?",
    answer: "New monthly and yearly subscriptions include a 7-day Pro trial. If billing fails there is a 3-day grace period.",
  },
  {
    question: "Is checkout secure?",
    answer: "Payments run through a secure hosted checkout. VisCode stores only your subscription status, never card details.",
  },
];

export default function BillingPage({ user, t, themeMode, setThemeMode, onNavigate, onLogout, mobile, learning }) {
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
      trackEvent("checkout_succeeded", { source: "query_success" });
      setMessage({ type: "success", text: "Thank you! Your subscription is active." });
      window.history.replaceState({}, "", "/billing");
    } else if (params.get("upgraded") === "true") {
      trackEvent("checkout_succeeded", { source: "query_upgraded" });
      setMessage({ type: "success", text: "Plan update completed." });
      window.history.replaceState({}, "", "/billing");
    } else if (params.get("canceled") === "true") {
      trackEvent("checkout_canceled", { source: "query_canceled" });
      setMessage({ type: "info", text: "Checkout was canceled." });
      window.history.replaceState({}, "", "/billing");
    }
  }, []);

  const handleUpgrade = async (planId) => {
    if (!user?.email || checkoutPlan) return;
    trackEvent("checkout_started", { currentPlanId: plan?.id || "free", targetPlanId: planId });
    setCheckoutPlan(planId);
    setMessage(null);
    const canUseHostedUpgrade =
      !!subscription?.stripe_subscription_id &&
      plan?.id !== "lifetime" &&
      planId !== "lifetime";

    if (canUseHostedUpgrade) {
      const portalResult = await createUpgradePortalSession(user.email, plan?.id, planId);
      if (portalResult.error) {
        trackEvent("checkout_failed", { currentPlanId: plan?.id || "free", targetPlanId: planId, reason: portalResult.error });
        if (
          portalResult.error.includes("No active recurring subscription found") ||
          portalResult.error.includes("Current plan is not upgradable")
        ) {
          const checkoutFallback = await createCheckoutSession(user.email, planId);
          if (checkoutFallback.error) {
            trackEvent("checkout_failed", { currentPlanId: plan?.id || "free", targetPlanId: planId, reason: checkoutFallback.error });
            setCheckoutPlan(null);
            setMessage({ type: "error", text: checkoutFallback.error });
            return;
          }
          if (checkoutFallback.url) {
            trackEvent("checkout_redirected", { currentPlanId: plan?.id || "free", targetPlanId: planId, flow: "fallback_checkout" });
            window.location.replace(checkoutFallback.url);
            return;
          }
        }
        setCheckoutPlan(null);
        setMessage({ type: "error", text: portalResult.error });
        return;
      }
      if (portalResult.url) {
        trackEvent("checkout_redirected", { currentPlanId: plan?.id || "free", targetPlanId: planId, flow: "portal_upgrade" });
        window.location.replace(portalResult.url);
        return;
      }
      setCheckoutPlan(null);
      setMessage({ type: "error", text: "No upgrade URL received. Please try again." });
      return;
    }

    const result = await createCheckoutSession(user.email, planId);
    if (result.error) {
      trackEvent("checkout_failed", { currentPlanId: plan?.id || "free", targetPlanId: planId, reason: result.error });
      setCheckoutPlan(null);
      setMessage({ type: "error", text: result.error });
      return;
    }
    if (result.url) {
      trackEvent("checkout_redirected", { currentPlanId: plan?.id || "free", targetPlanId: planId, flow: "new_checkout" });
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
    trackEvent("subscription_cancel_started", { currentPlanId: plan?.id || "unknown" });
    setCanceling(true);
    setMessage(null);
    const result = await cancelSubscription(user.email);
    setCanceling(false);
    if (result.error) {
      trackEvent("subscription_cancel_failed", { currentPlanId: plan?.id || "unknown", reason: result.error });
      setMessage({ type: "error", text: result.error });
      return;
    }
    trackEvent("subscription_cancel_succeeded", { currentPlanId: plan?.id || "unknown" });
    setMessage({ type: "success", text: "Your subscription will cancel at the end of the current period." });
    refetch();
  };

  const handleResume = async () => {
    if (!user?.email || resuming || canceling) return;
    trackEvent("subscription_resume_started", { currentPlanId: plan?.id || "unknown" });
    setResuming(true);
    setMessage(null);
    const result = await resumeSubscription(user.email);
    setResuming(false);
    if (result.error) {
      trackEvent("subscription_resume_failed", { currentPlanId: plan?.id || "unknown", reason: result.error });
      setMessage({ type: "error", text: result.error });
      return;
    }
    trackEvent("subscription_resume_succeeded", { currentPlanId: plan?.id || "unknown" });
    setMessage({ type: "success", text: "Cancellation removed. Your subscription will renew normally." });
    refetch();
  };

  const isGuest = !user || user.isGuest;
  // Guests have no plans loaded from the hook — fall back to the local catalog so pricing is always visible.
  const planSource = plans.length ? plans : BILLING_PLAN_CATALOG;
  const currentPlanRank = PLAN_ORDER[plan?.id] ?? 0;
  // Show the current paid tier plus any upgrades (downgrades aren't supported here).
  const visiblePlans = planSource
    .filter((p) => p.id !== "free" && (PLAN_ORDER[p.id] ?? 0) >= currentPlanRank)
    .sort((a, b) => (PLAN_ORDER[a.id] ?? 0) - (PLAN_ORDER[b.id] ?? 0));

  const messageTone = message?.type === "error" ? "error" : message?.type === "success" ? "success" : "info";
  const messageBg = messageTone === "error" ? t.red + "14" : messageTone === "success" ? t.green + "14" : t.surfaceAlt;
  const messageBorder = messageTone === "error" ? t.red : messageTone === "success" ? t.green : t.border;
  const messageIcon = messageTone === "error" ? "⚠" : messageTone === "success" ? "✓" : "i";

  const cardColumns = mobile ? "1fr" : `repeat(${Math.min(visiblePlans.length || 1, 4)}, minmax(0, 1fr))`;

  const renderPlanButton = (p) => {
    const rank = PLAN_ORDER[p.id] ?? 0;
    if (isGuest) {
      return (
        <Button
          t={t}
          variant={PLAN_BADGES[p.id] === "Most popular" ? "primary" : "secondary"}
          onClick={() => onNavigate("home")}
          style={{ fontSize: "0.95rem", fontWeight: 700, borderRadius: 10, alignSelf: "stretch", marginTop: "auto", boxShadow: t.shadowSm }}
        >
          Sign in to subscribe
        </Button>
      );
    }
    if (rank === currentPlanRank) {
      return (
        <Button
          t={t}
          variant="secondary"
          disabled
          style={{ fontSize: "0.95rem", fontWeight: 700, borderRadius: 10, alignSelf: "stretch", marginTop: "auto", opacity: 0.7, cursor: "default" }}
        >
          Current plan
        </Button>
      );
    }
    return (
      <Button
        t={t}
        variant={PLAN_BADGES[p.id] === "Most popular" ? "primary" : "secondary"}
        onClick={() => handleUpgrade(p.id)}
        disabled={!!checkoutPlan}
        style={{
          fontSize: "0.95rem",
          fontWeight: 700,
          borderRadius: 10,
          alignSelf: "stretch",
          marginTop: "auto",
          boxShadow: t.shadowSm,
          cursor: checkoutPlan ? "wait" : "pointer",
          opacity: checkoutPlan ? 0.8 : 1,
        }}
      >
        {checkoutPlan === p.id ? "Redirecting…" : currentPlanRank === 0 ? `Get ${p.name}` : `Upgrade to ${p.name}`}
      </Button>
    );
  };

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

      <div style={{ flex: 1, maxWidth: 1040, margin: "0 auto", padding: mobile ? "24px 16px 48px" : "44px 24px 64px", width: "100%" }}>
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

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: mobile ? 28 : 40 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 12px", borderRadius: 999, background: t.yellow + "2b", border: `1.5px solid ${t.yellow}`, color: t.ink, fontSize: "0.8rem", fontWeight: 800 }}>
            Limited-time pricing
          </span>
          <h1 style={{ fontFamily: "'Caveat',cursive", fontSize: mobile ? "2.4rem" : "3.1rem", lineHeight: 1.05, fontWeight: 700, color: t.ink, margin: "14px 0 10px" }}>
            Simple, transparent pricing.
          </h1>
          <p style={{ margin: "0 auto", maxWidth: 560, fontSize: "1rem", color: t.inkMuted, lineHeight: 1.6 }}>
            Unlock the full VisCode problem library, richer visualizations, and custom inputs. Famous Algorithms stay free forever.
          </p>
          <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: mobile ? 8 : 18, justifyContent: "center", fontSize: "0.84rem", color: t.inkMuted, fontWeight: 600 }}>
            {["Secure hosted checkout", "Cancel recurring plans anytime", "Instant access after payment"].map((point) => (
              <span key={point} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: t.green, fontWeight: 900 }}>✓</span> {point}
              </span>
            ))}
          </div>
        </div>

        {/* Current subscription / manage bar */}
        {!isGuest && !loading && !error && plan && (
          <Card t={t} style={{ marginBottom: 24, padding: mobile ? "14px 16px" : "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "'Caveat',cursive", fontSize: "1.3rem", fontWeight: 700, color: t.ink }}>
                    Current plan: {planName}
                  </span>
                  {isPro && (
                    <span style={{ fontSize: "0.74rem", fontWeight: 800, padding: "3px 10px", borderRadius: 20, background: t.green + "2b", color: t.green, border: `1px solid ${t.green}` }}>
                      Pro
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "0.84rem", color: t.inkMuted, marginTop: 4 }}>
                  {nextBillingDate && isPro
                    ? `Next billing date: ${nextBillingDate}${subscription?.cancel_at_period_end ? " (cancels at period end)" : ""}`
                    : isPro
                      ? "Active"
                      : "You're on the free plan — upgrade below to unlock everything."}
                </div>
              </div>
              {!!subscription?.stripe_subscription_id && plan?.id !== "lifetime" && (
                subscription?.cancel_at_period_end ? (
                  <Button
                    t={t}
                    variant="ghost"
                    onClick={handleResume}
                    disabled={resuming || canceling}
                    style={{ fontSize: "0.85rem", fontWeight: 700, borderRadius: 8, borderColor: t.blue, color: t.blue, opacity: resuming || canceling ? 0.6 : 1 }}
                  >
                    {resuming ? "Resuming…" : "Undo cancellation"}
                  </Button>
                ) : (
                  <Button
                    t={t}
                    variant="ghost"
                    onClick={handleCancel}
                    disabled={canceling || resuming}
                    style={{ fontSize: "0.85rem", fontWeight: 700, borderRadius: 8, borderColor: t.red, color: t.red, opacity: canceling || resuming ? 0.6 : 1 }}
                  >
                    {canceling ? "Canceling…" : "Cancel subscription"}
                  </Button>
                )
              )}
            </div>
            {subscription?.cancel_at_period_end && (
              <div style={{ marginTop: 10, fontSize: "0.82rem", color: t.red, background: t.red + "14", border: `1px solid ${t.red}66`, borderRadius: 8, padding: "6px 10px", display: "inline-block" }}>
                Cancellation pending. Access remains active until period end.
              </div>
            )}
          </Card>
        )}

        {/* Pricing cards */}
        {loading ? (
          <Card t={t}><p style={{ margin: 0, padding: 24, color: t.inkMuted, textAlign: "center" }}>Loading…</p></Card>
        ) : error ? (
          <Card t={t}><p style={{ margin: 0, padding: 24, color: t.red, textAlign: "center" }}>{error}</p></Card>
        ) : plan?.id === "lifetime" ? (
          <Card t={t} style={{ padding: 24, textAlign: "center" }}>
            <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1.5rem", fontWeight: 700, color: t.ink }}>
              You're on the Lifetime plan 🎉
            </div>
            <p style={{ margin: "6px 0 0", color: t.inkMuted, fontSize: "0.9rem" }}>
              You have permanent access to everything, including all future problems.
            </p>
          </Card>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: cardColumns, gap: 16, alignItems: "stretch" }}>
            {visiblePlans.map((p) => {
              const highlighted = PLAN_BADGES[p.id] === "Most popular";
              return (
                <div
                  key={p.id}
                  style={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    padding: "22px 18px",
                    borderRadius: 16,
                    background: highlighted ? t.surface : t.surfaceAlt,
                    border: `${highlighted ? 2.25 : 1.5}px solid ${highlighted ? t.blue : t.border}`,
                    boxShadow: highlighted ? t.shadow : t.shadowSm,
                  }}
                >
                  {PLAN_BADGES[p.id] && (
                    <span style={{ position: "absolute", top: -11, left: 18, padding: "3px 10px", borderRadius: 999, background: highlighted ? t.blue : t.surface, color: highlighted ? "#fff" : t.inkMuted, border: `1.5px solid ${highlighted ? t.blue : t.border}`, fontSize: "0.72rem", fontWeight: 800 }}>
                      {PLAN_BADGES[p.id]}
                    </span>
                  )}

                  <div>
                    <div style={{ fontFamily: "'Caveat',cursive", fontSize: "1.35rem", fontWeight: 700, color: t.ink }}>
                      {p.name}
                    </div>
                    {PLAN_SUBTITLE[p.id] && (
                      <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: t.inkMuted, lineHeight: 1.45, minHeight: mobile ? "auto" : 38 }}>
                        {PLAN_SUBTITLE[p.id]}
                      </p>
                    )}
                  </div>

                  <PriceTag plan={p} t={t} />

                  {PLAN_RENEW_NOTE[p.id] && (
                    <div style={{ fontSize: "0.76rem", color: t.inkMuted, fontWeight: 600 }}>
                      {PLAN_RENEW_NOTE[p.id]}
                    </div>
                  )}

                  {Array.isArray(p.features) && p.features.length > 0 && (
                    <div style={{ display: "grid", gap: 8, paddingTop: 4, borderTop: `1px solid ${t.border}` }}>
                      {p.features.map((f, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: "0.84rem", color: t.ink, lineHeight: 1.45 }}>
                          <span style={{ color: t.green, fontWeight: 900 }}>✓</span>
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {renderPlanButton(p)}
                </div>
              );
            })}
          </div>
        )}

        {!isGuest && !loading && !error && plan?.id !== "lifetime" && (
          <p style={{ margin: "14px 2px 0", fontSize: "0.82rem", color: t.inkMuted, textAlign: "center" }}>
            New monthly and yearly subscriptions include a 7-day Pro trial. Recurring plans can be canceled anytime.
          </p>
        )}

        {/* FAQ */}
        <div style={{ marginTop: mobile ? 36 : 52 }}>
          <h2 style={{ fontFamily: "'Caveat',cursive", fontSize: "1.9rem", margin: "0 0 16px", color: t.ink, textAlign: "center" }}>
            Frequently asked questions
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: 14 }}>
            {BILLING_FAQS.map((item) => (
              <div key={item.question} style={{ padding: "16px 16px", borderRadius: 12, border: `1.5px solid ${t.border}`, background: t.surfaceAlt }}>
                <div style={{ fontSize: "0.94rem", fontWeight: 800, color: t.ink, marginBottom: 6 }}>
                  {item.question}
                </div>
                <p style={{ margin: 0, color: t.inkMuted, fontSize: "0.85rem", lineHeight: 1.55 }}>
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {learning && (
          <Card t={t} density="compact" style={{ marginTop: 24, padding: 16 }}>
            <h3 style={{ margin: "0 0 8px", fontFamily: "'Caveat',cursive", fontSize: "1.15rem", color: t.ink }}>
              Refer a friend
            </h3>
            <p style={{ margin: "0 0 8px", color: t.inkMuted, fontSize: "0.84rem", lineHeight: 1.55 }}>
              Share code <code style={{ fontFamily: "'JetBrains Mono',monospace", color: t.ink }}>{learning.growth.referralCode || "..."}</code>. Each successful invite gives one bonus month.
            </p>
            <Button t={t} variant="secondary" size="sm" onClick={() => learning.applyReferral()} style={{ borderRadius: 8 }}>
              Simulate successful referral
            </Button>
          </Card>
        )}

        <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <Button t={t} variant="secondary" onClick={() => onNavigate("profile")} style={{ fontSize: "1rem", fontWeight: 700, borderRadius: 8, boxShadow: t.shadowSm }}>
            ← Profile
          </Button>
          <Button t={t} variant="secondary" onClick={() => onNavigate("home")} style={{ fontSize: "1rem", fontWeight: 700, borderRadius: 8, boxShadow: t.shadowSm }}>
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}
