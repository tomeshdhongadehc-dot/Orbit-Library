// One-time: downloads the latin subset of every Google font the study pages use into public/fonts/
// and writes public/fonts/fonts.css. Fonts are open licence (OFL / Apache). Run: node tools/fetch-fonts.mjs
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
const SETS = [
  "family=DM+Sans:wght@400;500;700&family=Fira+Code:wght@400;500;600&family=Sora:wght@500;600;700",
  "family=Manrope:wght@400;600;800&family=Unbounded:wght@600;800",
  "family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@500;600;700",
];
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36";
const dir = join(process.cwd(), "public", "fonts");
mkdirSync(dir, { recursive: true });
let css = "";
const seen = new Set();
for (const s of SETS) {
  const res = await fetch(`https://fonts.googleapis.com/css2?${s}&display=swap`, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error("css fetch failed " + res.status);
  const text = await res.text();
  for (const block of text.split("/* ").slice(1)) {
    if (!block.startsWith("latin */")) continue; // latin only (not latin-ext)
    const fam = /font-family:\s*'([^']+)'/.exec(block)[1];
    const wt = /font-weight:\s*(\d+)/.exec(block)[1];
    const url = /url\((https:[^)]+\.woff2)\)/.exec(block)[1];
    const name = `${fam.replace(/\s+/g, "")}-${wt}.woff2`;
    if (seen.has(name)) continue;
    seen.add(name);
    if (!existsSync(join(dir, name))) {
      const f = await fetch(url);
      if (!f.ok) throw new Error("font fetch failed " + url);
      writeFileSync(join(dir, name), Buffer.from(await f.arrayBuffer()));
    }
    css += `@font-face{font-family:'${fam}';font-style:normal;font-weight:${wt};font-display:swap;src:url(/fonts/${name}) format('woff2')}\n`;
  }
}
writeFileSync(join(dir, "fonts.css"), css);
console.log("fonts", seen.size);
