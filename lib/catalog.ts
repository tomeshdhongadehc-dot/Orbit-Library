import raw from "@/src/generated/catalog.json";
import meta from "@/src/generated/meta.json";
import type { CatalogItem } from "./types";
import { getFlag, itemEnabled } from "./flags";

const all = raw as CatalogItem[];

/** Date of the last library build. Staleness is judged against this, so pages stay static. */
export const BUILT_ON: string = meta.builtOn;

export function getItems(): CatalogItem[] {
  return all
    .filter((i) => i.visibility === "public" || (i.visibility === "draft" && getFlag("FLAG_SHOW_DRAFTS")))
    .filter((i) => itemEnabled(i.flag))
    .filter((i) => i.type !== "three-d" || getFlag("FLAG_3D_ITEMS"))
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

export function getItem(id: string) {
  return getItems().find((i) => i.id === id);
}

export function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function getShelves() {
  const m = new Map<string, number>();
  for (const i of getItems()) m.set(i.shelf, (m.get(i.shelf) ?? 0) + 1);
  return [...m].map(([name, count]) => ({ name, slug: slug(name), count }));
}

export function getTracks(shelf?: string) {
  const m = new Map<string, { shelf: string; count: number }>();
  for (const i of getItems()) {
    if (shelf && slug(i.shelf) !== shelf) continue;
    const k = `${i.shelf}|${i.track}`;
    m.set(k, { shelf: i.shelf, count: (m.get(k)?.count ?? 0) + 1 });
  }
  return [...m].map(([k, v]) => ({ name: k.split("|")[1], shelf: v.shelf, slug: slug(k.split("|")[1]), count: v.count }));
}

export const STATUS_LABEL = {
  draft: "Draft",
  verified: "Verified",
  audited: "Audited",
  legacy: "Legacy format",
} as const;

export const TYPE_LABEL = {
  orbit: "Orbit lessons",
  "three-d": "3D",
  guide: "Guide",
  pdf: "PDF",
} as const;
