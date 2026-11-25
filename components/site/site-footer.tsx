import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="o-footer">
      <div className="o-page o-stack">
        <p>
          Orbit Library 0.1.0. Every study page shows its own version, date and sources. A page is
          marked Audited only after an independent check against the original documents; none is yet.
        </p>
        <p>
          <Link href="/about">How to read the statuses</Link> · <Link href="/changelog">Changelog</Link>
        </p>
      </div>
    </footer>
  );
}
