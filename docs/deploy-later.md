# Deployment checklist (not done yet)

Do not deploy until every box is ticked and the owner says go.

- [ ] Read the Vercel Terms. Section 4 (Hobby): "personal or non-commercial use" only. Create the project under the personal account, no ads, no selling, nothing from an employer.
- [ ] Decide `NEXT_PUBLIC_SITE_URL` (the canonical address) and set it as a project environment variable.
- [ ] `pnpm verify` and `pnpm test:e2e` pass on a clean checkout.
- [ ] Content review: no secrets, no company or personal data, no copied document text, statuses honest.
- [ ] The artifact sources are available to the build (ARTIFACT_ROOT) or `public/a/` is produced in CI and deployed as a prebuilt folder.
- [ ] Measure the first deploy: output size, per-file size, Lighthouse. Write the numbers in `docs/perf.md`.
- [ ] Preview deploy first. Check it on desktop and at 375 px. Only then promote to production.
- [ ] Security headers decided and tested (the artifact pages use inline scripts).
- [ ] Rollback tried once.
- [ ] Login phase (later): provider chosen, threat model written, `proxy.ts` gate added and tested logged out.
