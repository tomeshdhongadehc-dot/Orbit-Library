import Link from "next/link";
import { NavLink } from "./nav-link";
import { ThemeToggle } from "./theme-toggle";
import { getFlag } from "@/lib/flags";

export function SiteHeader() {
  return (
    <header className="o-header">
      <div className="o-page o-header-in">
        <Link href="/" className="o-logo" aria-label="Orbit Library, home">
          <span className="o-logo-dot" aria-hidden="true" />
          Orbit Library
        </Link>
        <nav className="o-nav" aria-label="Main">
          <NavLink href="/items">All items</NavLink>
          {getFlag("FLAG_SEARCH") && <NavLink href="/search">Search</NavLink>}
          <NavLink href="/changelog">Changelog</NavLink>
          <NavLink href="/about">About</NavLink>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
