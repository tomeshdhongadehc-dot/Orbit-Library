import { afterEach, describe, expect, it } from "vitest";
import { getFlag, itemEnabled } from "@/lib/flags";

afterEach(() => {
  delete process.env.FLAG_SEARCH;
  delete process.env.FLAG_ITEM_X;
  delete process.env.FLAG_AUTH_REQUIRED;
});

describe("flags", () => {
  it("uses the documented defaults", () => {
    expect(getFlag("FLAG_SEARCH")).toBe(true);
    expect(getFlag("FLAG_AUTH_REQUIRED")).toBe(false);
  });
  it("lets the environment override", () => {
    process.env.FLAG_SEARCH = "false";
    expect(getFlag("FLAG_SEARCH")).toBe(false);
    process.env.FLAG_AUTH_REQUIRED = "true";
    expect(getFlag("FLAG_AUTH_REQUIRED")).toBe(true);
  });
  it("ignores values that are not exactly true or false", () => {
    process.env.FLAG_SEARCH = "yes";
    expect(getFlag("FLAG_SEARCH")).toBe(true);
  });
  it("turns an item off with its own flag and defaults to on", () => {
    expect(itemEnabled("FLAG_ITEM_X")).toBe(true);
    process.env.FLAG_ITEM_X = "false";
    expect(itemEnabled("FLAG_ITEM_X")).toBe(false);
  });
});
