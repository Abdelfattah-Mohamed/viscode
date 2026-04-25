const EVENT_LOG_KEY = "viscode-analytics-events";
const FEEDBACK_LOG_KEY = "viscode-feedback-events";
const MAX_STORED_ITEMS = 200;

function safeNowIso() {
  return new Date().toISOString();
}

function safePath() {
  try {
    return `${window.location.pathname}${window.location.search || ""}`;
  } catch {
    return "";
  }
}

function readList(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeList(key, items) {
  try {
    localStorage.setItem(key, JSON.stringify(items.slice(-MAX_STORED_ITEMS)));
  } catch {
    // Ignore localStorage quota or privacy-mode failures.
  }
}

function postJson(url, payload) {
  if (!url) return Promise.resolve(false);
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  })
    .then((res) => res.ok)
    .catch(() => false);
}

export function trackEvent(name, properties = {}) {
  if (!name) return;
  const event = {
    name,
    properties,
    ts: safeNowIso(),
    path: safePath(),
  };

  const list = readList(EVENT_LOG_KEY);
  list.push(event);
  writeList(EVENT_LOG_KEY, list);

  if (import.meta.env.DEV) {
    console.debug("[analytics]", event);
  }

  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
  postJson(endpoint, event);
}

export async function submitFeedback(payload) {
  const record = {
    ...payload,
    ts: safeNowIso(),
    path: safePath(),
  };

  const list = readList(FEEDBACK_LOG_KEY);
  list.push(record);
  writeList(FEEDBACK_LOG_KEY, list);

  if (import.meta.env.DEV) {
    console.debug("[feedback]", record);
  }

  const endpoint = import.meta.env.VITE_FEEDBACK_ENDPOINT || import.meta.env.VITE_ANALYTICS_ENDPOINT;
  const sent = await postJson(endpoint, { type: "feedback", ...record });
  return { ok: true, sent };
}

export function getLocalAnalyticsSnapshot() {
  return {
    events: readList(EVENT_LOG_KEY),
    feedback: readList(FEEDBACK_LOG_KEY),
  };
}
