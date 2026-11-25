export type ItemType = "orbit" | "three-d" | "guide" | "pdf";
export type ItemStatus = "draft" | "verified" | "audited" | "legacy";
export type Visibility = "public" | "draft" | "hidden";

export interface CatalogItem {
  id: string;
  title: string;
  description: string;
  type: ItemType;
  shelf: string;
  track: string;
  tags: string[];
  version: string;
  date: string;
  status: ItemStatus;
  reviewBy: string;
  entry: string;
  sources: string | null;
  visibility: Visibility;
  flag: string;
  access: "public" | "account" | "hidden";
  counts?: Record<string, number>;
  prerequisites?: string[];
}

export interface SearchEntry {
  id: string;
  kind: "item" | "lesson";
  title: string;
  text: string;
  href: string;
}
