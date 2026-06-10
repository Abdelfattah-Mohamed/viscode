/**
 * Generates public/sitemap.xml from the problem library.
 * Runs automatically before `vite build` (see package.json "build").
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PROB_LIST } from "../src/data/problems.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE = process.env.SITE_URL || "https://viscode.dev";
const OUT = path.join(__dirname, "../public/sitemap.xml");

const today = new Date().toISOString().slice(0, 10);

const staticPages = [
  { loc: "/", priority: "1.0" },
  { loc: "/problems", priority: "0.9" },
  { loc: "/billing", priority: "0.6" },
  { loc: "/votes", priority: "0.5" },
  { loc: "/terms", priority: "0.3" },
  { loc: "/privacy", priority: "0.3" },
  { loc: "/refunds", priority: "0.3" },
];

const problemPages = PROB_LIST.map((p) => ({
  loc: `/problem/${p.id}`,
  priority: "0.7",
}));

const urls = [...staticPages, ...problemPages]
  .map(
    ({ loc, priority }) => `  <url>
    <loc>${SITE}${loc}</loc>
    <lastmod>${today}</lastmod>
    <priority>${priority}</priority>
  </url>`
  )
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

writeFileSync(OUT, xml);
console.log(`sitemap.xml written with ${staticPages.length + problemPages.length} URLs -> ${OUT}`);
