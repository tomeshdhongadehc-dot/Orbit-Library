# Orbit Library: base architecture (DRAFT 2, 2026-11-25)

Scope: how the website is built and hosted on Vercel so every study artifact (Orbit pages, 3D pages, guides, PDFs, future types) lives in one place. Technical authority; `LIBRARY-PLAN.md` holds content and release plans. Nothing is built or uploaded yet.
Tags: [V] read in the original document on 2026-11-25, [D] design decision (reasoned, not a fact), [U] not verified, check before relying on it.

## 0. What changed from Draft 1 (your decisions on 2026-11-25)
| Your decision | Effect on the design |
|---|---|
| Free Vercel (Hobby), zero cost | Stay inside Hobby limits. No paid add-ons. Password Protection is not available on Hobby [V], so it is not used. |
| Visible to everyone, controlled by feature flags | The site is public. "Hidden" must mean "not in the deployed files at all" (section 4). Flags decide what is visible, not secrecy. |
| Later, everything behind user logins | Design the hooks now (an `access` field per item, a gate in front of artifact files) so login is a switch, not a rebuild. |
| shadcn/ui for UI | shadcn/ui is a React plus Tailwind component set, so the shell becomes React. That means Next.js, replacing Draft 1 decision A1 (no framework). |
| Recommend 3D libraries | Section 8. |
The earlier private-first rule (N1) is replaced by a public-with-review rule. A public site needs a content review before every publish (section 10).

## 1. Requirements
Functional: F1 one home listing every artifact by shelf and track, with search and filters. F2 any artifact type can be added later with no shell change. F3 every artifact shows version, date, status and sources. F4 each artifact also works offline from a downloaded folder. F5 feature flags control what is visible. F6 a path to login-only access later.
Non-functional: N1 nothing unreviewed, secret or company-related is ever published. N2 deploy by one command or one merge, rollback in minutes. N3 zero running cost, no server we patch, no database in v1. N4 works at 375px, keyboard usable, light and dark. N5 the 20th artifact costs the same as the 3rd. N6 no secrets in repo or site.
Constraints: C1 finished Orbit pages and earlier JS, React, Node, AWS and 3D pages are single HTML files that work; do not rewrite them to launch. C2 Tomeverse source is not modified; copies only. C3 launch fast with the fewest moving parts.

## 2. Architecture in one picture
```
git repo (private)                    build (local or CI)                           Vercel Hobby (free)
------------------                    -------------------                           -------------------
topics/<slug>  --python build_topic-->  public/a/<id>/index.html   (single-file Orbit pages, unchanged)
three-d/<id>   --npm build----------->  public/a/<id>/...          (3D pages)
guides/<id>    --copy---------------->  public/a/<id>/...
catalog/*.json --validate+filter----->  src/generated/catalog.json, search.json    Next.js app (App Router)
app/ (React, Tailwind, shadcn/ui)  --next build--> shell pages: /, /shelf/*, /track/*, /search, /changelog
proxy.ts (gate, reads flags) ---------------------------------------------------->  runs before every request
```
Decision [D]: one Next.js project deployed normally on Vercel (not `output: 'export'`). Artifacts are plain static files under `public/a/<id>/`. The shell is React.

## 3. Key decisions (each becomes a short ADR)
| ADR | Decision | Why | Revisit when |
|---|---|---|---|
| A1 | Next.js App Router plus TypeScript strict plus Tailwind plus shadcn/ui for the shell. Deployed as a normal Next app, not a static export. | shadcn/ui needs React and Tailwind. Static export does not support Proxy, Headers, Redirects, Rewrites, Cookies or Server Actions [V: Next.js static exports guide, updated 2026-08-09; Proxy page, 2026-11-18], and we need Proxy for the later login gate. | Never expected. |
| A2 | Artifacts stay as static HTML folders at `/a/<id>/`, opened as their own page (not an iframe, not converted to React). | Single-file pages were never written to share a window; isolation; offline works; no rewrite (C1). | Never. |
| A3 | `catalog/<id>.json` per artifact: type, title, shelf, track, tags, prerequisites, version, date, status, review-by, entry file, sources file, `visibility`, `access`. Shell pages are generated from these only. | One schema gives F2 and N5. | A field is missing: add a field, never a special case. |
| A4 | Artifact types are an open list: `orbit`, `three-d`, `guide`, `pdf`, `app`. | New material is just a new item. | A type needs its own viewer. |
| A5 | Search index is built from data (titles, lessons, concepts, cheat rows, tags), not by crawling pages. | Orbit pages draw content with JavaScript. | Index too big: split per shelf. |
| A6 | Build artifacts outside Vercel, put output in `public/`, deploy. Vercel runs only `next build`. | Our Python and Node tools stay under our control. | Preview deploys per pull request wanted: connect Git. |
| A7 | Behaviour (headers, redirects) lives in `next.config` and `vercel.json` in git. | Reviewable, reproducible. | Never. |
| A8 | Self-host fonts, three.js and every library. No third-party requests at run time. | Offline, privacy, simple CSP. | Never. |
| A9 | Version snapshots: `/a/<id>/` is latest. A fact-changing (major) version is also kept at `/a/<id>/v/<version>/`. | Stable links for old facts without storing everything forever. | Size budget hit. |
| A10 | Feature flags: three layers (section 4). Start with the simplest. | Free plan, no extra service in v1. | Flags need to change without redeploy: use Edge Config (now called Global Config). |
| A11 | Access policy per item (`access: public | account | hidden`) plus one gate in `proxy.ts`. Login provider is chosen later (ADR A12, not now). | F6 without rebuild. | Login work starts. |

## 4. Feature flags and "visible to all" (the part that is easy to get wrong)
Rule [D]: a flag in the browser hides nothing. Everything inside `public/` can be downloaded by anyone who knows or guesses the URL. So:
1. Build-time visibility (the real control). `visibility` in each `catalog` file: `public` (built into the output), `draft` (built only in local or preview builds, never in production), `hidden` (never built). Production builds exclude every file of a non-public item, including its `/a/<id>/` folder, search entries and catalog row. A check fails the build if a non-public id appears anywhere in `public/`, `catalog.json` or `search.json`.
2. Runtime flags (look and behaviour, not secrecy): a small `flags.ts` with `getFlag(name)` reading environment variables now (for example `FLAG_SEARCH`, `FLAG_3D`, `FLAG_AUTH_REQUIRED`). Changing one means a redeploy, which is fine on Hobby. Later `getFlag` can read Edge Config. Facts: Edge Config is now named Global Config; Hobby is listed with 1 store, 1 MB, first 100,000 reads and 100 writes, writes take up to 10 seconds to spread [V: limits page, 2026-07-29]. Vercel's own Flags page does not state plan or limits [V: flags page, 2026-09-15], so do not depend on it.
3. Gate (for later login): `proxy.ts` runs before every request, including files in `public/` [V: Proxy page, 2026-11-18; "Without a `matcher`, Proxy runs on every request", includes `public/` assets]. In v1 it only sets headers and checks `FLAG_AUTH_REQUIRED`, which is `false`. When login arrives, items with `access: account` are matched by path and need a session. In Next.js 16 the old `middleware` file is renamed `proxy` [V: same page]. The matcher values must be constants [V].
Consequence: any artifact that must never be public goes through level 1 (not built) until login exists. Do not rely on level 3 for secrecy until it is built and tested.
Flag list v1 (all documented in `docs/flags.md`): `FLAG_AUTH_REQUIRED` (false), `FLAG_SEARCH` (true), `FLAG_3D_ITEMS` (true), `FLAG_STATUS_BADGES` (true), `FLAG_SHOW_DRAFTS` (preview only).

## 5. Vercel Hobby facts used
Verified 2026-11-25 on Vercel docs [V] (page dates in brackets):
- Build time limit 45 minutes; Hobby projects 200; Hobby domains per project 50; CLI upload 15,000 files and 100 MB on Hobby [limits, 2026-09-16].
- Hobby Fast Data Transfer: first 100 GB [fair-use, 2026-11-12].
- Functions on Hobby: 2 GB memory, 300 s maximum duration, 250 MB uncompressed bundle, 4.5 MB request body [functions limitations, 2026-08-24].
- Password Protection not on Hobby; Vercel Authentication listed for Hobby [deployment-protection, 2026-09-15]. With a public site we do not use either now.
- `vercel.json` supports headers, redirects, rewrites, cleanUrls, trailingSlash [project-configuration, 2026-08-25].
Not verified, settle before launch [U]:
- Whether Hobby may host this site. The pages read have no personal or commercial rule; the Terms of Service fair-use section was not read. A public learning site on a company account may count as commercial. Read the Terms first. If it is not allowed, the fallback with zero cost is another free static host (a separate decision), or the Pro plan.
- Per-file size limit for static files in `public/`, and the total output size limit for a Next deployment. Not stated on the pages read. Measure with a real deploy.
- Hobby behaviour when bandwidth passes the included amount.

## 6. Repository layout
```
orbit-library/
  app/                  Next.js routes (shell): /, /shelf/[s], /track/[t], /items, /search, /changelog, /about
  components/ui/        shadcn/ui components (copied into the repo by the shadcn tool)
  components/orbit/     our own components: ItemCard, StatusBadge, VersionLabel, FilterBar
  lib/                  flags.ts, catalog.ts, search.ts, access.ts
  proxy.ts              the gate (headers now, login later)
  catalog/<id>.json     one file per artifact (schema in schema/)
  topics/<slug>/        Orbit sources (parts, research, tests, CHANGELOG)
  engine/               shared Orbit engine
  three-d/<id>/         3D sources and assets
  guides/<id>/          long-form HTML or PDF
  tools/                build_library.py, validate, visibility check, size report, link check, offline zip, quiz and overlap tools
  tests/                Playwright tests (shell and one smoke test per artifact)
  public/a/<id>/        generated artifact output (git-ignored)
  src/generated/        generated catalog.json and search.json (git-ignored)
  docs/                 FORMAT, WRITER-BRIEF, PLAN, flags.md, ADRs
```
Phase 0 shortcut: leave `backend-orbit` where it is. `tools/build_library.py` reads `dist/`, `OFFLINE/earlier-pages/` and the 3D copies and writes `public/a/`.

## 7. UI: shadcn/ui
- What it is [V: shadcn install page]: you run `pnpm dlx shadcn@latest init -t next` to set up the project and `pnpm dlx shadcn@latest add button` to add components; it assumes the create-next-app defaults (Tailwind, App Router, `@/*` alias). The component code is copied into our repo, so we own it.
- The page states no supported-version table and no licence text [V]. Before installing: read the licence in the repository and record it; use whatever versions `create-next-app@latest` and the shadcn tool produce, then pin them in the lockfile.
- Components we expect to use: Button, Card, Badge (status), Tabs, Input and Command (search), Dialog, Sheet (mobile filters), Select, Toggle and Switch (theme), Tooltip, Skeleton, Separator. Anything else is added when a page needs it.
- Design tokens are CSS variables (shadcn style) mapped to the Orbit night-sky palette in both themes. Orbit artifact pages keep their own styles.
- Accessibility is checked on our composed pages (axe and keyboard), not assumed from the component library.

## 8. 3D recommendations
Principle: existing 3D pages (Tomeverse) are vanilla three.js and stay as they are. New 3D items for the React-based shell use the React renderer. Pick one stack for new work, so each item does not invent its own.
| Need | Recommendation | Why | Status |
|---|---|---|---|
| Core engine | three (three.js) | The standard WebGL library; the other options below build on it. | [U] check current version and licence on npm and the repo at install time |
| React integration | @react-three/fiber (R3F) v9 with React 19 | Pairs v8 with React 18 and v9 with React 19; install is `pnpm add three @react-three/fiber`; Next.js 13.1 or later needs `transpilePackages: ['three']` [V: R3F install page, docs v9.8.2; date not shown]. Scenes are React components, so they fit the shell. | [V] pairing; Next 16 compatibility [U] test in P2 |
| Helpers | @react-three/drei (cameras, controls, text, loaders, environment) | Saves writing common pieces. | [U] not read; verify exports and licence before use |
| Physics (only when a lesson needs it) | @react-three/rapier | Common choice in the R3F world. | [U] not read; verify |
| Post effects (optional) | @react-three/postprocessing | Bloom, depth of field. Costs performance on phones; off by default. | [U] not read; verify |
| Animation of UI (not 3D) | motion (formerly Framer Motion) | UI transitions in the shell. | [U] not read; verify |
| Debug panels | leva (development only, not shipped) | Tune values live. | [U] not read; verify |
| Alternatives, not chosen | Babylon.js (a full engine, heavier, different style); `<model-viewer>` (simple glTF viewing only); Spline (hosted editor, adds a third-party runtime, conflicts with A8) | Listed so the choice is on record. | [D] |
Rules for every 3D item [D]: client component only, loaded with a dynamic import so it never slows the shell; a poster image and text description when WebGL is missing; reduced-motion respected; touch controls; frame time and asset size measured on a real mid phone and then written as the budget (no invented numbers); models in glTF, compressed after measuring; every library file served from our own site.
Content rule: the lesson text inside a 3D scene is data in a JSON file so it can be fact-checked like Orbit content.

## 9. Build and deploy pipeline
1. `tools/validate.py`: catalog schema, unique ids, prerequisites exist and have no cycle, entry files exist, version in catalog equals page and changelog.
2. Build each artifact (Orbit: `build_topic.py` and its checks; 3D: bundler; guides: copy).
3. `tools/build_library.py`: filter by visibility (section 4), copy to `public/a/`, write `catalog.json` and `search.json`.
4. Production checks: no non-public id anywhere in output; no external requests in artifact files; no secret patterns; internal links resolve; total size and file count against budgets (set after the first measured build); headers present.
5. `next build`, then deploy a Preview, run browser tests on the preview URL, then promote to production.
6. Rollback: promote the previous deployment in Vercel (confirm the exact feature name in the docs [U]) or redeploy the previous build.
7. `tools/make_offline.py`: same artifact folders with relative links, zipped.

## 10. Security and publishing rules (public site)
- Content review before each publish: no secrets, no company or personal data, no copied document text, quotes within limits, statuses honest (nothing shows Audited unless it was). The visibility check in section 9 enforces what can be enforced; the rest is a written checklist signed off in the changelog.
- Headers (in `proxy.ts` or `next.config`): Content-Security-Policy, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, framing control. Orbit pages use inline scripts, so the CSP for `/a/*` allows inline script, while the shell uses a stricter policy [D]. Verify current OWASP recommendations before fixing values [U].
- No third-party scripts or fonts. Pinned dependencies, lockfile committed, audit step in CI.
- No secrets in repo; `.env*` git-ignored and never read by tooling; secret scanning in CI; deploy token only in CI secrets.
- Vercel account: two-factor sign-in, least-privilege roles.
- Login later (A12, decided then): threat model first; candidates to evaluate are Supabase Auth (you already use it; check free-tier limits [U]) or another provider; sessions checked in `proxy.ts`; account-only artifacts served only after the check; tests that try to open a gated artifact while logged out.

## 11. Quality gates
Content scripts per topic; catalog schema; visibility check; browser tests at 375, 768 and 1280 px for the shell plus one smoke test per artifact (opens, no console errors, no horizontal scroll); axe and keyboard checks; offline test with network off; logged-out test of every `account` or `hidden` item (must be unreachable) before each production deploy.

## 12. Phases with exit criteria
- P0 Prove the pipeline. Create the Next project with shadcn/ui, a plain page listing the existing artifacts, flags file, `proxy.ts` that only sets headers. Deploy to Vercel (preview, then production). Exit: all listed artifacts open on desktop and 375px; visibility check demonstrated with one `hidden` test item that is absent from the output; rollback tried once.
- P1 Catalog and shell: `catalog/*.json` for every item; home, shelves, tracks, filters, search, status and version display. Exit: every public item found by browse and search; validation, visibility and link checks green.
- P2 Artifact wrapper, offline zip, 3D template with the R3F stack and a first rebuilt 3D item. Exit: 3D acceptance checks pass on a real phone.
- P3 Content growth and audits (Express, scalability, multi-tenancy, security basics).
- P4 Login: threat model, provider choice, `access: account` items behind `proxy.ts`, per-user progress. Exit: logged-out tests cannot reach gated files.

## 13. Risks
| Risk | Impact | Mitigation |
|---|---|---|
| Hobby terms do not allow this use | High | Read the Terms before launch [U]; fallback decided then |
| Something private ends up public | High | Build-time visibility filter plus check; content review checklist; nothing sensitive is ever in the repo |
| Large 3D assets or many files hit limits | Medium | Measure early; compress; lazy load; keep file count low |
| shadcn/Tailwind or Next major updates break the shell | Medium | Pin versions; update on a branch with tests |
| Login added late requires moving files | Medium | `access` field and `proxy.ts` gate designed in now |
| Wrong fact published on a public site | High | Evidence tags, source priority, audit before the green badge, review-by dates |
| Over-building before launch | Medium | P0 is only the pipeline plus a link list |

## 14. Decisions (updated 2026-11-25)
Closed:
- Name: Orbit Library.
- Repository: new repo `tomeshdhongadehc-dot/Orbit-Library` (public, created). Tomeverse stays separate (ADR A13).
- Public on day one: ALL items, including the earlier JS, React, Node, AWS and Tomeverse 3D pages. Each item still has its own `visibility` and runtime flag (section 4), so any item can be switched off by one catalog change and a redeploy. Switching off removes the files from the next deploy; it does not unpublish what was already downloaded.
- Hobby terms, read 2026-11-25 [V: Vercel Terms, Last Updated October 19, 2026, Section 4]: "You shall only use the Services under a Hobby plan for your personal or non-commercial use." The Terms do not say whether a free public learning site counts, and say Vercel may disable a Hobby project "with or without notice". The Hobby docs page has no use rule. Only the first part of the Terms was read verbatim; a fair-use clause was not found. This is not legal advice.
  Working rule [D]: keep the site personal and non-commercial (no ads, no selling, no client or company work, nothing from the employer), and create the Vercel project under the personal account, not a company team. If that changes, move to Pro first.
Still open: the Vercel account to use (personal, per the rule above), and CI (deploy from your machine until you ask for GitHub Actions).
