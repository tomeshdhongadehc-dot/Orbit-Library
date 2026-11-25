import type { Metadata } from "next";
import log from "@/src/generated/changelog.json";

export const metadata: Metadata = { title: "Changelog", description: "What changed in the library and in each item." };

interface Entry {
  scope: string;
  version: string;
  date: string;
  note: string;
}

export default function Changelog() {
  const entries = (log as Entry[]).slice().sort((a, b) => b.date.localeCompare(a.date) || a.scope.localeCompare(b.scope));
  return (
    <div className="o-page o-section o-stack">
      <p className="o-eyebrow">History</p>
      <h1 className="text-3xl font-extrabold">Changelog</h1>
      <ol className="o-stack">
        {entries.map((e, i) => (
          <li key={i} className="o-card">
            <div className="o-meta">
              <span className="o-chip" data-tone="info">{e.scope}</span>
              <span>v{e.version}</span>
              <span>{e.date}</span>
            </div>
            <p>{e.note}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
