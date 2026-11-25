"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { search, type Hit } from "@/lib/search";
import type { SearchEntry } from "@/lib/types";

export function SearchBox() {
  const loading = useRef<Promise<SearchEntry[] | null> | null>(null);
  const latest = useRef("");
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");

  // One shared load promise, so a query typed while the index is loading is answered when it arrives.
  function ensure(): Promise<SearchEntry[] | null> {
    if (!loading.current) {
      setState("loading");
      loading.current = fetch("/search.json")
        .then((res) => {
          if (!res.ok) throw new Error(String(res.status));
          return res.json() as Promise<SearchEntry[]>;
        })
        .then((data) => {
          setState("ready");
          return data;
        })
        .catch(() => {
          loading.current = null;
          setState("error");
          return null;
        });
    }
    return loading.current;
  }

  async function onChange(v: string) {
    latest.current = v;
    setQ(v);
    const idx = await ensure();
    if (idx && latest.current === v) setHits(search(idx, v));
  }

  return (
    <div className="o-stack">
      <Input
        type="search"
        autoFocus
        value={q}
        onFocus={() => void ensure()}
        onChange={(e) => void onChange(e.target.value)}
        placeholder="Search items and lessons, for example: shard key"
        aria-label="Search the library"
      />
      <p className="o-muted" aria-live="polite">
        {state === "loading" && "Loading the index..."}
        {state === "error" && "The search index could not be loaded."}
        {state === "ready" && q && `${hits.length} result${hits.length === 1 ? "" : "s"}`}
      </p>
      <ul className="o-stack">
        {hits.map(({ entry }) => (
          <li key={entry.id} className="o-card">
            <span className="o-meta">{entry.kind === "item" ? "Item" : "Lesson"}</span>
            {entry.href.startsWith("/items") ? (
              <Link href={entry.href} className="o-card-title underline underline-offset-4">{entry.title}</Link>
            ) : (
              <a href={entry.href} className="o-card-title underline underline-offset-4">{entry.title}</a>
            )}
            <p className="o-muted">{entry.text.slice(0, 160)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
