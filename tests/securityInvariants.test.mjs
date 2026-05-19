import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function readSource(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

test("auth does not bootstrap privileged accounts from public client env", async () => {
  const source = await readSource("src/hooks/useAuth.js");

  assert.doesNotMatch(source, /VITE_ADMIN_(USERNAME|EMAIL|PASSWORD)/);
  assert.doesNotMatch(source, /ADMIN_BOOTSTRAP/);
  assert.doesNotMatch(source, /bootstrapAdminAccount/);
});

test("subscription access is not synthesized from client-side admin lists", async () => {
  const source = await readSource("src/hooks/useSubscription.js");

  assert.doesNotMatch(source, /VITE_ADMIN_(EMAILS|EMAIL)/);
  assert.doesNotMatch(source, /ADMIN_EMAILS/);
  assert.doesNotMatch(source, /Lifetime \(Admin\)|Admin lifetime access/);
  assert.doesNotMatch(source, /plan_id:\s*["']lifetime["']/);
});
