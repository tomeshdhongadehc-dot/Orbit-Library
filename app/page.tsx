import Link from "next/link";
import { getItems, getShelves, getTracks } from "@/lib/catalog";
import { ItemCard } from "@/components/site/item-card";
import { Button } from "@/components/ui/button";

export default function Home() {
  const items = getItems();
  const shelves = getShelves();
  const tracks = getTracks();
  const recent = items.slice(0, 6);
  return (
    <>
      <section className="o-sky">
        <div className="o-page o-section o-stack">
          <p className="o-eyebrow o-rise">Interactive study library</p>
          <h1 className="o-hero-title o-rise">Learn it by stepping through it.</h1>
          <p className="o-lead o-rise">
            {items.length} study pages with animated lessons, quizzes, interview practice, revision sheets and a
            sources and proofs tab. Every page shows its version, its date and what was checked.
          </p>
          <div className="flex flex-wrap gap-3 o-rise">
            <Button render={<Link href="/items" />} size="lg">Browse all items</Button>
            <Button render={<Link href="/about" />} size="lg" variant="outline">How it works</Button>
          </div>
        </div>
      </section>

      <section className="o-page o-section o-stack">
        <h2 className="text-2xl font-bold">Shelves</h2>
        <div className="o-grid">
          {shelves.map((s) => (
            <Link key={s.slug} href={`/shelf/${s.slug}`} className="o-card o-rise">
              <h3 className="o-card-title">{s.name}</h3>
              <p className="o-muted">
                {s.count} {s.count === 1 ? "item" : "items"} · {getTracks(s.slug).length} {getTracks(s.slug).length === 1 ? "track" : "tracks"}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="o-page o-section o-stack">
        <h2 className="text-2xl font-bold">Tracks</h2>
        <div className="flex flex-wrap gap-2">
          {tracks.map((t) => (
            <Link key={t.shelf + t.slug} href={`/track/${t.slug}`} className="o-chip" data-tone="info">
              {t.name} ({t.count})
            </Link>
          ))}
        </div>
      </section>

      <section className="o-page o-section o-stack">
        <h2 className="text-2xl font-bold">Recently updated</h2>
        <div className="o-grid">
          {recent.map((i) => (
            <ItemCard key={i.id} item={i} />
          ))}
        </div>
      </section>
    </>
  );
}
