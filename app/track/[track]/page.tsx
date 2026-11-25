import { notFound } from "next/navigation";
import { getItems, getTracks, slug } from "@/lib/catalog";
import { ItemCard } from "@/components/site/item-card";

export function generateStaticParams() {
  return getTracks().map((t) => ({ track: t.slug }));
}

export default async function TrackPage({ params }: { params: Promise<{ track: string }> }) {
  const { track } = await params;
  const info = getTracks().find((t) => t.slug === track);
  if (!info) notFound();
  const items = getItems().filter((i) => slug(i.track) === track);
  return (
    <div className="o-page o-section o-stack">
      <p className="o-eyebrow">{info.shelf} · Track</p>
      <h1 className="text-3xl font-extrabold">{info.name}</h1>
      <div className="o-grid">
        {items.map((i) => (
          <ItemCard key={i.id} item={i} />
        ))}
      </div>
    </div>
  );
}
