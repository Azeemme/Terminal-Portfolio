# Project media handoff

Three approved Stage 2 project images are not yet in the repo. Drop them into
`public/projects/`. Until a file is present, the Portfolio shows a labelled
graph-paper placeholder in its place (no broken image, no layout shift) — add
the file and the site picks it up with no code change.

| File | Used as | Notes |
|---|---|---|
| `public/projects/bioreactorxr.png` | BioreactorXR — flagship card + detail hero | wide capture; focal point ~42% from top (`object-position: center 42%`) |
| `public/projects/offgrid-dashboard.png` | Off-Grid Telemetry — card + detail hero | dashboard screenshot; anchored to top (`object-position: top center`) |
| `public/projects/suits-hardware.png` | NASA SUITS — card + detail hero | HoloLens 2 HMD + wrist-mounted display |

Recommended: ~1600×900 or wider, `.png` or `.webp` (update the `src` in
`src/data/projects.ts` if you use a different extension), kept under ~400 KB
each. These are decorative captures — the case-study copy stands on its own —
so they are lazy-loaded and never block the Portfolio.

The handoff doc lives outside `public/` on purpose: anything under `public/`
is deployed verbatim, and `/projects/...` is a live client route.
