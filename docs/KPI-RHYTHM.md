# VisCode KPI And Experiment Rhythm

Weekly operating model for product and revenue iteration.

## North-Star Metrics

- Activation: user opens at least 3 problems in first 48h.
- Engagement: median App workspace session duration.
- Conversion: free to paid within 14 days.
- Retention: week-2 return rate.
- Support quality: first response and resolution time.

## Weekly Review Ritual

Run every Monday:

1. Review funnel conversion for previous week.
2. Review top failed events (checkout_failed, report_issue_submitted clusters).
3. Pick one UX/copy experiment and one reliability fix.
4. Assign owner and expected metric movement.

## Suggested Dashboard Events

- `landing_cta_click`
- `problem_opened`
- `paywall_shown`
- `checkout_started`
- `checkout_redirected`
- `checkout_succeeded`
- `checkout_failed`
- `subscription_cancel_started`
- `subscription_cancel_succeeded`
- `subscription_resume_succeeded`
- `visualization_feedback_vote`
- `report_issue_submitted`

## Experiment Backlog (Initial)

1. Hero CTA copy A/B test (learning vs interview framing).
2. Billing card ordering (yearly emphasized vs monthly emphasized).
3. Paywall wording test on premium cards.
4. Add one testimonial block after first valid beta quotes.

## B2B Deferral Rule

Do not build B2B workflows until:

- consumer activation and conversion are stable for 4 consecutive weeks
- support load is manageable without blocking core roadmap

When ready, start with discovery interviews and simple organization interest form.
