"use client";
import { Button } from "@/components/ui/button";

/**
 * The theme lives on <html class="dark"> (set before first paint by the script in layout.tsx).
 * The label is chosen by CSS from that class, so no React state is needed and there is no flash.
 */
export function ThemeToggle() {
  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("orbit-theme", next ? "dark" : "light");
    } catch {}
  }
  return (
    <Button variant="ghost" size="sm" onClick={toggle} aria-label="Switch between night and light theme">
      <span className="o-theme-label" data-for="dark">Night</span>
      <span className="o-theme-label" data-for="light">Light</span>
    </Button>
  );
}
