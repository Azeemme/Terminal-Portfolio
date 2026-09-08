# Portfolio Revamp Status

## Baseline

Stage: Stage 1 — in progress
Branch: `feature/portfolio-revamp`

### Environment

- Vite: 5.4.21
- @vitejs/plugin-react: 4.7.0
- typescript-eslint: 8.70.0
- React 18.3, Zustand 4.5, react-rnd 10.4, @xterm/xterm 5.5

### Validation (baseline)

- npm ci: PASS
- npm run lint: PASS
- npm run build: PASS (emits documented >500 kB chunk warning: `index-*.js` ~564 kB)

### Known pre-existing issues

- Production bundle emits a >500 kB chunk-size warning (xterm.js in entry chunk).
- npm audit reports 9 dependency vulnerabilities. Do NOT remediate during Stage 1.
- Do not perform unrelated dependency migrations unless required by the revamp.

## Repository reconnaissance (Batch 0)

### Desktop / window system

- `src/App.tsx` renders `<Desktop />` only. No router.
- `src/components/Desktop/Desktop.tsx` maps over `useWindowStore().windows` and renders a
  `<Window>` per entry, resolving the app body via a local `appComponents` map
  (`{ terminal: Terminal }`). `aichat` has no component; it is a "coming soon" modal in the Dock.
- `src/components/Window/Window.tsx` wraps `react-rnd`. Drag handle class `window-drag-handle`.
  Title bar has minimize (`−`), maximize (`□`), close (`×`) real `<button>`s with aria-labels.
  `minWidth=400`, `minHeight=300`, `bounds="window"`. Minimized = `visibility:hidden` (still mounted).
- `src/store/windowStore.ts` (Zustand): `windows: Record<string, AppWindow>`, `topZ`.
  Actions: openApp, closeApp, minimizeApp, maximizeApp, focusApp, updatePosition, updateSize.
  `DOCK_HEIGHT = 60` exported. `INITIAL_WINDOWS` currently: `terminal` (isOpen: **true**),
  `aichat` (isOpen: false). **Reads `window.innerWidth/innerHeight` at module scope** — do not
  import this store from a node-environment test.
- `src/components/Dock/Dock.tsx`: two buttons — Terminal (`>_`) and AI (`AI`). AI opens an
  inline modal. Dock auto-hides (`display:none`) when any window is maximized. Escape closes modal.

### Terminal

- `src/components/apps/Terminal/Terminal.tsx`: xterm.js mount, all keybindings, autocomplete,
  history. Statically imported by `Desktop.tsx` → xterm.js sits in the entry chunk (root cause of
  the chunk-size warning).
- `src/terminal/commandRegistry.ts`: `commandRegistry` object + `initializeCommands()`.
- Commands: `ls cd cat pwd` (filesystem.ts), `help whoami social` (info.ts),
  `open resume clear` (actions.ts), easter eggs `sudo apt rm hack exit vim vi nano` (easter-eggs.ts).
- `src/terminal/filesystem/`: `fakeFiles.ts` holds profile constants
  (`RESUME_URL='/Resume.pdf'`, `LINKEDIN_URL`, `EMAIL_ADDRESS`, `PORTFOLIO_PHOTO_URL`,
  `GITHUB_USERNAME='Azeemme'`, `WHOAMI_CONTENT`, `CONTACT_CONTENT`, `FAKE_FILES`).
  `githubApi.ts` typed GitHub client. `virtualFs.ts` path utils + `sanitizeAnsi`.
- Boot: `src/terminal/bootSequence.ts` renders ANSI ASCII portrait
  (`src/assets/Azeem-ascii-ansi.txt?raw`) beside an info panel. Info panel currently says
  "Software & IT Engineer / AI/Agentic Systems | Full-Stack | Infrastructure".
- Easter eggs to preserve: `sudo rm hack exit vim vi nano apt (update|upgrade)`.

### State / responsive

- No routing today. No mobile layout. `src/reset.css`:
  `html, body, #root { width:100%; height:100%; overflow:hidden }` — blocks document scroll.
  Mobile bypass must scope overflow:hidden to the desktop shell, not delete it globally.
- `index.html`: title set, favicon `/favicon.ico`, JetBrains Mono web font. No OG/social meta.

### Deployment

- **GitHub Pages** via `.github/workflows/deploy.yml` (build on push to `main`, `dist` artifact).
  Custom domain `public/CNAME` = `azeemme.com`. `vite.config.ts` `base: '/'`.
- README "deploys to Vercel" is **stale** — actual target is GitHub Pages.
- SPA deep-link fallback approach: copy `dist/index.html` → `dist/404.html` as a build step.
  GitHub Pages serves real files (`/Resume.pdf`) directly; 404.html only fires on genuine misses,
  so static assets are preserved by construction.

### Test infrastructure

- **None exists.** No vitest/jest, no test script, no `*.test.ts`.
- Plan §15 precondition ("suitable test infrastructure already exists") is FALSE.
- Deviation (documented, minimal): add `vitest` as a single dev dependency (zero-config with Vite,
  no jsdom/RTL) to cover pure routing/state logic, since CLAUDE.md lists "route logic covered by
  tests" as the expected PASS mechanism and browser verification is unavailable. No component/DOM
  test framework is added.

## Architecture decisions

- **Router:** `react-router-dom` (v6/v7). The plan §5 route table is react-router's shape.
- **Loop prevention (plan §4):** `navigate()` is called ONLY from user-event handlers, never from
  an effect that reads Zustand.
  - URL owns: which app is primary/focused + selected project slug (derived, not mirrored to store).
  - Zustand owns: isOpen / isMinimized / isMaximized / geometry / zIndex only.
  - Route → store: one idempotent effect that opens+focuses the app the route names.
  - Store → route: dock clicks, window mousedown, card clicks, close buttons call `navigate()`.
- **Route core pure functions** (testable, no DOM): `parseRoute`, `pathForPrimary`,
  `nextPrimaryAfterClose`. Landed in Batch 1.

## Batch plan

1. Shared data layer (`src/data/`) + route core pure functions + Vitest + unit tests.
2. Portfolio app (Portfolio/ProjectCard/ProjectDetail) against real route API; register `portfolio`
   in store, make default; Terminal `isOpen:false` + `React.lazy`.
3. Routing integration: react-router-dom, route↔store wiring, Dock update, `/desktop` `/terminal`
   `/projects` `/projects/:slug`, 404 + project-not-found, reset.css scoping.
4. Terminal refactor to shared data + new commands.
5. Mobile bypass + `/hi` route.
6. Accessibility, error/fallback states, metadata/social previews, production 404.html fallback.
7. Validation, README update, final status.

## Batch 1 — Shared data + route core + tests (COMPLETE)

Added (pure additions; no existing app code touched):

- `src/data/profile.ts` — `profile` (name, title `Software & Systems Engineer`,
  tagline `XR | Full-Stack | Infrastructure`, education, intro, about). Facts migrated from the
  repo's `WHOAMI_CONTENT`; positioning line updated per plan §9. No invented claims.
- `src/data/links.ts` — `links` (github/linkedin/email/photography/resume), `contactLinks`,
  `GITHUB_USERNAME='Azeemme'`, `RESUME_PATH='/Resume.pdf'`, `EMAIL_ADDRESS`.
- `src/data/experience.ts` — `experience`: one documented role (Data Mine / Space Force team lead),
  `placeholder: true`, no invented dates.
- `src/data/projects.ts` — `Project` model per plan §1 (slug, title, category, summary, featured,
  status `public|hidden|coming-soon`, role, date, technologies, `sections`, links, media,
  `desktopOnlyDemo`, `demoUrl`, `placeholder`). Three featured placeholders:
  `bioreactorxr` (desktopOnlyDemo), `suits`, `stylegentsia` (coming-soon). All `placeholder:true`,
  summaries/tech lists drawn only from the plan. Helpers: `getProject`, `visibleProjects`,
  `featuredProjects`, `projectSlugs`.
- `src/data/index.ts` — barrel.
- `src/routing/routes.ts` — **pure** route core (no DOM/router/store imports):
  `parseRoute(pathname, knownSlugs)` → discriminated `ParsedRoute`
  (`portfolio|project|project-not-found|terminal|desktop|hi|resume|not-found`);
  `primaryAppOf`; `pathForPrimary`; `nextPrimaryAfterClose(windows, closedId)`; path constants.
- `src/routing/routes.test.ts` (31 tests), `src/data/data.test.ts` (12 tests).

Config:

- Added `vitest@2.1.9` dev dep + `test` script (`vitest run`) + `test` block in `vite.config.ts`
  (`environment: 'node'`, `include: src/**/*.test.ts`). No jsdom / RTL. See deviation note above.

### Validation

- npm test: PASS (43/43)
- npm run lint: PASS
- npm run build: PASS (bundle unchanged at ~564 kB — new modules tree-shaken until wired in Batch 2;
  documented chunk warning persists, unchanged from baseline)

### Notes / decisions

- `npm audit` count rose 9 → 12 (1 low, 4 mod, 6 high, 1 critical). The 3 added advisories are
  **vitest dev-only transitive deps** (esbuild/vite chain), never shipped to the client bundle.
  Not remediated per Stage 1 scope control.
- Third featured project slug `stylegentsia` chosen from the plan's two named options; Stage 2
  confirms the final selection and all content.

## Completed

- [x] Batch 0 - Repository reconnaissance
- [x] Batch 1 - Shared data + route core + tests
- [ ] Batch 2 - Portfolio application
- [ ] Batch 3 - Routing/window state integration
- [ ] Batch 4 - Terminal integration
- [ ] Batch 5 - Mobile and /hi
- [ ] Batch 6 - Accessibility, errors, metadata, deployment
- [ ] Batch 7 - Validation

## Known issues

None beyond documented baseline.

## Manual verification needed (running list)

- (none yet)

## Last validated commit

- Baseline: `b3ed9e5`
- Batch 1: pending checkpoint commit
