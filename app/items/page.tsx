import type { Metadata } from "next";
import { getItems } from "@/lib/catalog";
import { ItemBrowser } from "@/components/site/item-browser";

export const metadata: Metadata = { title: "All items", description: "Every study page in the library, with filters." };

export default function ItemsPage() {
  return (
    <div className="o-page o-section o-stack">
      <p className="o-eyebrow">Library</p>
      <h1 className="text-3xl font-extrabold">All items</h1>
      <ItemBrowser items={getItems()} />
    </div>
  );
}
