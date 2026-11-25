import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { getItems, getShelves, getTracks, slug } from "@/lib/catalog";

describe("catalog data", () => {
  const files = readdirSync("catalog").filter((f) => f.endsWith(".json"));
  const items = files.map((f) => JSON.parse(readFileSync(`catalog/${f}`, "utf8")));

  it("has one file per id with matching names", () => {
    for (const [i, it] of items.entries()) expect(files[i]).toBe(`${it.id}.json`);
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length);
  });
  it("never claims Audited (no independent audit has been done)", () => {
    expect(items.filter((i) => i.status === "audited")).toEqual([]);
  });
  it("only lists items whose entry path matches the id", () => {
    for (const it of items) expect(it.entry).toBe(`/a/${it.id}/`);
  });
  it("gives every item its own flag name", () => {
    expect(new Set(items.map((i) => i.flag)).size).toBe(items.length);
  });
  it("legacy items do not pretend to have a version", () => {
    for (const it of items.filter((i) => i.status === "legacy")) expect(it.version).toBe("legacy");
  });
});

describe("catalog loader", () => {
  it("lists generated items sorted newest first", () => {
    const list = getItems();
    expect(list.length).toBeGreaterThan(0);
    for (let i = 1; i < list.length; i++) expect(list[i - 1].date >= list[i].date).toBe(true);
  });
  it("builds shelves and tracks that cover every item", () => {
    const total = getItems().length;
    expect(getShelves().reduce((n, s) => n + s.count, 0)).toBe(total);
    expect(getTracks().reduce((n, t) => n + t.count, 0)).toBe(total);
  });
  it("slugs are url safe", () => {
    expect(slug("3D worlds")).toBe("3d-worlds");
    expect(slug("  Data & Index! ")).toBe("data-index");
  });
});
