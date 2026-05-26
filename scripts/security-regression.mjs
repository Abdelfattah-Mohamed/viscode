import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SOURCE_DIRS = ["src"];
const FORBIDDEN_PATTERNS = [
  {
    pattern: /VITE_ADMIN_PASSWORD/,
    message: "Admin passwords must not be read from Vite client env variables.",
  },
  {
    pattern: /ADMIN_BOOTSTRAP/i,
    message: "Admin account bootstrap must not run in browser code.",
  },
  {
    pattern: /VITE_ADMIN_EMAILS?/,
    message: "Admin email allowlists in Vite client env variables can expose privileged users.",
  },
  {
    pattern: /plan_id:\s*["']lifetime["'][\s\S]{0,240}status:\s*["']active["']/,
    message: "Client code must not synthesize an active lifetime subscription.",
  },
];
const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx"]);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

const failures = [];
for (const sourceDir of SOURCE_DIRS) {
  const fullSourceDir = path.join(ROOT, sourceDir);
  if (!fs.existsSync(fullSourceDir)) continue;

  for (const filePath of walk(fullSourceDir)) {
    const relativePath = path.relative(ROOT, filePath);
    const source = fs.readFileSync(filePath, "utf8");
    for (const { pattern, message } of FORBIDDEN_PATTERNS) {
      if (pattern.test(source)) {
        failures.push(`${relativePath}: ${message}`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error("Security regression check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Security regression check passed.");
