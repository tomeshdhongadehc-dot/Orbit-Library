import { test, expect } from "@playwright/test";

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
  for (const id of ["mongodb", "api-design", "js-orbit"]) {
    await page.goto(`/a/${id}`);
    await page.waitForLoadState("networkidle");
  }
  expect(external).toEqual([]);
});
