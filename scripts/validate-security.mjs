import { readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const checkedFiles = [
  "src/hooks/useAuth.js",
  "src/hooks/useSubscription.js",
  "src/pages/VotesPage.jsx",
];

const forbiddenPatterns = [
  {
    pattern: /VITE_ADMIN_/,
    message: "Client code must not consume VITE_ADMIN_* variables for credentials or entitlements.",
  },
  {
    pattern: /ADMIN_BOOTSTRAP/,
    message: "Client code must not bootstrap privileged accounts.",
  },
];

const failures = [];

for (const file of checkedFiles) {
  const source = readFileSync(join(repoRoot, file), "utf8");
  for (const { pattern, message } of forbiddenPatterns) {
    if (pattern.test(source)) {
      failures.push(`${file}: ${message}`);
    }
  }
}

if (failures.length) {
  console.error("Security validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Security validation passed.");
