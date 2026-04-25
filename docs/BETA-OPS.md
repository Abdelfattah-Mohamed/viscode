# VisCode Soft Beta Operations

Invite-based operating playbook for the first 4-6 weeks.

## Cohort Design

- Target initial cohort: **30-80 testers**
- Segment mix:
  - beginner learners
  - interview-prep users
  - intermediate developers
- Prioritize users willing to provide weekly feedback.

## Invite Flow

1. Send beta invite with product scope and known limits.
2. Include onboarding checklist and feedback channel.
3. Ask each tester for one primary goal (interview prep, learning, teaching).

## Onboarding Message Template

Subject: VisCode soft beta invite

Hello, thanks for joining the VisCode beta.

- Start with the free Famous Algorithms set.
- Try at least 3 problems in your first session.
- If you hit issues, use the in-app "Report issue" action.

We send a short check-in at day 7 and a survey at day 14.

## Check-In Cadence

- **Day 0:** invite + onboarding
- **Day 7:** short check-in
- **Day 14:** structured survey
- **Weekly:** changelog + resolved issues

## Support SLA During Beta

- Billing issue first response: **same day**
- Broken visualization first response: **same day**
- Hotfix target for high-impact regressions: **24-48h**

## Weekly Triage Rhythm

- Monday: funnel + bug review
- Wednesday: prioritize top 3 fixes
- Friday: ship patch and publish changelog

## Feedback Taxonomy

Tag each issue as:

- `billing`
- `auth`
- `visualization`
- `input-editor`
- `notes`
- `ux-conversion`
- `performance`

## Exit Criteria To Public Launch

- Core journeys pass release checklist.
- No unresolved SEV-1 incidents in previous 14 days.
- Stable conversion and retention telemetry for at least 2 weekly cycles.
