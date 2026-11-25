import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SearchBox } from "@/components/site/search-box";
import { getFlag } from "@/lib/flags";

export const metadata: Metadata = { title: "Search", description: "Search every item and lesson in the library." };

export default function SearchPage() {
  if (!getFlag("FLAG_SEARCH")) notFound();
  return (
    <div className="o-page o-section o-stack">
      <p className="o-eyebrow">Library</p>
      <h1 className="text-3xl font-extrabold">Search</h1>
      <SearchBox />
    </div>
  );
}
