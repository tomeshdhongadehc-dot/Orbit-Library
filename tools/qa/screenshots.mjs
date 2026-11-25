import { chromium } from "@playwright/test";
const b = await chromium.launch();
for (const [theme,w,h] of [["dark",1280,900],["light",1280,900],["dark",375,800]]) {
  const ctx = await b.newContext({ viewport:{width:w,height:h} });
  await ctx.addInitScript((t)=>localStorage.setItem("orbit-theme",t),theme);
  const p = await ctx.newPage();
  for (const [n,u] of [["home","/"],["items","/items"],["item","/items/mongodb"]]) {
    await p.goto(`http://localhost:${process.env.PORT ?? 3000}${u}`); await p.waitForTimeout(900);
    await p.evaluate(()=>window.scrollTo(0,0));
    await p.screenshot({path:`shots/${n}-${theme}-${w}.png`, fullPage:true});
  }
  await ctx.close();
}
await b.close();
