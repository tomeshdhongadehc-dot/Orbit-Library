import { notFound } from "next/navigation";
import Link from "next/link";
import { getItems, getShelves, getTracks, slug } from "@/lib/catalog";
import { ItemCard } from "@/components/site/item-card";

export function generateStaticParams() {
  return getShelves().map((s) => ({ shelf: s.slug }));
}

export default async function ShelfPage({ params }: { params: Promise<{ shelf: string }> }) {
  const { shelf } = await params;
  const info = getShelves().find((s) => s.slug === shelf);
  if (!info) notFound();
  const items = getItems().filter((i) => slug(i.shelf) === shelf);
  return (
    <div className="o-page o-section o-stack">
      <p className="o-eyebrow">Shelf</p>
      <h1 className="text-3xl font-extrabold">{info.name}</h1>
      <div className="flex flex-wrap gap-2">
        {getTracks(shelf).map((t) => (
          <Link key={t.slug} href={`/track/${t.slug}`} className="o-chip" data-tone="info">
            {t.name} ({t.count})
          </Link>
        ))}
      </div>
      <div className="o-grid">
        {items.map((i) => (
          <ItemCard key={i.id} item={i} />
        ))}
      </div>
    </div>
  );
}
