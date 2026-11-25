import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const pages = ["/", "/items", "/items/mongodb", "/search", "/changelog", "/about", "/shelf/development", "/track/backend", "/nope"];
const b = await chromium.launch();
for (const theme of ["dark", "light"]) for (const w of [375, 1280]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
  await ctx.addInitScript((t) => localStorage.setItem("orbit-theme", t), theme);
  const p = await ctx.newPage();
  for (const u of pages) {
    await p.goto(`http://localhost:${process.env.PORT ?? 3000}${u}`); await p.waitForTimeout(400);
    const r = await new AxeBuilder({ page: p }).withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze();
    for (const v of r.violations) console.log(theme, w, u, v.id, v.nodes.length, v.nodes.slice(0,2).map(n=>n.target.join(" ")+" :: "+(n.any[0]?.message||"").slice(0,90)).join(" | "));
  }
  await ctx.close();
}
await b.close(); console.log("done");
