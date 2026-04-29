import { getLocalAnalyticsSnapshot } from "./analytics";

function toTime(ts) {
  const t = new Date(ts).getTime();
  return Number.isFinite(t) ? t : 0;
}

function countByName(events, name) {
  return events.filter((e) => e.name === name).length;
}

export function getAnalyticsMetrics() {
  const { events, feedback } = getLocalAnalyticsSnapshot();
  const sorted = [...events].sort((a, b) => toTime(a.ts) - toTime(b.ts));
  const firstProblemStarted = countByName(sorted, "first_problem_started");
  const firstProblemCompleted = countByName(sorted, "first_problem_completed");
  const paywallViews = countByName(sorted, "paywall_shown");
  const checkoutStarts = countByName(sorted, "checkout_started");
  const paid = countByName(sorted, "checkout_succeeded");
  const reportIssues = countByName(sorted, "report_issue_submitted");
  const helpfulVotes = countByName(sorted, "visualization_feedback_vote");
  const conversionRate = checkoutStarts > 0 ? (paid / checkoutStarts) * 100 : 0;
  const activationRate = firstProblemStarted > 0 ? (firstProblemCompleted / firstProblemStarted) * 100 : 0;

  return {
    totals: {
      events: sorted.length,
      feedback: feedback.length,
      paywallViews,
      checkoutStarts,
      paid,
      reportIssues,
      helpfulVotes,
    },
    funnel: {
      firstProblemStarted,
      firstProblemCompleted,
      paywallViews,
      checkoutStarts,
      paid,
      activationRate,
      conversionRate,
    },
    recentEvents: sorted.slice(-15).reverse(),
  };
}
