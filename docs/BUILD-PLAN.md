# Orbit Library: 3-hour build plan (2026-11-25, DEVELOPMENT ONLY: deployment is a later phase)

Goal: a fast, standard-looking Orbit Library running locally in production mode in 180 minutes (no deployment now), with every existing artifact reachable, one global stylesheet driving all UI, and feature flags on every item.
Honest scope: 3 hours fits P0 plus a thin P1 (shell, catalog, search, deploy). It does NOT fit new content, the rebuilt 3D items, login, or the independent fact audit. Those stay after launch. If time runs out, the cut order is at the bottom.
Reference (look only, nothing copied): designed-to-scale.vercel.app. I read its raw HTML: a client-rendered course site with title, description, canonical link, favicon, apple-touch-icon, web manifest, `theme-color` that follows the theme, Open Graph and X link-preview tags. Its lesson layout is drawn by JavaScript and I could not see it (the browser extension is not connected). We copy the checklist of a standard site, not its design.

## 0b. What I read in the reference's raw HTML and CSS (2026-11-25), and what we take from it
Seen: a Vite single-page app (`<div id="app">` filled by one JS bundle), one 64 KB stylesheet, all colours as CSS variables on `:root` (paper, card, line, ink, muted, accent greens, violet, orange, rust), a 12px radius token, a hard offset "pop" shadow, one monospace font (JetBrains Mono), a `theme-color` meta that switches with the theme, a `noscript` message, Open Graph and manifest tags.
Not seen: its lesson layout and navigation (drawn by JavaScript; the browser extension is not connected, so I cannot render it). If you want a closer match, connect the extension or paste a screenshot of `#/stateless/1`.
We take the PATTERN only: every colour, radius and shadow is a variable in one stylesheet; light and dark themes by swapping variables; a warm paper-like surface option; bordered cards with a small offset shadow; metadata and noscript text. We do not copy its colours, text, name or layout. Our default look stays the Orbit palette unless you choose the paper look (one-line decision: `paper` or `night` as the default theme).

## 1. The rule that makes UI consistent: one global stylesheet
- One file `app/globals.css` holds ALL tokens as CSS variables: colour (both themes), type scale, spacing scale, radius, shadow, motion, z-index, breakpoints notes. shadcn/ui already reads its colours from variables, so we map them there.
- Every component takes values only from tokens (`var(--space-3)`, Tailwind classes mapped to tokens in the Tailwind theme block). No hex colours, no raw px, no inline styles outside `globals.css`.
- Enforced by a 20-line check (`tools/check-css.mjs`) that fails the build when it finds a hex colour, a raw `px` value or a `style=` attribute outside `globals.css`. Same idea as the ratchet rules you use at work.
- Orbit artifact pages keep their own CSS for now. The shell links them; it never restyles them.

## 2. Fast loading rules (each is checked)
- Home, shelf, track and item pages are pre-built at deploy time (static generation). No data fetching in the browser except the search index.
- Almost no client JavaScript: theme toggle, search box, filters. Everything else is server-rendered HTML.
- Fonts: self-hosted through `next/font` (Sora, DM Sans, Fira Code), `display: swap`, only the weights used.
- No images on the home page except an SVG logo. Cards are text.
- Artifacts are separate pages opened on click, so the home never loads their 1.2 MB.
- Search index is one small JSON loaded only when the search box is focused.
- Measure, then set the budget: run Lighthouse on the preview and record the numbers in `docs/perf.md` (no invented targets). Rule: do not ship a change that makes the recorded numbers worse.

## 3. Standard-website checklist (all in the 3 hours)
Header with logo, nav, search, theme toggle; skip-to-content link; footer with version, date, licence note, sources policy link; 404 page; `robots.txt` and `sitemap.xml` generated from the catalog; favicon (SVG), apple-touch icon, web manifest; per-page title and description; canonical link; Open Graph and X tags; `theme-color` per theme; `lang="en"`; semantic landmarks (header, nav, main, footer); visible focus; contrast checked in both themes; works at 375px with no horizontal scroll; prefers-reduced-motion respected; no third-party requests.

## 4. Pages (the whole v1 site)
`/` home (hero line, shelves grid, "recently updated" list) ; `/shelf/[shelf]` ; `/track/[track]` ; `/a/[id]` is the artifact itself (static folder) ; `/items` all items with filters (shelf, track, type, level, status) ; `/search` ; `/changelog` ; `/about` (what this is, evidence tags, how to read statuses, licence) ; `/404`.
Item card (one component, tokens only): title, type label, shelf and track, level, minutes, version, date, status badge, one-line description, button "Open".

## 5. Data
`catalog/<id>.json` per artifact, validated. Fields: id, title, description, type (`orbit|three-d|guide|pdf`), shelf, track, tags, level, minutes, version, date, status (`draft|verified|audited`), reviewBy, entry, sources, visibility (`public|draft|hidden`), flag (name of the runtime flag), access (`public` now). Initial items (from what exists): API design, data modelling and indexing, caching, queues and async jobs, MongoDB; JS Orbit, React Orbit, Node Orbit, AWS Orbit; JS in Motion, JS in Motion 3D; Tomeverse world, land, archipelago, globe. Per your decision all are `public` on day one, each with its own flag.
Honest labels on the cards: status shows `verified` only where the check scripts passed and `audited` for none. Earlier JS, React, Node, AWS and 3D items show status `legacy` (older format, not machine-checked the same way). Add `legacy` to the status list.

## 6. Time boxes (180 minutes, with a gate at the end of each)
| Min | Block | Output | Gate (must pass to continue) |
|---|---|---|---|
| 0 to 15 | Scaffold | Next.js (App Router, TypeScript strict) and Tailwind in `Orbit-Library`; shadcn/ui init; `pnpm` lockfile; `.gitignore`; README; first commit | `pnpm build` passes on an empty page |
| 15 to 40 | Global CSS and layout | `globals.css` tokens (light and dark), fonts, layout with header, footer, skip link, theme toggle; `check-css` script | page renders in both themes at 375px, `check-css` passes |
| 40 to 70 | Catalog and build tool | `catalog/*.json` for the 13 items; `tools/build_library.py` (copies `dist/*.html` and earlier pages into `public/a/<id>/index.html`, applies visibility filter, writes generated catalog and search JSON); validation and visibility check | build produces `public/a/*`; non-public test item absent from output |
| 70 to 110 | Pages and components | home, shelves, tracks, items with filters, item card, status badge, about, changelog, 404, robots, sitemap, metadata | every page builds; all links resolve (link check) |
| 110 to 130 | Search | build-time index, client search with keyboard support | known queries find the right items ("shard key" finds MongoDB) |
| 130 to 150 | QA | Playwright smoke tests: home, one item per type opens, search, theme, 375 and 1280 px no horizontal scroll; axe pass on home; Lighthouse numbers recorded | all green; failures fixed or the item flagged off |
| 150 to 170 | Production-mode check (local, no deploy) | `next build` then `next start` locally; Lighthouse on the local production build; `vercel.json` headers written but not used; deploy checklist file `docs/deploy-later.md` | local production build passes all tests and budgets recorded |
| 170 to 180 | Wrap | README, `docs/flags.md`, changelog line 0.1.0 with date, push to GitHub, save offline copy of `site` | repo pushed, URL recorded |

## 7. What I need from you inside the 3 hours
Nothing for Vercel now (deployment is later). I will ask you to look at the local site (http://localhost:3000) at the end of the pages block and at the end of the QA block. I commit as the personal noreply identity, never the company email.

## 8. Risks and the cut order if we run late
Likely slips: Vercel CLI login, a single-file page that breaks under the wrapper, the 375px fixes. Cut in this order: (1) filters on `/items`, (2) changelog page, (3) Playwright beyond the smoke test, (4) search (keep a plain list). Never cut: global CSS check, visibility check, link check, the 375px check, the Vercel Terms working rule.
Not in these 3 hours: new topics (Express, scalability, multi-tenancy, security basics), rebuilt 3D items, login, independent audit, custom domain.

## 9. Facts still to confirm while building [U]
shadcn/ui licence (read the repository), exact Next.js and Tailwind versions the scaffold installs (pin them), Vercel per-file and total size limits (measure on the first deploy; the 12 MB of Orbit pages plus earlier pages is well under the 100 MB Hobby CLI upload limit stated in the docs), Vercel CLI login flow.

## 10. Development levels (quality levels) applied now
L1 static checks: TypeScript strict, ESLint, `check-css`, catalog schema, visibility check. L2 unit tests: flags, catalog loader, search scorer, access policy (Vitest). L3 build checks: link check, no external requests, size and file count report. L4 component and page checks: render tests for card, badge, filters. L5 browser tests (Playwright) at 375, 768, 1280 px, axe, keyboard path. L6 content checks: every artifact opens, version and date match its changelog. L7 production-mode run: `next build` and `next start`, Lighthouse numbers recorded. L8 review: self code review pass and a list of known gaps. Deployment and the Vercel Terms working rule move to the deploy phase.
