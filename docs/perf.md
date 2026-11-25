# Performance record

Measured 2026-11-25 on the local production build (`next start`), Lighthouse 12, mobile preset with simulated throttling, headless Chrome. Local numbers, not a deployed site: the deploy will be measured again (see `docs/deploy-later.md`).

| Page | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| / | 95 | 100 | 100 | 100 | 2.9 s | 90 ms | 0 |
| /items | 95 | 98 (heading order, fixed after this run) | 100 | 100 | 2.9 s | 60 ms | 0 |
| /items/mongodb | 96 | 100 | 100 | 100 | 2.7 s | 40 ms | 0 |
| /about | 97 | 100 | 100 | 100 | 2.7 s | 50 ms | 0 |

Notes
- Largest element on the home page is a heading. Time to first byte is about 45 ms, element render delay about 290 ms. Simulated throttling dominates LCP.
- Budget to keep: performance 90 or more, accessibility 100, CLS 0 on shell pages.
- Artifact pages (/a/<id>) are single files of 30 KB to 1.2 MB. They are not part of these numbers.
- Raw reports were saved locally in `docs/lh/` (not committed).
