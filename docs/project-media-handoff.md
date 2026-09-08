# Project media

The three Stage 2 project captures live in `public/projects/` as WebP:

| File | Used as | Crop |
|---|---|---|
| `bioreactorxr.webp` | BioreactorXR — flagship card + detail hero | `object-position: center 42%` |
| `offgrid-dashboard.webp` | Off-Grid Telemetry — card + detail hero | `object-position: top center` |
| `suits-hardware.webp` | NASA SUITS — card + detail hero | `object-position: center 58%` (full VISOR poster, portrait) |

They were re-encoded from the originals (PNG, 0.4–1.3 MB) to WebP q82
(63 / 108 / 171 KB). They are decorative, lazy-loaded, and never block the
Portfolio — `ProjectMediaFrame` falls back to a labelled graph-paper panel if a
file is missing.

To swap one: drop a replacement at the same path (keep `.webp`, or change the
extension in `src/data/projects.ts` → `media.src`). Recommended ~1600 px wide,
under ~250 KB.

This doc lives outside `public/` on purpose: everything under `public/` is
deployed verbatim, and `/projects/...` is a live client route.
