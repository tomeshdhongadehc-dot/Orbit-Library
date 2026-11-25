import { describe, expect, it } from "vitest";
import { search } from "@/lib/search";
import type { SearchEntry } from "@/lib/types";

const index: SearchEntry[] = [
  { id: "a", kind: "item", title: "Mongo Orbit", text: "mongodb sharding shard key replication", href: "/items/mongodb" },
  { id: "a:1", kind: "lesson", title: "Shard key choice", text: "Mongo Orbit lesson shard-key", href: "/a/mongodb/" },
  { id: "b", kind: "item", title: "Cache Orbit", text: "redis memcached cache", href: "/items/caching" },
];

describe("search", () => {
  it("returns nothing for an empty query", () => {
    expect(search(index, "   ")).toEqual([]);
  });
  it("requires every word to match", () => {
    expect(search(index, "shard redis")).toEqual([]);
  });
  it("ranks a title match above a text match", () => {
    const hits = search(index, "shard key");
    expect(hits[0].entry.id).toBe("a:1");
    expect(hits.map((h) => h.entry.id)).toContain("a");
  });
  it("matches by prefix", () => {
    expect(search(index, "mem").map((h) => h.entry.id)).toEqual(["b"]);
  });
  it("is case-insensitive and ignores punctuation", () => {
    expect(search(index, "SHARD-KEY!").length).toBeGreaterThan(0);
  });
  it("respects the limit", () => {
    expect(search(index, "orbit", 1)).toHaveLength(1);
  });
});
