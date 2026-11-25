# Orbit Library

A library of interactive study pages: animated lessons, quizzes, interview practice, revision sheets and a sources and proofs tab. This repository is the website shell (Next.js, Tailwind, shadcn/ui). The study pages themselves are built elsewhere and copied in by `tools/build-library.mjs`.

Status: development build 0.1.0. Not deployed. See `docs/` for the plans.

## Run it
```
pnpm install
pnpm dev            # development server on http://localhost:3000
pnpm verify         # css rule check, lint, unit tests, production build
pnpm test:e2e       # browser tests at 375, 768 and 1280 px (needs: pnpm exec playwright install chromium)
```
`pnpm build` first runs `tools/build-library.mjs`, which needs the study-page sources. Set `ARTIFACT_ROOT` to the folder that holds `dist/`, `OFFLINE/earlier-pages/` and `topics/` (default: `../React-Study/backend-orbit`).

## How it is organised
- `app/globals.css` is the one style file. Every colour, size, radius, shadow, speed and effect is a variable there. Change PART 1 (the palette) to restyle the whole site. `tools/check-css.mjs` fails if styling appears anywhere else.
- `catalog/<id>.json` describes each study page (type, shelf, track, version, date, status, visibility, flag). Pages in the shell are generated from these files only.
- `lib/flags.ts` holds feature flags. `FLAG_ITEM_<ID>=false` switches one item off. `FLAG_SEARCH`, `FLAG_3D_ITEMS`, `FLAG_STATUS_BADGES`, `FLAG_SHOW_DRAFTS`, `FLAG_AUTH_REQUIRED` are the global ones (see `docs/flags.md`).
- `visibility` in a catalog file is the real control: items that are not `public` are never copied into the build.
- `public/a/<id>/` (generated, not committed) holds each study page. `public/search.json` is the search index.

## Rules
- Nothing sensitive goes in this repository. It is public.
- A page is `audited` only after an independent check against original documents. None is yet; the tests fail if a catalog file claims it.
- Deployment is a later phase. See `docs/deploy-later.md`.
