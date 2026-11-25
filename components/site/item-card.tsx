import Link from "next/link";
import type { CatalogItem } from "@/lib/types";
import { BUILT_ON, TYPE_LABEL } from "@/lib/catalog";
import { StatusBadge } from "./status-badge";
import { Spotlight } from "./spotlight";

export function ItemCard({ item }: { item: CatalogItem }) {
  const stale = item.reviewBy < BUILT_ON;
  return (
    <Spotlight className="o-card o-rise">
      <div className="o-meta">
        <span className="o-chip" data-tone="info">{TYPE_LABEL[item.type]}</span>
        <StatusBadge status={item.status} />
        {stale && <span className="o-chip" data-tone="warn">May be out of date</span>}
      </div>
      <h3 className="o-card-title">
        <a href={item.entry} className="after:absolute after:inset-0" aria-label={`Open ${item.title}`}>
          {item.title}
        </a>
      </h3>
      <p className="o-muted">{item.description}</p>
      <div className="o-meta mt-auto">
        <span>{item.shelf} · {item.track}</span>
        <span>v{item.version}</span>
        <span>{item.date}</span>
      </div>
      <div className="o-meta">
        <Link href={`/items/${item.id}`} className="relative z-10 underline underline-offset-4">Details and sources</Link>
      </div>
    </Spotlight>
  );
}
