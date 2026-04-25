# VisCode Incident Runbook

Operational runbook for auth, billing, and visualization incidents.

## Severity Levels

- **SEV-1:** Billing/auth is down for most users, or paid access is broken.
- **SEV-2:** Major feature is degraded with workaround.
- **SEV-3:** Minor bug with low impact.

## Incident Response Targets

- **SEV-1 ack:** 15 minutes
- **SEV-1 mitigation:** 60 minutes
- **SEV-2 ack:** 4 hours
- **SEV-3 ack:** 1 business day

## 1) Billing Incident Playbook

### Symptoms

- Checkout cannot start.
- Stripe webhook not updating subscriptions.
- Plan status in UI mismatches expected Stripe state.

### Immediate Steps

1. Confirm Supabase Edge Function health and logs.
2. Confirm function secrets are still present.
3. Validate webhook endpoint and signature secret in deployed environment.
4. Validate plan ID and Stripe price ID mapping.
5. Apply temporary user-facing notice in Billing page if needed.

### Rollback Strategy

- Revert to last known good function deployment.
- Disable upgrade/cancel actions if they are causing bad state, keep read-only billing status visible.
- Manually reconcile affected user subscriptions in Supabase from Stripe records.

## 2) Auth Incident Playbook

### Symptoms

- Login/signup failures.
- Google sign-in errors in production only.
- Verification codes not sent.

### Immediate Steps

1. Verify build-time `VITE_SUPABASE_*` values.
2. Validate Google OAuth authorized origins.
3. Check `send-verification-code` and `verify-code` deployments and logs.
4. Confirm any email provider credentials/secrets.

### Rollback Strategy

- Temporarily hide optional sign-in methods that fail.
- Keep guest mode operational while auth path is restored.

## 3) Visualization Incident Playbook

### Symptoms

- Whiteboard not updating.
- Step/code line mismatch.
- Problem-specific rendering/parsing errors.

### Immediate Steps

1. Reproduce with exact problem ID + input.
2. Capture screenshot and step index where mismatch starts.
3. Validate `stepGenerators` output shape for that problem.
4. Validate visualizer component assumptions for provided step state.

### Rollback Strategy

- Temporarily disable broken problem in production list if critical.
- Provide user message with expected restoration ETA.

## 4) Communications Template

Use this short status update format:

- **Issue:** concise symptom
- **Impact:** who is affected
- **Mitigation:** current workaround
- **ETA:** next update window

## 5) Postmortem Template

- What happened
- User impact window
- Root cause
- Detection gap
- Preventive fix
- Follow-up owner and due date
