# How changes are made

1. Branch from `main`. Never push to `main` directly: it is protected and needs the CI checks to pass.
2. Make the change. Styling goes only in `app/globals.css` (PART 1 for colours). `pnpm run check:css` enforces this.
3. Every bug fix comes with a test that fails if the fix is reverted. Prove it: revert the fix, see the test fail, restore.
4. Run `pnpm verify` and `pnpm test:e2e` locally. CI runs the same checks.
5. Open a pull request and fill in the template. Merge only when every check is green.
6. A topic page keeps a changelog line, a version and a "review by" date in `catalog/<id>.json`. A page is `audited` only after an independent check against the original documents.
7. Deployment follows `docs/deploy-later.md`.
