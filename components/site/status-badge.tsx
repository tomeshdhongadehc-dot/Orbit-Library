import { STATUS_LABEL } from "@/lib/catalog";
import type { ItemStatus } from "@/lib/types";
import { getFlag } from "@/lib/flags";

const TONE: Record<ItemStatus, string> = { draft: "warn", verified: "ok", audited: "ok", legacy: "legacy" };

export function StatusBadge({ status }: { status: ItemStatus }) {
  if (!getFlag("FLAG_STATUS_BADGES")) return null;
  return (
    <span className="o-chip" data-tone={TONE[status]} title={status === "audited" ? "Independently checked against original documents" : undefined}>
      {STATUS_LABEL[status]}
    </span>
  );
}
