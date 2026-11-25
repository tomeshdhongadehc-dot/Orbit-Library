"use client";
import { useMemo, useState } from "react";
import type { CatalogItem } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { ItemCard } from "./item-card";

type Opt = { value: string; label: string };

function Group({ label, options, value, onChange }: { label: string; options: Opt[]; value: string; onChange: (v: string) => void }) {
  return (
    <fieldset className="flex flex-wrap items-center gap-2">
      <legend className="o-eyebrow mb-1">{label}</legend>
      {[{ value: "", label: "All" }, ...options].map((o) => (
        <button
          key={o.value}
          type="button"
          className="o-chip"
          data-tone={value === o.value ? "info" : undefined}
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </fieldset>
  );
}

export function ItemBrowser({ items }: { items: CatalogItem[] }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [shelf, setShelf] = useState("");
  const [status, setStatus] = useState("");

  const opts = (f: (i: CatalogItem) => string, label?: (v: string) => string): Opt[] =>
    [...new Set(items.map(f))].sort().map((v) => ({ value: v, label: label ? label(v) : v }));

  const shown = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return items.filter((i) => {
      if (type && i.type !== type) return false;
      if (shelf && i.shelf !== shelf) return false;
      if (status && i.status !== status) return false;
      const hay = `${i.title} ${i.description} ${i.tags.join(" ")} ${i.track}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }, [items, q, type, shelf, status]);

  return (
    <div className="o-stack">
      <Input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Filter by title, topic or tag"
        aria-label="Filter items"
      />
      <Group label="Type" options={opts((i) => i.type)} value={type} onChange={setType} />
      <Group label="Shelf" options={opts((i) => i.shelf)} value={shelf} onChange={setShelf} />
      <Group label="Status" options={opts((i) => i.status)} value={status} onChange={setStatus} />
      <p className="o-muted" aria-live="polite">
        Showing {shown.length} of {items.length}
      </p>
      <h2 className="o-visually-hidden">Results</h2>
      <div className="o-grid">
        {shown.map((i) => (
          <ItemCard key={i.id} item={i} />
        ))}
      </div>
    </div>
  );
}
