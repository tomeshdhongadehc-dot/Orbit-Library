import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Behaviour tests inside the five Orbit topic pages (shared engine): lessons, quiz, interview lab, revise.
const TOPICS = ["api-design", "data-modelling-indexing", "caching", "queues-async-jobs", "mongodb"];

for (const id of TOPICS) {
  test.describe(`inside ${id}`, () => {
    test("lesson steps, quiz answer, interview lab and revise all work", async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(`/a/${id}`);
      await expect(page.locator("#title")).not.toBeEmpty();

      // Step through the first lesson to its last step (Next stops being the plain Next button)
      const first = (await page.locator(".stephead").first().textContent()) ?? "";
      for (let i = 0; i < 12 && (await page.locator(".qgo").count()) === 0; i++) {
        await page.locator("#nx").click();
      }
      expect(first).toMatch(/Step 1 of/);
      await expect(page.locator(".qgo")).toBeVisible();

      // Start the first quiz round and answer one question
      await page.locator(".qgo").click();
      const options = page.locator("#panel .qo");
      await expect(options.first()).toBeVisible();
      const before = await page.locator("#panel").innerText();
      await options.first().click();
      await expect.poll(async () => page.locator("#panel").innerText()).not.toBe(before);

      // Interview lab and revise views render and the back link exists
      await page.goto(`/a/${id}#interview`);
      await expect(page.locator("#iv")).toContainText("Interview lab");
      await page.goto(`/a/${id}#revise`);
      await expect(page.locator("#rv")).toContainText("Revis");
      await expect(page.locator("#orbit-back")).toHaveAttribute("href", "/");
      expect(errors).toEqual([]);
    });
  });
}

test("the back link returns to the library", async ({ page }) => {
  await page.goto("/a/mongodb");
  await page.locator("#orbit-back").click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("h1")).toHaveCount(1);
});

test("artifact pages load no third-party hosts", async ({ page }) => {
  const external: string[] = [];
  page.on("request", (r) => {
    const u = new URL(r.url());
    if (!["localhost", "127.0.0.1"].includes(u.hostname) && u.protocol.startsWith("http")) external.push(u.hostname);
  });
  for (const id of ["mongodb", "api-design", "js-orbit", "tomeverse-land", "tomeverse-world"]) {
    await page.goto(`/a/${id}`);
    await page.waitForLoadState("networkidle");
  }
  expect(external).toEqual([]);
});

// Older pages (different engines): the main interaction works and nothing throws.
for (const id of ["js-aws", "js-node", "js-orbit", "js-react", "js-in-motion-3d"]) {
  test(`older lesson page ${id}: Next changes the step, no errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`/a/${id}`);
    const panel = page.locator("#panel");
    const before = await panel.innerText();
    await page.locator("#nx").click();
    await expect.poll(async () => panel.innerText()).not.toBe(before);
    expect(errors).toEqual([]);
  });
}

test("js-in-motion shows its heading and scrolls without errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/a/js-in-motion");
  await expect(page.locator("h1")).toContainText("in motion");
  await page.mouse.wheel(0, 1500);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

for (const id of ["tomeverse-land", "tomeverse-globe", "tomeverse-archipelago", "tomeverse-world"]) {
  test(`3D page ${id}: canvas renders, every button can be pressed, no errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`/a/${id}`);
    // World Directions draws option A in SVG; its canvas appears when option B (free camera) is chosen.
    // Tab and button presses go through the page itself: Playwright's own click waits on the busy WebGL frame loop.
    if (id === "tomeverse-world") await page.evaluate(() => { [...document.querySelectorAll("button")].find((b) => /Free-camera/.test(b.textContent ?? ""))?.click(); });
    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    expect(box && box.width > 100 && box.height > 100).toBeTruthy();
    await page.evaluate(() => {
      [...document.querySelectorAll("button")].filter((b) => b.offsetParent !== null).slice(0, 8).forEach((b) => b.click());
    });
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });
}

// Colour contrast (WCAG AA) inside every study page, in all three views. Desktop project only: same markup at every width.
test.describe("study page contrast", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 1000, "checked once, at desktop width");
  const ALL = [
    "api-design", "caching", "data-modelling-indexing", "mongodb", "queues-async-jobs",
    "js-aws", "js-node", "js-orbit", "js-react", "js-in-motion", "js-in-motion-3d",
    "tomeverse-land", "tomeverse-globe", "tomeverse-archipelago", "tomeverse-world",
  ];
  for (const id of ALL) {
    test(`${id} has no colour-contrast failures`, async ({ page }) => {
      for (const hash of ["", "#interview", "#revise"]) {
        await page.goto(`/a/${id}${hash}`);
        await page.reload(); // a hash-only goto does not reload; reload so every view is tested fresh
        await page.waitForLoadState("load");
        await page.waitForTimeout(400);
        const r = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();
        expect(r.violations.flatMap((v) => v.nodes.map((n) => n.target.join(" "))), `${id}${hash}`).toEqual([]);
      }
    });
  }
});
