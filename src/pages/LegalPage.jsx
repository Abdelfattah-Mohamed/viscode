const LAST_UPDATED = "June 10, 2026";
const SUPPORT_EMAIL = "support@viscode.dev";

const DOCS = {
  terms: {
    title: "Terms of Service",
    sections: [
      {
        heading: "1. The service",
        body: "VisCode is an interactive algorithm-learning platform that provides visual, step-by-step walkthroughs of programming problems. By creating an account or using the site you agree to these terms.",
      },
      {
        heading: "2. Accounts",
        body: "You must provide accurate information when creating an account and keep your credentials secure. Accounts are personal and may not be shared or transferred. We may suspend accounts that abuse the service, attempt to circumvent paywalls, or violate these terms.",
      },
      {
        heading: "3. Subscriptions and billing",
        body: "Paid plans (weekly, monthly, yearly) renew automatically until canceled. The Lifetime plan is a one-time payment and does not renew. You can cancel a recurring plan at any time from the Billing page; access remains active until the end of the paid period. Payments are processed by Stripe — we never store your card details.",
      },
      {
        heading: "4. Free content",
        body: "The Famous Algorithms category is available free of charge. We may change which content is free over time, but active paid subscriptions always retain access to the full library.",
      },
      {
        heading: "5. Acceptable use",
        body: "You may not scrape, redistribute, or resell the content, attempt to access other users' data, or interfere with the operation of the service.",
      },
      {
        heading: "6. Intellectual property",
        body: "All visualizations, explanations, code samples, and branding are the property of VisCode. You may use code samples for personal learning and in your own projects.",
      },
      {
        heading: "7. Disclaimer and liability",
        body: "The service is provided \"as is\" without warranties of any kind. To the maximum extent permitted by law, VisCode is not liable for indirect or consequential damages. Our total liability is limited to the amount you paid in the twelve months before the claim.",
      },
      {
        heading: "8. Changes",
        body: "We may update these terms; material changes will be announced in the app. Continued use after changes take effect constitutes acceptance.",
      },
      {
        heading: "9. Contact",
        body: `Questions about these terms: ${SUPPORT_EMAIL}.`,
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    sections: [
      {
        heading: "1. What we collect",
        body: "Account data (email, username, optional avatar), learning data (favorites, flags, notes, problem progress), subscription status, and product analytics events (for example which problems are opened). We do not collect or store payment card details — checkout is handled by Stripe.",
      },
      {
        heading: "2. How we use it",
        body: "To provide the service (sync your progress across devices), to manage subscriptions, and to improve the product through aggregate usage analytics. We do not sell personal data.",
      },
      {
        heading: "3. Where it lives",
        body: "Data is stored in Supabase (PostgreSQL) with row-level security so each account can only access its own rows. Payments and invoices are processed and stored by Stripe.",
      },
      {
        heading: "4. Cookies and local storage",
        body: "We use browser local storage for your session, theme preference, and cached learning data. We do not use third-party advertising cookies.",
      },
      {
        heading: "5. Third parties",
        body: "Supabase (database and authentication), Stripe (payments), and Google (optional sign-in). Each processes only the data needed for its function.",
      },
      {
        heading: "6. Your rights",
        body: `You can update your profile at any time and delete your account (and all associated data) from the Profile page. For data export or other requests, contact ${SUPPORT_EMAIL}.`,
      },
      {
        heading: "7. Changes",
        body: "We will announce material changes to this policy in the app before they take effect.",
      },
    ],
  },
  refunds: {
    title: "Refund Policy",
    sections: [
      {
        heading: "1. Recurring plans",
        body: "Weekly, monthly, and yearly subscriptions can be canceled at any time and remain active until the end of the paid period. We generally do not refund partial periods, since the content is consumable on day one.",
      },
      {
        heading: "2. Lifetime plan",
        body: "Lifetime purchases can be refunded within 14 days of purchase if you are not satisfied — email us and we will process it, no questions asked.",
      },
      {
        heading: "3. Billing errors",
        body: "Duplicate charges or charges after a confirmed cancellation are always refunded in full. Contact us with the charge details.",
      },
      {
        heading: "4. Free trial",
        body: "New monthly and yearly subscriptions include a 7-day trial. Cancel during the trial and you will not be charged.",
      },
      {
        heading: "5. How to request",
        body: `Email ${SUPPORT_EMAIL} from your account email with the subject "Refund request". We respond within 2 business days.`,
      },
    ],
  },
};

export default function LegalPage({ kind = "terms", t, mobile, onNavigate }) {
  const doc = DOCS[kind] || DOCS.terms;
  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: t.bg, color: t.ink, minHeight: "100vh" }}>
      <style>{`* { box-sizing: border-box; }`}</style>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: mobile ? "32px 16px 48px" : "48px 24px 64px" }}>
        <button
          onClick={() => onNavigate("home")}
          style={{ background: "none", border: "none", color: t.blue, cursor: "pointer", fontSize: "0.9rem", fontWeight: 700, padding: 0, marginBottom: 18 }}
        >
          ← Back to VisCode
        </button>
        <h1 style={{ fontFamily: "'Caveat',cursive", fontSize: mobile ? "2.2rem" : "2.8rem", margin: "0 0 6px", lineHeight: 1.05 }}>
          {doc.title}
        </h1>
        <p style={{ margin: "0 0 28px", color: t.inkMuted, fontSize: "0.86rem" }}>
          Last updated: {LAST_UPDATED}
        </p>
        <div style={{ display: "grid", gap: 22 }}>
          {doc.sections.map((s) => (
            <section key={s.heading}>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 800, margin: "0 0 6px", color: t.ink }}>
                {s.heading}
              </h2>
              <p style={{ margin: 0, color: t.inkMuted, fontSize: "0.92rem", lineHeight: 1.7 }}>
                {s.body}
              </p>
            </section>
          ))}
        </div>
        <nav aria-label="Legal pages" style={{ marginTop: 36, paddingTop: 18, borderTop: `1.5px solid ${t.border}`, display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[
            ["terms", "Terms of Service"],
            ["privacy", "Privacy Policy"],
            ["refunds", "Refund Policy"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              style={{
                background: "none",
                border: "none",
                color: id === kind ? t.ink : t.blue,
                fontWeight: id === kind ? 800 : 600,
                cursor: id === kind ? "default" : "pointer",
                fontSize: "0.86rem",
                padding: 0,
                textDecoration: id === kind ? "none" : "underline",
              }}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
