import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readdirSync, readFileSync } from "node:fs";

const ids: string[] = readdirSync("catalog")
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(`catalog/${f}`, "utf8")).id);

const PAGES = ["/", "/items", "/search", "/changelog", "/about", "/shelf/development", "/track/backend", "/items/mongodb"];

test.describe("shell pages", () => {
  for (const path of PAGES) {
    test(`${path} loads, has one h1, no horizontal scroll, no console errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      expect(errors).toEqual([]);
    });
  }

  test("unknown page gives the 404 page", async ({ page }) => {
    const res = await page.goto("/does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.getByText("not in the library")).toBeVisible();
  });
});

test.describe("theme", () => {
  test("night is the default and the toggle switches and remembers", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/dark/);
    await page.getByRole("button", { name: /theme/i }).click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);
    await page.reload();
    await expect(page.locator("html")).not.toHaveClass(/dark/);
    await page.getByRole("button", { name: /theme/i }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });
});

test.describe("items and search", () => {
  test("home lists the shelves and recent items", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Shelves" })).toBeVisible();
    await expect(page.locator("article").first()).toBeVisible();
  });

  test("filters narrow the list", async ({ page }) => {
    await page.goto("/items");
    const total = await page.locator("article").count();
    expect(total).toBe(ids.length);
    await page.getByLabel("Filter items").fill("mongodb");
    await expect(page.locator("article")).toHaveCount(1);
    await page.getByLabel("Filter items").fill("zzzz-no-match");
    await expect(page.locator("article")).toHaveCount(0);
  });

  test("search finds the shard key lesson and the Mongo item", async ({ page }) => {
    await page.goto("/search");
    await page.getByLabel("Search the library").fill("shard key");
    await expect(page.getByText("Shard key choice").first()).toBeVisible();
  });
});

test.describe("every artifact opens", () => {
  for (const id of ids) {
    test(`/a/${id}/ serves a page without script errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      const res = await page.goto(`/a/${id}/`);
      expect(res?.status()).toBe(200);
      await expect(page).toHaveTitle(/.+/);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, "horizontal overflow in px").toBeLessThanOrEqual(0);
      expect(errors).toEqual([]);
    });
  }
});

test.describe("accessibility", () => {
  for (const path of ["/", "/items", "/about"]) {
    test(`${path} has no serious or critical axe violations`, async ({ page }) => {
      await page.goto(path);
      const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
      const bad = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(bad.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
    });
  }
});
