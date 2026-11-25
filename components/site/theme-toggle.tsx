"use client";
import { Moon, Sun } from "lucide-react";
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
    <Button variant="outline" size="sm" className="o-theme-btn" onClick={toggle} aria-label="Switch between night and light theme">
      <span className="o-theme-label" data-for="dark"><Moon aria-hidden="true" />Night</span>
      <span className="o-theme-label" data-for="light"><Sun aria-hidden="true" />Light</span>
    </Button>
  );
}
