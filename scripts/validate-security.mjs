import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function expect(condition, message) {
  if (!condition) failures.push(message);
}

function sourceFiles(dir) {
  const entries = readdirSync(join(root, dir), { withFileTypes: true });
  return entries.flatMap((entry) => {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(js|jsx|ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

for (const file of sourceFiles("src")) {
  const source = read(file);
  expect(
    !/VITE_ADMIN|ADMIN_BOOTSTRAP|ADMIN_EMAILS/.test(source),
    `${file} must not derive auth or billing entitlements from public admin env vars`
  );
}

const subscriptionSource = read("src/hooks/useSubscription.js");
expect(
  /ACCESS_STATUSES\.has\(subscription\?\.status\)/.test(subscriptionSource),
  "useSubscription must require an active/trialing status before granting Pro access"
);

const schema = read("supabase/schema.sql");
for (const policy of ["subscriptions_insert", "subscriptions_update", "subscriptions_delete", "invoices_insert"]) {
  const pattern = new RegExp(`create policy "${policy}"[\\s\\S]*?\\((false)\\);`);
  expect(
    pattern.test(schema),
    `Supabase policy ${policy} must deny anonymous client writes`
  );
}

if (failures.length) {
  console.error(`Security validation failed (${failures.length}):`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Security validation passed.");
