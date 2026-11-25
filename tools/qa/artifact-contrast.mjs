import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readdirSync, readFileSync } from "node:fs";
const ids = readdirSync("catalog").map(f=>JSON.parse(readFileSync("catalog/"+f,"utf8")).id);
const b = await chromium.launch(); const p = await (await b.newContext({viewport:{width:1280,height:900}})).newPage();
for (const id of ids) for (const hash of ["", "#interview", "#revise"]) {
  await p.goto(`http://localhost:${process.env.PORT ?? 3000}/a/${id}${hash}`); await p.waitForTimeout(600);
  const r = await new AxeBuilder({page:p}).withRules(["color-contrast"]).analyze();
  const v = r.violations[0];
  console.log(id, hash||"#lesson", v ? v.nodes.length+" fails e.g. "+v.nodes[0].target.join(" ")+" "+(v.nodes[0].any[0]?.message||"").slice(0,70) : "ok");
}
await b.close();
