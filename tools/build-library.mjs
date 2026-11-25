// Library build step. Reads catalog/*.json, copies each public artifact into public/a/<id>/,
// writes src/generated/catalog.json, search.json (in public/) and changelog.json.
// Visibility is enforced HERE: items that are not public are never copied or listed.
// Usage: node tools/build-library.mjs   (LIBRARY_ENV=dev also includes visibility "draft")
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, rmSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, "..");
const ROOT = join(repo, "content"); // filled by tools/sync-content.mjs and committed
const DEV = process.env.LIBRARY_ENV === "dev";

const must = (c, m) => { if (!c) { console.error("BUILD FAILED:", m); process.exit(1); } };
must(existsSync(ROOT), `content/ not found: run node tools/sync-content.mjs`);

const files = readdirSync(join(repo, "catalog")).filter((f) => f.endsWith(".json")).sort();
const all = files.map((f) => ({ file: f, ...JSON.parse(readFileSync(join(repo, "catalog", f), "utf8")) }));

// Validate
const ids = new Set();
const REQUIRED = ["id", "title", "description", "type", "shelf", "track", "version", "date", "status", "reviewBy", "entry", "visibility", "flag", "access", "source"];
for (const it of all) {
  for (const k of REQUIRED) must(it[k] !== undefined && it[k] !== "", `${it.file}: missing field ${k}`);
  must(it.file === `${it.id}.json`, `${it.file}: file name must equal id`);
  must(!ids.has(it.id), `duplicate id ${it.id}`);
  ids.add(it.id);
  must(["orbit", "three-d", "guide", "pdf"].includes(it.type), `${it.id}: bad type`);
  must(["draft", "verified", "audited", "legacy"].includes(it.status), `${it.id}: bad status`);
  must(["public", "draft", "hidden"].includes(it.visibility), `${it.id}: bad visibility`);
  must(/^\d{4}-\d{2}-\d{2}$/.test(it.date) && /^\d{4}-\d{2}-\d{2}$/.test(it.reviewBy), `${it.id}: bad date`);
  must(it.entry === `/a/${it.id}/`, `${it.id}: entry must be /a/${it.id}/`);
}
for (const it of all) for (const p of it.prerequisites ?? []) must(ids.has(p), `${it.id}: unknown prerequisite ${p}`);

const included = all.filter((i) => i.visibility === "public" || (DEV && i.visibility === "draft"));
const excluded = all.filter((i) => !included.includes(i));

// Clean and copy artifacts
rmSync(join(repo, "public", "a"), { recursive: true, force: true });
mkdirSync(join(repo, "public", "a"), { recursive: true });
const HEAD = '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">';
const BACK = '<a href="/" id="orbit-back" aria-label="Back to Orbit Library">&larr; Library</a><style>#orbit-back{position:fixed;left:12px;bottom:12px;z-index:2147483000;padding:6px 12px;border-radius:999px;font:600 13px/1.2 system-ui,sans-serif;background:rgba(20,20,30,.82);color:#fff;text-decoration:none;border:1px solid rgba(255,255,255,.25);backdrop-filter:blur(6px);opacity:.85}#orbit-back:hover,#orbit-back:focus-visible{opacity:1;outline:2px solid #fff;outline-offset:2px}@media print{#orbit-back{display:none}}</style>';
// Contrast fixes for older pages that were built before the engine palette was corrected (WCAG AA, 4.5:1).
// Each patch must match, so a change in a source page cannot silently drop a fix. Current topics are fixed at the source.
const PATCHES = {
  "js-aws": "orbit", "js-node": "orbit", "js-orbit": "orbit", "js-react": "orbit",
  "tomeverse-archipelago": "tome", "tomeverse-globe": "tome", "tomeverse-land": "tome", "tomeverse-world": "tome-world",
};
const PATCH_SETS = {
  orbit: [
    [/--a1: #0a9a85; --a2: #6a47e0; --a3: #d97706; --a4: #e11d62;/g, "--on-a1: #ffffff; --a1: #056a5c; --a2: #6a47e0; --a3: #8f4d08; --a4: #b8114d;"],
    [/--a1: #2de2c4;/g, "--on-a1: #04201c; --a1: #2de2c4;"],
    [/(?<![-\w])color: ?#04201c/g, "color: var(--on-a1)"],
  ],
  tome: [
    [/#7a7499/gi, "#a29dc0"],
  ],
  "tome-world": [
    [/#7a7499/gi, "#a29dc0"],
    [/aria-pressed="true"\]\{background:var\(--violet\);color:#fff\}/g, 'aria-pressed="true"]{background:var(--violet);color:#12062e}'],
  ],
};
let totalBytes = 0;
const sizes = [];
for (const it of included) {
  const src = join(ROOT, `${it.id}.html`);
  must(existsSync(src), `${it.id}: content/${it.id}.html missing, run node tools/sync-content.mjs`);
  let html = readFileSync(src, "utf8");
  const head = html.slice(0, 2000).toLowerCase();
  const hasDoctype = /^\s*<!doctype html/.test(head);
  const hasCharset = head.includes("charset");
  const hasViewport = head.includes('name="viewport"') || head.includes("name=viewport");
  if (!hasDoctype) html = HEAD + html;
  else {
    let add = "";
    if (!hasCharset) add += '<meta charset="utf-8">';
    if (!hasViewport) add += '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">';
    if (add) html = html.replace(/<head[^>]*>/i, (m) => m + add);
  }
  for (const [from, to] of PATCH_SETS[PATCHES[it.id]] ?? []) {
    must(from.test(html), `${it.id}: contrast patch no longer matches (${from})`);
    html = html.replace(from, to);
  }
  // Self-host three.js (the 3D pages load r128 from cdnjs)
  html = html.split("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js").join("/vendor/three-r128.min.js");
  // Self-host fonts: replace Google Fonts links with the local stylesheet (see tools/fetch-fonts.mjs)
  let first = true;
  html = html.replace(/<link[^>]+(?:fonts\.googleapis\.com|fonts\.gstatic\.com)[^>]*>/gi, () => {
    if (!first) return "";
    first = false;
    return '<link rel="stylesheet" href="/fonts/fonts.css">';
  });
  must(!first || !/fonts\.googleapis\.com\/css/.test(html), `${it.id}: a Google Fonts stylesheet remained`);
  // Shared back link to the library (pages may be fragments without </body>)
  html = /<\/body>/i.test(html) ? html.replace(/<\/body>/i, () => BACK + "</body>") : html + BACK;
  const dir = join(repo, "public", "a", it.id);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html);
  const bytes = Buffer.byteLength(html);
  totalBytes += bytes;
  sizes.push([it.id, Math.round(bytes / 1024)]);
}

// Generated catalog (strip build-only fields)
mkdirSync(join(repo, "src", "generated"), { recursive: true });
const pub = included.map((it) => { const c = { ...it }; delete c.file; delete c.source; return c; });
writeFileSync(join(repo, "src", "generated", "catalog.json"), JSON.stringify(pub, null, 1));

// Search index: one entry per item, plus one per lesson where the topic's part files are available
const search = [];
for (const it of included) {
  search.push({ id: it.id, kind: "item", title: it.title, text: `${it.description} ${it.tags.join(" ")} ${it.track} ${it.shelf}`, href: `/items/${it.id}` });
  const metaFile = join(ROOT, `${it.id}.json`);
  must(existsSync(metaFile), `${it.id}: content/${it.id}.json missing`);
  for (const l of JSON.parse(readFileSync(metaFile, "utf8")).lessons) {
    search.push({ id: `${it.id}:${l.id}`, kind: "lesson", title: l.title, text: `${it.title} lesson ${l.id}`, href: it.entry });
  }
}
writeFileSync(join(repo, "public", "search.json"), JSON.stringify(search));

// Changelog: each topic's own CHANGELOG.md plus the library's
const log = [{ scope: "Orbit Library", version: "0.1.0", date: new Date().toISOString().slice(0, 10), note: "First development build of the library shell: catalog, search, filters, themes, status labels." }];
for (const it of included) {
  for (const e of JSON.parse(readFileSync(join(ROOT, `${it.id}.json`), "utf8")).changelog) {
    log.push({ scope: it.title, version: e.version, date: e.date, note: e.note });
  }
}
writeFileSync(join(repo, "src", "generated", "changelog.json"), JSON.stringify(log, null, 1));
writeFileSync(join(repo, "src", "generated", "meta.json"), JSON.stringify({ builtOn: new Date().toISOString().slice(0, 10) }));

// Visibility check: no excluded id may appear in any generated file or folder
for (const it of excluded) {
  must(!existsSync(join(repo, "public", "a", it.id)), `excluded item ${it.id} found in public/a`);
  for (const f of [join(repo, "src", "generated", "catalog.json"), join(repo, "public", "search.json")]) {
    must(!readFileSync(f, "utf8").includes(`"id":"${it.id}"`) && !readFileSync(f, "utf8").includes(`"id": "${it.id}"`), `excluded item ${it.id} found in ${f}`);
  }
}

console.log(`items ${included.length} (excluded ${excluded.length}); search entries ${search.length}; changelog ${log.length}`);
console.log(`artifact bytes ${(totalBytes / 1048576).toFixed(1)} MB; per item KB:`, sizes.map(([i, k]) => `${i}=${k}`).join(" "));
