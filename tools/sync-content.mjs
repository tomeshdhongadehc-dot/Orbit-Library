// Copies the built study pages into this repository (content/) so the repo is self-contained
// and the build, CI and deploy never depend on a folder outside it.
// Run when a topic changes:  node tools/sync-content.mjs   (ARTIFACT_ROOT = folder that holds dist/, OFFLINE/, topics/)
// For each catalog item it writes content/<id>.html and content/<id>.json (lesson titles for search, changelog lines).
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = resolve(process.env.ARTIFACT_ROOT ?? join(repo, "..", "React-Study", "backend-orbit"));
if (!existsSync(ROOT)) { console.error("ARTIFACT_ROOT not found:", ROOT); process.exit(1); }
mkdirSync(join(repo, "content"), { recursive: true });

const items = readdirSync(join(repo, "catalog")).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(readFileSync(join(repo, "catalog", f), "utf8")));
for (const it of items) {
  const src = join(ROOT, it.source);
  if (!existsSync(src)) { console.error(`${it.id}: source not found ${src}`); process.exit(1); }
  writeFileSync(join(repo, "content", `${it.id}.html`), readFileSync(src));
  const meta = { lessons: [], changelog: [] };
  const partsDir = join(ROOT, "topics", it.id, "parts");
  if (existsSync(partsDir)) {
    for (const f of readdirSync(partsDir).filter((n) => /^l\d+\.js$/.test(n))) {
      const text = readFileSync(join(partsDir, f), "utf8");
      const re = /lesson\(\{\s*id:\s*['"]([^'"]+)['"][\s\S]*?title:\s*(['"])([\s\S]*?)\2\s*,/g;
      let m;
      while ((m = re.exec(text))) meta.lessons.push({ id: m[1], title: m[3].replace(/\'/g, "'") });
    }
  }
  const cl = join(ROOT, "topics", it.id, "CHANGELOG.md");
  if (existsSync(cl)) {
    for (const line of readFileSync(cl, "utf8").split(/\r?\n/)) {
      const m = line.match(/^-\s*([\d.]+)\s*\((\d{4}-\d{2}-\d{2})\):\s*(.+)$/);
      if (m) meta.changelog.push({ version: m[1], date: m[2], note: m[3] });
    }
  }
  writeFileSync(join(repo, "content", `${it.id}.json`), JSON.stringify(meta, null, 1));
  console.log(`${it.id}: ${meta.lessons.length} lessons, ${meta.changelog.length} changelog lines`);
}
