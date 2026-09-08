# Portfolio Revamp Status

Stage 1 (technical foundation) is **complete** on branch `feature/portfolio-revamp`.
Stage 2 (design + content replacement) is **not started**.

## Validation (current, at Batch 7)

| Check | Result |
|---|---|
| `npm test` | PASS — 53 tests (`routes`, `data`, terminal `portfolio` commands) |
| `npm run lint` | PASS |
| `npm run build` | PASS — **no chunk-size warning** (was a documented baseline issue) |
| Bundle | entry JS 564 kB → **163 kB** (gzip 53 kB); xterm.js split to its own 365 kB lazy chunk; `Portfolio` 15 kB shared chunk; `Desktop` 56 kB; `/hi` ~1.4 kB |
| `dist/404.html` | present, byte-identical to `dist/index.html` |
| `dist/Resume.pdf`, `dist/og-image.png` | present, untouched by the build |

`npm audit`: 9 baseline advisories + 3 dev-only from `vitest`'s transitive chain
(esbuild/vite) — never shipped to the client. Not remediated (Stage 1 scope).

## Environment

- Vite 5.4.21, React 18.3, Zustand 4.5, react-rnd 10.4, @xterm/xterm 5.5
- Added: `react-router-dom@6.30`, `vitest@2.1` (dev)

## Architecture (as built)

### Routing / window-state (plan §4, §5)

- **`react-router-dom`** `BrowserRouter` in `src/main.tsx`.
- **`src/routing/routes.ts`** — pure, DOM-free, unit-tested: `parseRoute(pathname, knownSlugs)`
  → discriminated `ParsedRoute`; `primaryAppOf`; `pathForPrimary`; `primaryFocusAction(win, topZ)`;
  `nextPrimaryAfterClose(windows, closedId)`; path constants.
- **URL owns** the primary/focused app + selected project. **Zustand owns** window
  `isOpen`/`isMinimized`/`isMaximized`/geometry/`zIndex` only — nothing route-shaped is mirrored.
- **`src/routing/RouteBridge.tsx`** — the *only* URL-reactive effect. Idempotently opens/focuses the
  primary app the route names (via `primaryFocusAction`). Never calls `navigate()`.
- **`src/routing/useRouteControls.ts`** — store→route, from event handlers only: `goToPrimary`,
  `focusWindow` (raw frame click / focus), `closeWindow` (with `nextPrimaryAfterClose` fallback).
  No effects → no history/route/store loop.
- **`src/App.tsx`** — top-level switch: `not-found` → `NotFound`; `resume` → `ResumeRedirect`;
  `hi` → `Hi`; else `isMobile ? MobileShell : Desktop`. All branches are `React.lazy` chunks under
  one `<Suspense>` (dark fallback) inside `RootErrorBoundary`; `DocumentTitle` always mounted.

### Data (plan §1)

- **`src/data/`** — `profile`, `projects`, `experience`, `links`, `index` barrel.
- `Project` model: slug, title, category, summary, featured, `status` (`public|hidden|coming-soon`),
  role, date, technologies, `sections`, links, media, `desktopOnlyDemo`, `demoUrl`, `placeholder`.
- Featured placeholders: `bioreactorxr` (desktop-only demo), `suits`, `stylegentsia` (coming-soon).
  **Every project is `placeholder: true`** — summaries/tech lists are drawn only from the approved
  plan; no invented metrics/outcomes. Stage 2 replaces all of it.
- Positioning line (plan §9): `Software & Systems Engineer` / `XR | Full-Stack | Infrastructure`.
- `profile.intro` / `experience` retain the **real** bio facts that were already in the repo's
  `WHOAMI_CONTENT` at baseline `b3ed9e5` (Purdue CIT; 12-person U.S. Space Force / Data Mine team) —
  verified against `git show b3ed9e5:src/terminal/filesystem/fakeFiles.ts`. Not invented.

### Portfolio app (plan §2, §3)

- `src/components/apps/Portfolio/` — `Portfolio.tsx` (hero + Résumé/LinkedIn actions, featured
  cards, experience, about, contact), `ProjectCard.tsx` (a real `<Link to="/projects/:slug">`),
  `ProjectDetail.tsx` (internal view; focus-to-container on mount; Escape scoped to the detail
  element). `bare` prop switches windowed (internal scroll) vs mobile (document scroll).
- Registered in `windowStore` as `portfolio` (`isOpen: false`, centred ~1200×760 via `centeredRect`);
  opened by `RouteBridge` from the URL. Terminal `isOpen: false` + `React.lazy` (plan §3).

### Terminal (plan §9)

- `src/terminal/filesystem/fakeFiles.ts` is now an adapter over `src/data`. Boot info panel and
  `whoami`/`social`/`contact` derive from shared data; positioning line updated.
- New commands: `projects [slug]`, `experience`, `skills`, `contact` (`src/terminal/commands/portfolio.ts`).
  `open` gained `github | linkedin | resume` shortcuts.
- Preserved: virtual FS, live GitHub browsing (`ls`/`cd`/`cat`/`open <repo>` still honour
  `VITE_GITHUB_USERNAME`), tab autocomplete, history, all easter eggs.
- `dirCache` + command `history` lifted to module scope so closing/reopening the Terminal keeps
  history and avoids re-hitting the GitHub API rate limit (`currentPath`/boot reset per open).

### Mobile (plan §6)

- `src/routing/useIsMobile.ts` — `matchMedia('(max-width: 768px)')`, reactive.
- `src/components/mobile/MobileShell.tsx` — below the breakpoint: no desktop shell / windows / dock;
  `<Portfolio bare />` + skip link; `<TerminalUnavailable />` for `/terminal` (never loads xterm.js).

### Errors, metadata, deploy (plan §11, §12, §13)

- `RootErrorBoundary` (whole app) + `AppErrorBoundary` (per window) — non-crashing fallbacks.
- `index.html` — description + full Open Graph + Twitter tags; `public/og-image.png` is a 1200×630
  **branded placeholder** (gradient; generator script removed). `DocumentTitle` sets per-route
  `document.title` + a polite live-region announcement.
- `vite.config.ts` `spaFallback()` plugin copies `dist/index.html` → `dist/404.html` (GitHub Pages
  SPA deep-link fallback); real files served directly, so static assets/entry points are preserved.

### Accessibility (plan §10)

- Landmarks (`<main id="main">`, `<nav aria-label>`), one `<h1>` per view (hero / project detail /
  not-found / error), `<h3>` for card + experience-entry titles.
- Real `<button>`/`<a>`/`<Link>` throughout; cards are links (shareable); external links carry a
  visible ↗ + `sr-only` "(opens in a new tab)".
- Focus management: project detail focuses its container (`preventScroll`); Escape scoped to the
  detail element (no collision with AI modal / Terminal). AI modal: `role="dialog"`/`aria-modal` on
  the content, `aria-labelledby` the title `<h2>`, focus in on open + return to trigger on close,
  capture-phase Escape, minimal Tab containment, `aria-expanded` on the trigger.
- `:focus-visible` outline; `.skip-link` on mobile Portfolio; `.sr-only` utility.
- `@media (prefers-reduced-motion: reduce)` global damping + explicit `.desktop` animation off.
- Title-bar controls raise the window on mousedown (`focusApp`) without triggering navigation.

## Independent reviews

Three reviewer subagents ran (architecture, accessibility, regression). All confirmed the
anti-loop routing design is sound. Findings and resolutions:

### Architecture review (Batch 2+3)

| # | Finding | Resolution |
|---|---|---|
| C1 | Restore-from-minimize broken for the app already on its route (`focusApp` doesn't clear `isMinimized`) | Routed-app focus goes through `openApp`; extracted + unit-tested pure `primaryFocusAction` |
| I2 | Global Escape listeners collide (project detail vs AI modal) | Detail listener scoped to its element; modal listener capture-phase + `stopPropagation` |
| I3 | One gesture on a background routed window = two history entries | `focusWindow` uses a *replace* navigation for focus-follow |
| I4 | Wiring layer has no automated coverage | Partly mitigated (`primaryFocusAction` tests); rest recorded under manual verification |
| M1/M3/M4/M5/M6 | Suspense fallback, `window` shadowing, duplicate `RESUME_PATH`, dead return surface, scroll-reset key | all fixed |

### Accessibility review (Batch 6/7)

| # | Finding | Resolution |
|---|---|---|
| 1 | Cards were `<button>` — not shareable | Now `<Link to="/projects/:slug">`; "Back to projects" also `<Link>` |
| 2 | Card `aria-label` suppressed the summary | Removed; name derives from content |
| 3 | No `<h1>` on detail / not-found views | Promoted to `<h1>` |
| 4/5 | Infinite bg animation + `scroll-behavior: smooth`, no reduced-motion | Global `@media (prefers-reduced-motion)` + explicit `.desktop` rule |
| 7 | Background windows focusable while occluded, URL not synced on keyboard focus | `onFocusCapture` → `focusWindow` (guarded by `primaryFocusAction`) |
| 8 | Experience roles / card titles were non-heading elements | `<h3>` |
| 9/10 | AI dialog semantics on backdrop; title not a heading; no `aria-expanded` | Moved to content, `aria-labelledby` an `<h2>`, `aria-expanded` added |
| 11 | Low-contrast metadata / placeholder greys | Bumped (`#808080`/`#6a6a6a`/`#666` → `#9a9a9a`–`#a0a0a0`) |
| 12 | Skip-link target not focusable | `tabIndex={-1}` on `<main>` |
| 13 | `RootErrorBoundary` replaced the `main` role with `alert` | `<main>` + inner `role="alert"` + `<h1>` |
| 14/15/17/18/19 | nav labels, detail `role`, bare-desktop `<h1>`, `aria-pressed`, route announcements | all addressed |
| 6 | Title-bar focus ring clipping | **Manual verification** (needs a browser) |
| 16 | Escape only works while focus is inside the detail | By design (I2 trade-off) — documented |

### Regression review

| # | Finding | Resolution |
|---|---|---|
| 1 | Title-bar controls no longer raised a background window (`stopPropagation`) | `raiseOnly` handler calls `focusApp` before stopping propagation |
| 2 | Terminal loses history/cache on every close (now routine) | `dirCache` + `history` lifted to module scope |
| 3 | Mobile bypass at 820px caught split-screen desktop | Lowered to 768px |
| 4 | "12-person Space Force" claim — invented? | **Verified present at baseline `b3ed9e5`** — real, not invented |
| 6 | `social`/`contact` don't honour `VITE_GITHUB_USERNAME` | Accepted — shared data is the source of truth; repo browsing still honours the env var. Documented. |
| 7/8 | `reset.css` overflow; focus-follow `replace` | Mitigated / documented limitation |

## Stage 1 acceptance criteria

| Criterion | Status |
|---|---|
| Portfolio opens by default on desktop | PASS (route + `RouteBridge`, tested) |
| `/desktop` deterministic bare state | PASS on direct load/refresh; in-session nav keeps open windows (plan §4) — MANUAL |
| URL is source of truth for primary app/project | PASS (tested) |
| Secondary windows may stay open without contradicting the route | PASS (RouteBridge only opens/focuses) |
| Closing the routed app → appropriate remaining app or `/desktop` | PASS (`nextPrimaryAfterClose`, tested) |
| Back/Forward + refresh restore focus | PASS by inspection + round-trip tests — MANUAL (browser) |
| Terminal optional | PASS (closed by default, lazy) |
| Portfolio + Terminal consume shared data | PASS |
| Featured work visible without terminal interaction | PASS |
| Project details route-backed + shareable | PASS (`<Link>`, `/projects/:slug`) |
| BioreactorXR opens externally as a desktop demo | PASS (label + note; `demoUrl` pending Stage 2) |
| Résumé stays a static `/Resume.pdf` link | PASS (dock `<a>`, `/resume` redirect, never routed) |
| Mobile bypasses the simulated desktop | PASS by inspection — MANUAL (browser) |
| `/terminal` explicit desktop-only mobile behaviour | PASS (`TerminalUnavailable`) |
| Terminal not required for mobile usability | PASS |
| Unknown routes / project slugs fail gracefully | PASS (`NotFound`, in-Portfolio project-not-found; tested) |
| Production deep links work on refresh | PASS by construction (`dist/404.html`) — MANUAL (live) |
| Static assets not broken by fallback | PASS (`dist/Resume.pdf`, `dist/og-image.png` verified) |
| Metadata + social previews, no SSR | PASS (`index.html` + `DocumentTitle`) — MANUAL (unfurl) |
| `/hi` lightweight + one-tap | PASS (own ~1.4 kB chunk) — MANUAL (layout) |
| README matches architecture | PASS (rewritten) |
| `npm run lint` / `npm run build` | PASS |
| 5-second recruiter test | MANUAL (visual) |

## Needs manual verification (no browser in Stage 1)

Visual / interaction:
- Portfolio window centred ~1200×760, internally scrollable, not clipped.
- No stray document scrollbars on the desktop route; gradient renders full-bleed.
- Dock appearance (4 items + glyphs); title-bar control focus-ring clipping (a11y #6).
- Project-detail focus ring / Escape feel; first-load dark frame; boot ASCII alignment.
- Mobile: bypass triggers ≤768px, Portfolio scrolls with no chrome, rotate/resize swap is clean,
  `/terminal` shows the notice, tap targets / single-column cards, `/hi` layout.
- Social preview unfurl (og:image is a placeholder).

Behaviour (logic unit-tested; end-to-end needs a browser):
- Back/Forward focus restoration; refresh restores primary only; routed-app close fallback;
  secondary windows survive URL change; minimize→restore via dock; Escape scoping;
  keyboard focus into a background window syncs the URL.

Live deploy:
- `azeemme.com/projects/suits` reload resolves via `404.html`; `azeemme.com/Resume.pdf` still serves
  the PDF; `document.title` updates on client navigation.

## Known limitations / decisions (carry into Stage 2)

- Raw background-window focus-follow uses `replace` navigation — no history entry, does not restore
  that app's previous sub-route.
- `/desktop` reached by in-session navigation keeps already-open windows (plan §4 forbids closing
  unrelated windows); bare only on direct load/refresh.
- One dark frame before the desktop paints on first load (root Suspense fallback).
- `og:image` is a branded gradient placeholder — Stage 2 replaces with a designed card.
- `social`/`contact` terminal output uses the shared GitHub username, not `VITE_GITHUB_USERNAME`.
- Third featured project slug `stylegentsia` chosen from the plan's two options; Stage 2 confirms.

## Checkpoint commits

| Batch | Commit |
|---|---|
| Baseline | `b3ed9e5` |
| 1 — shared data + route core + vitest | `fb4f616` |
| 2+3 — Portfolio app + route-backed window state | `42cb136` |
| 4 — Terminal → shared data + commands | `908da37` |
| 5 — mobile bypass + `/hi` | `ccc47f2` |
| 6 — a11y, errors, metadata, SPA fallback | `4ed1c12` |
| 7 — review fixes + README + validation | pending |
