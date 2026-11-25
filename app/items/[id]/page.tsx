import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getItem, getItems, STATUS_LABEL, TYPE_LABEL } from "@/lib/catalog";
import { StatusBadge } from "@/components/site/status-badge";

export function generateStaticParams() {
  return getItems().map((i) => ({ id: i.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = getItem(id);
  return item ? { title: item.title, description: item.description } : {};
}

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = getItem(id);
  if (!item) notFound();
  const rows: [string, string][] = [
    ["Type", TYPE_LABEL[item.type]],
    ["Shelf and track", `${item.shelf} · ${item.track}`],
    ["Version", `${item.version} (${item.date})`],
    ["Status", STATUS_LABEL[item.status]],
    ["Review by", item.reviewBy],
    ...Object.entries(item.counts ?? {}).map(([k, v]) => [k, String(v)] as [string, string]),
  ];
  return (
    <div className="o-page o-section o-stack">
      <p className="o-eyebrow">{TYPE_LABEL[item.type]}</p>
      <h1 className="text-3xl font-extrabold">{item.title}</h1>
      <p className="o-lead">{item.description}</p>
      <div className="o-meta">
        <StatusBadge status={item.status} />
      </div>
      <div className="flex flex-wrap gap-3">
        <Button render={<a href={item.entry} />} size="lg">
          Open {item.title}
        </Button>
      </div>
      <dl className="o-grid">
        {rows.map(([k, v]) => (
          <div key={k} className="o-card">
            <dt className="o-eyebrow">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <p className="o-muted">
        Sources and proofs are inside the page, in the Revise section under &quot;Sources and proofs&quot;.
        {item.status === "legacy" && " This page uses the older build and was not machine-checked the same way."}
      </p>
    </div>
  );
}
