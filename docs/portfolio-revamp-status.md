# Portfolio Revamp Status

Stage 1 (technical foundation) is **complete** on branch `feature/portfolio-revamp`.
Stage 2 (design + content replacement) is **not started**.

## Validation (current, at Batch 7)

| Check | Result |
|---|---|
| `npm test` | PASS — 56 tests (`routes` 35, `data` 15, terminal `portfolio` commands 6) |
| `npm run lint` | PASS |
| `npm run build` | PASS — **no chunk-size warning** (was a documented baseline issue) |
| Bundle | entry JS 564 kB (Stage 1 baseline) → **161 kB** (gzip 52.6 kB) after Stage 2; xterm.js in its own 366 kB lazy chunk; `data` 8 kB shared chunk (project prose, `manualChunks`); `Portfolio` 22 kB; `Desktop` 57 kB; `/hi` ~1.5 kB JS + ~1.6 kB CSS, no desktop/terminal code |
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
| 7 | Background windows focusable while occluded | `onFocusCapture` → `raiseWindow` (raise/restore only, never navigates — avoids any mount-time-focus navigation risk). Pointer clicks still sync the URL via `focusWindow`. |
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
| Production deep links work on refresh | PASS by construction — `dist/404.html` == `index.html`, and every asset ref in it is root-absolute (`/assets/...`), so it resolves from any URL depth — MANUAL (live confirm) |
| Static assets not broken by fallback | PASS (`dist/Resume.pdf`, `dist/og-image.png`, `favicon.ico` verified in `dist/`) |
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

---

# Stage 2 — Design + content replacement (IN PROGRESS)

Visual source of truth: approved Claude Design project `b811976a-…` →
`Stage 2 Portfolio.dc.html` ("Console / instrumentation" direction, Turn 4).
Architecture/behaviour source of truth: this repo + Stage 1 invariants (unchanged).

## BLOCKER — design image assets not retrievable

The approved design references three project images plus two secondary SUITS assets
(`bioreactorxr-shot.png`, `offgrid-dashboard.png`, `suits-hardware.png`, `suits-diagram.png`,
`suits-team-strip.png`). They live in the Claude Design project under `assets/`. The `DesignSync`
`get_file` tool is capped at 256 KiB and returns `truncated: true` for these PNGs, so the binary
files **cannot be pulled into the repo from this session** (verified directly).

**Handoff:** the implementation wires the expected paths and degrades gracefully when a file is
absent (see `public/projects/README.md`). To finish the visual pass, drop these files into
`public/projects/`:

| File | Used as | Design `alt` / caption |
|---|---|---|
| `public/projects/bioreactorxr.png` | Project 01 flagship card + detail hero | "BioreactorXR — component inspection panel open on the peristaltic feed pumps" · object-position `center 42%` |
| `public/projects/offgrid-dashboard.png` | Project 02 card + detail hero | "Off-Grid Telemetry dashboard — live battery, solar and temperature readings" · object-position `top center` |
| `public/projects/suits-hardware.png` | Project 03 card + detail hero | "VISOR — HoloLens 2 head-mounted display worn, and the wrist-mounted display on the forearm" |

Until the files exist, cards/detail heroes show a labelled graph-paper placeholder (no broken image,
no layout shift).

## Verified-fact decisions (design vs. resume, resolved once)

Source for facts: `uploads/master_resume.typ` in the design project + the approved design text.

- **Profile `NOW` field:** design shows "Research Team Lead / U.S. Space Force · Purdue Data Mine".
  Per the master resume that role (Team Lead / Scrum Master, The Data Mine – U.S. Space Force) ran
  **Jan – Jul 2026** and has ended (today is 2026-09-08). A field labelled `NOW` must be current, so
  it carries the **Undergraduate Research Fellow** role (Purdue SURF / OUR Scholars, May 2026 –
  Present, which the resume and the design's own Experience section both mark current). The Space
  Force credential stays on the page as a completed **Experience** entry. Documented deviation.
- **Experience section:** design shows 2 entries; implemented as 3 (added the completed Data Mine /
  U.S. Space Force lead role) so the prestige credential remains visible and the `NOW` field stays
  accurate. Still compressed; "Full resume ↗" covers the rest (Elanco, SUITS role, hackathons).
- **Rule applied to design "Placeholder" cells:** implement the design exactly, EXCEPT omit any cell
  the design itself marks `Placeholder` and drop both amber "PLACEHOLDER —" warning blocks
  (task: "Do not ship placeholder warnings publicly"). Concretely dropped: Off-Grid system-flow
  `02 Collect` stage; Off-Grid facts-rail `Role` field; both amber warning blocks.
- **Kept from the approved design** (facts about the user's own project, not marked unresolved):
  Off-Grid `11 endpoints`, `6 pages`, `Shared · FTP deploy`, `Build step: None`, `Docker` chip;
  "a solar-powered cabin in the Ozarks"; SUITS "VISOR" interface name, wrist-mounted display, voice
  assistant, `2025 – Present`, HoloLens 2 · Pi, RAG.
- **BioreactorXR `Repository ↗` link:** design shows it on the detail page; the repo URL is not in
  the task's verified list and could not be confirmed → **omitted**. Re-add if a public repo is
  confirmed.
- `suits-diagram.png` / `suits-team-strip.png` exist in the project but are **not referenced by the
  approved Stage 2 design** → not used; SUITS detail is built on the shared 2b/2c detail shell.

## Stage 2 checkpoints

| # | Scope | Commit |
|---|---|---|
| S2-1 | Shared visual tokens (`src/styles/tokens.css`), Archivo + JetBrains Mono, grid-paper helper | `b37f5db` |
| S2-2…8 | Data model + Portfolio homepage (Work Index / Profile / flagship 01 / pair 02-03 / Experience-About-Contact) + all three project-detail pages (project-file layout, system-flow strip, demo notice, facts rail) | `13f0ccd` |
| S2-9 | Window 1250×858 + drop shadow + route-aware title; dock instrument restyle (teal active, indicator bar, divider); instrument scrollbar | `4eb6ff0` |
| S2-10 | Portfolio responsive collapse (≤900 / ≤520); `/hi`, 404, TerminalUnavailable restyled to the vocabulary; `/hi` stays lightweight | `2c8a619` |
| S2-11 | Terminal `experience`/`skills` on finalized data; stale-reference + README cleanup | `d034ea6` |
| S2-12 | heading hierarchy (`2181e41`); a11y + regression review + fixes (`+ review-fix commit`); final validation | complete |

### Independent review — Stage 2

**Regression review:** no confirmed regressions. Routing core, route table, Terminal lazy/closed,
zero new dependencies, GitHub Pages fallback, error boundaries, a11y anchors, dock semantics, and
the 6 terminal-command tests all verified intact by inspection. Notes: `/` and `/projects` render
the same view (Stage 1 behaviour — `/projects` moves focus to "Featured work"); `/hi` now shares
the Archivo webfont request (still a ~1.5 kB JS chunk, no desktop/terminal code).

**Accessibility review — findings & resolution:**

| # | Finding | Resolution |
|---|---|---|
| 1 | Dock "open" indicator (teal bar) had no non-visual equivalent | `aria-label` gains "(open)" suffix; indicator marked `aria-hidden` |
| 2 | project-not-found view didn't manage focus | focuses its `<h1 tabIndex={-1}>` on mount (matches the other two views) |
| 3 | Secondary-button border `#3d4046` ≈1.8:1 (< 3:1, 1.4.11) | new `--btn-line: #6b6e76` (≥3.6:1 on dark) for all secondary buttons, `/hi` + 404 links, modal close; hover borders brightened |
| 4 | AI-modal close button 34×28 | 44×32 + `--btn-line` border |
| 5 | Unhidden `·` separators in the app header | `aria-hidden="true"` |
| 6 | AI dock label `#8b9099` marginal on hover | → `#9aa0a8` |
| 10 | Breadcrumb not a nav landmark; `/` announced as "slash" | `<nav aria-label="Breadcrumb">` + `aria-hidden` separator |
| 11 | `<article>` cards had no accessible name | `aria-labelledby` → card `<h3>` |
| 7 | Fallback rendered the full ~100-char alt sentence in a fixed-height frame | visible text → "Image pending"; full alt kept as `aria-label` |
| 8, 9 | Teal-on-teal focus ring (offset gap carries it, AAA-only); `.detailRoot:focus` outline suppression on a `tabIndex=-1` container | accepted, documented |

**Contrast — verified passing** (reviewer-computed): all `--text-meta` / green rail `#6a9955` /
link-blue / chip / fact-cell / teal-value / primary-button pairings clear AA on their darkest
backgrounds. `--amber` / `--text-dim` tokens are declared but currently unreferenced (amber is
reserved for genuinely-unresolved info, of which the shipped content has none).

## Stage 2 — needs manual verification (no browser)

- All three project images are ABSENT (see blocker) → every card/hero shows the "Image pending"
  graph-paper fallback. Drop the files into `public/projects/` to complete the visual pass.
- Layout at the two breakpoints (≤900 / ≤520): single-column collapse of profile / flagship /
  compact pair / detail grid / lower grid / system-flow; app-header + breadcrumb wrap.
- Flagship + compact card equal-height alignment; capture crop focal points (`object-position`).
- Instrument scrollbar rendering (webkit); dock active-tile + indicator bar; window drop shadow;
  title bar "Portfolio — <Project>".
- Mobile tap-target comfort: `.btnSm` (~34px) and stacked contact links clear 24px (2.5.8) but sit
  below the 44px comfort target (2.5.5).
- The 5-second recruiter test with real imagery.

### Implementation notes

- **Design system** in `src/styles/tokens.css` (global, entry CSS). Portfolio interior + mobile
  bypass both render the 24px graph-paper ground from one shared token block.
- **Cards are not wrapping links** (the design shows explicit CTAs and nested interactive elements
  are invalid) — the flagship + compact cards are `<article>` panels whose "View Project →" is the
  shareable `<Link to="/projects/:slug">`. Deep links unchanged.
- **Window title bar** reflects the routed project ("Portfolio — BioreactorXR"), derived read-only
  from `useRouteControls().route` in `Window.tsx` — no store write, no new effect.
- **Project images**: `ProjectMediaFrame` renders `<img loading="lazy" onError→placeholder>`. The
  three files are not in the repo (blocker above); the site is fully functional without them.
- **Off-Grid system flow** renumbered to 4 stages (design's `02 Collect` "Placeholder" cell dropped).
- **NASA SUITS** has no approved detail mockup — built on the shared project-file shell; system-flow
  (TSS → Mission control → Pi → HoloLens 2) and the "Contribution" section are from the résumé.

## Stage 1 checkpoint commits

| Batch | Commit |
|---|---|
| Baseline | `b3ed9e5` |
| 1 — shared data + route core + vitest | `fb4f616` |
| 2+3 — Portfolio app + route-backed window state | `42cb136` |
| 4 — Terminal → shared data + commands | `908da37` |
| 5 — mobile bypass + `/hi` | `ccc47f2` |
| 6 — a11y, errors, metadata, SPA fallback | `4ed1c12` |
| 7 — review fixes + README + validation | `242a5ec` (+ `79adf99`, `8e1308f`) |
