// Fails when styling escapes the one global stylesheet.
// Forbidden outside app/globals.css: hex colours, rgb()/hsl()/oklch()/color() literals, raw px values, JSX style= attributes.
// Allowed exceptions (browser APIs that cannot read CSS variables): listed in ALLOW with the reason.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOTS = ["app", "components", "lib"];
const ALLOW = {
  "app/layout.tsx": "viewport themeColor needs literal colours",
  "app/manifest.ts": "web manifest needs literal colours",
};
const SKIP_FILES = new Set(["app/globals.css", "app/icon.svg", "app/favicon.ico"]);
const RULES = [
  ["hex colour", /#[0-9a-fA-F]{3,8}\b(?![\w-])/],
  ["colour function", /\b(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\(/],
  ["raw px value", /\b\d+(?:\.\d+)?px\b/],
  ["style attribute", /\sstyle=\{?["{]/],
];

function* walk(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (/\.(tsx?|css|mjs)$/.test(n)) yield p;
  }
}

let bad = 0;
for (const root of ROOTS) {
  for (const f of walk(root)) {
    const rel = relative(".", f).split(sep).join("/");
    if (SKIP_FILES.has(rel) || ALLOW[rel]) continue;
    readFileSync(f, "utf8").split("\n").forEach((line, i) => {
      const code = line.replace(/\/\/.*$/, "");
      for (const [name, re] of RULES) {
        if (re.test(code)) {
          bad++;
          console.log(`${rel}:${i + 1}: ${name}: ${line.trim().slice(0, 100)}`);
        }
      }
    });
  }
}
console.log(bad === 0 ? "check-css OK (0 violations)" : `check-css FAILED (${bad} violations)`);
process.exit(bad === 0 ? 0 : 1);
