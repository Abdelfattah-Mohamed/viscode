import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const errors = [];

function read(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) errors.push(message);
}

const useAuth = read("src/hooks/useAuth.js");
const useSubscription = read("src/hooks/useSubscription.js");
const votesPage = read("src/pages/VotesPage.jsx");
const schema = read("supabase/schema.sql");

assert(
  !/VITE_ADMIN_|ADMIN_BOOTSTRAP|bootstrapAdminAccount/.test(useAuth),
  "useAuth must not bootstrap privileged accounts from public Vite env values"
);

assert(
  /const loginAsGuest = \(\) => \{[\s\S]*localStorage\.setItem\("vc:session",\s*JSON\.stringify\(guestUser\)\)/.test(useAuth),
  "guest login must persist vc:session so navigation/remounts do not drop users back to auth"
);

assert(
  !/VITE_ADMIN_EMAIL/.test(useSubscription),
  "useSubscription must not grant paid entitlements from public Vite admin email env values"
);

assert(
  !/VITE_ADMIN_EMAIL/.test(votesPage),
  "VotesPage must not expose admin email allow-lists through public Vite env values"
);

assert(
  !/from\(\s*USER_SUBSCRIPTIONS_TABLE\s*\)\s*\.\s*(insert|upsert|update|delete)\b/s.test(useSubscription),
  "browser subscription hook must not mutate user_subscriptions"
);

assert(
  /ACTIVE_ENTITLEMENT_STATUSES\.has\(subscription\.status\)/.test(useSubscription) &&
    /plan\?\.amount_cents\s*>\s*0/.test(useSubscription),
  "isPro must require an active/trialing paid subscription row"
);

for (const [policy, action] of [
  ["subscriptions_insert", "insert"],
  ["subscriptions_update", "update"],
  ["subscriptions_delete", "delete"],
]) {
  assert(
    new RegExp(`create policy "${policy}" on public\\.user_subscriptions for ${action} (?:with check|using) \\(false\\);`).test(schema),
    `${policy} must deny anonymous ${action} access to user_subscriptions`
  );
}

assert(
  /create policy "invoices_insert" on public\.billing_invoices for insert with check \(false\);/.test(schema),
  "billing_invoices insert policy must deny anonymous writes"
);

if (errors.length) {
  console.error("Security validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Security validation passed.");
