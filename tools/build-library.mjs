// Library build step. Reads catalog/*.json, copies each public artifact into public/a/<id>/,
// writes src/generated/catalog.json, search.json (in public/) and changelog.json.
// Visibility is enforced HERE: items that are not public are never copied or listed.
// Usage: node tools/build-library.mjs   (LIBRARY_ENV=dev also includes visibility "draft")
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, rmSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, "..");
const ROOT = resolve(process.env.ARTIFACT_ROOT ?? join(repo, "..", "React-Study", "backend-orbit"));
const DEV = process.env.LIBRARY_ENV === "dev";

const must = (c, m) => { if (!c) { console.error("BUILD FAILED:", m); process.exit(1); } };
must(existsSync(ROOT), `ARTIFACT_ROOT not found: ${ROOT}`);

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
let totalBytes = 0;
const sizes = [];
for (const it of included) {
  const src = join(ROOT, it.source);
  must(existsSync(src), `${it.id}: source not found ${src}`);
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
  const partsDir = join(ROOT, "topics", it.id, "parts");
  if (!existsSync(partsDir)) continue;
  for (const f of readdirSync(partsDir).filter((n) => /^l\d+\.js$/.test(n))) {
    const src = readFileSync(join(partsDir, f), "utf8");
    const re = /lesson\(\{\s*id:\s*['"]([^'"]+)['"][\s\S]*?title:\s*(['"])([\s\S]*?)\2\s*,/g;
    let m;
    while ((m = re.exec(src))) {
      search.push({ id: `${it.id}:${m[1]}`, kind: "lesson", title: m[3].replace(/\\'/g, "'"), text: `${it.title} lesson ${m[1]}`, href: it.entry });
    }
  }
}
writeFileSync(join(repo, "public", "search.json"), JSON.stringify(search));

// Changelog: each topic's own CHANGELOG.md plus the library's
const log = [{ scope: "Orbit Library", version: "0.1.0", date: new Date().toISOString().slice(0, 10), note: "First development build of the library shell: catalog, search, filters, themes, status labels." }];
for (const it of included) {
  const p = join(ROOT, "topics", it.id, "CHANGELOG.md");
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^-\s*([\d.]+)\s*\((\d{4}-\d{2}-\d{2})\):\s*(.+)$/);
    if (m) log.push({ scope: it.title, version: m[1], date: m[2], note: m[3] });
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
