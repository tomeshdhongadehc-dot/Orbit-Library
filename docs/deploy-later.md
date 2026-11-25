# Deployment checklist (not done yet)

Do not deploy until every box is ticked and the owner says go.

- [ ] Read the Vercel Terms. Section 4 (Hobby): "personal or non-commercial use" only. Create the project under the personal account, no ads, no selling, nothing from an employer.
- [ ] Decide `NEXT_PUBLIC_SITE_URL` (the canonical address) and set it as a project environment variable.
- [ ] `pnpm verify` and `pnpm test:e2e` pass on a clean checkout.
- [ ] Content review: no secrets, no company or personal data, no copied document text, statuses honest.
- [x] The artifact sources are committed in `content/`, so any clean checkout builds.
- [ ] Measure the first deploy: output size, per-file size, Lighthouse. Write the numbers in `docs/perf.md`.
- [ ] Preview deploy first. Check it on desktop and at 375 px. Only then promote to production.
- [ ] Security headers decided and tested (the artifact pages use inline scripts).
- [ ] Rollback tried once.
- [ ] Login phase (later): provider chosen, threat model written, `proxy.ts` gate added and tested logged out.

## Vendored third-party files (self-hosted, no CDN at run time)
- `public/vendor/three-r128.min.js`: three.js r128, MIT licence, downloaded from cdnjs (`https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`). The 3D pages are rewritten at build time to use it.
- `public/fonts/*`: latin subsets of open-licence Google Fonts, fetched by `tools/fetch-fonts.mjs`.
