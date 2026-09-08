# Portfolio Revamp Implementation Plan

## Guiding approach

Implement the revamp in two stages:

1. **Stage 1 — Technical foundation:** establish architecture, shared data, routing, desktop/mobile behavior, accessibility, error handling, metadata, deployment behavior, and functional placeholder content.
2. **Stage 2 — Design and content replacement:** replace placeholders with finalized copy, visuals, media, branding, and polish without rebuilding the architecture.

The simulated desktop remains the framing device. Portfolio is the default experience, Terminal remains optional, and the desktop should not grow into a full fake operating system.

Do not add separate Projects, Photography, Resume, or project-specific draggable-window apps during Stage 1.

---

# Stage 1: Technical implementation

## 1. Establish shared data contracts

Create a shared data layer consumed by Portfolio, Terminal, the mobile presentation, routing, metadata, and `/hi`.

Suggested structure:

```text
src/data/
  profile.ts
  projects.ts
  experience.ts
  links.ts
  index.ts
```

A project model should support placeholder content and finalized case studies, including stable slugs, title/category/summary, featured state, status (`public`, `hidden`, or `coming-soon`), role/date, structured case-study sections, technologies, links, media, and desktop-only demo requirements.

Project visibility is presentation logic only. Do not place confidential or genuinely private project information in client-side shared data because bundled client data is not an access-control mechanism.

Initial featured projects:

- BioreactorXR / BioreactAR
- NASA SUITS
- A complementary software/systems project such as Stylegentsia or Priority Lens

Use placeholders where final content or media is unavailable. Do not invent unsupported metrics or outcomes.

## 2. Build the functional Portfolio app

Create a Portfolio app inside the existing desktop shell with a hero, resume and LinkedIn actions, featured project cards, route-backed project details, experience, About, contact links, and placeholder media blocks.

Suggested files:

```text
src/components/apps/Portfolio/
  Portfolio.tsx
  Portfolio.module.css
  ProjectCard.tsx
  ProjectDetail.tsx
```

Project details may render as an internal Portfolio view or modal, but must be represented in the URL, for example `/projects/bioreactorxr`. They do not require separate draggable OS windows.

## 3. Make Portfolio the default desktop app

- Portfolio opens automatically at `/`.
- Terminal is registered but closed initially.
- Portfolio is centered, approximately 1100–1250px by 700–800px when space allows, and internally scrollable.
- Preserve existing drag, resize, minimize, maximize, close, and focus behavior.
- Do not mount inactive apps invisibly during initial load.
- Lazy-load Terminal, project detail media, and non-critical content where reasonable.
- Do not preload or embed the BioreactorXR WebGL demo.

## 4. Define URL state versus multi-window desktop state

The URL represents the primary/focused content state, not the complete set of open desktop windows. Portfolio and Terminal may remain open simultaneously; Zustand may preserve secondary windows.

Required invariants:

- URL determines the primary/focused app or project.
- Browser Back and Forward restore the correct focused content.
- Direct navigation and refresh preserve primary state.
- Routed projects always restore the correct Portfolio detail.
- Do not close unrelated windows merely because the URL changes.
- Do not create synchronization loops between browser history, route state, and Zustand.

When the currently routed application is closed, focus the most recently focused remaining routed application and update the URL. If no routed application remains, navigate to `/desktop`. Do not immediately reopen Portfolio at `/desktop`; direct navigation or reload of `/` opens Portfolio by default.

Closing a project detail navigates from `/projects/:slug` to `/projects`.

## 5. Implement route-backed navigation

Primary routes:

```text
/                         Portfolio
/desktop                  Bare desktop
/terminal                 Terminal
/projects                 Project listing
/projects/bioreactorxr    BioreactorXR detail
/projects/suits           NASA SUITS detail
/hi                       Networking page
/Resume.pdf               Existing static resume
```

Required behavior:

- `/` opens Portfolio with no selected project.
- `/desktop` shows the bare desktop state.
- `/terminal` focuses Terminal.
- `/projects` focuses Portfolio with the project list.
- `/projects/:slug` focuses Portfolio with the matching detail.
- Project clicks update the URL.
- Portfolio and Terminal focus actions update the primary URL while preserving secondary windows.
- Browser Back/Forward and refresh restore the correct state.
- Invalid project slugs show project-not-found.
- Unknown routes show a useful 404.

## 6. Define mobile behavior

At mobile/tablet breakpoints, bypass the simulated desktop rather than shrinking it. Hide the fake desktop, draggable windows, dock, and large ASCII art; render Portfolio directly with normal scrolling and the same shared data/routes.

Terminal is not required on mobile. Direct `/terminal` navigation on a phone renders a lightweight “Terminal is designed for desktop” state with an action back to Portfolio. Do not compromise mobile Portfolio UX to support Terminal.

For BioreactorXR, label the external link `Desktop Demo`, explain that keyboard and mouse interaction are recommended, and do not embed WebGL.

## 7. Preserve the existing static resume behavior

The resume already exists at `/Resume.pdf`.

Do not build a Resume app, custom viewer, resume-focused Portfolio state, or duplicated resume content. Dock, Portfolio, and `/hi` Resume actions open `/Resume.pdf` in a new tab. The native PDF viewer handles it, and the resume does not participate in desktop or URL/window state.

An optional lowercase `/resume` route may redirect to `/Resume.pdf` without adding UI.

## 8. Update the dock

Initial dock: `Portfolio | Terminal | Resume ↗ | AI`.

Portfolio and Terminal focus their apps and update primary URL state. Resume opens `/Resume.pdf` in a new tab, has no app indicator, and AI must not increase initial Portfolio load time. Do not add separate Projects or Photography apps.

## 9. Refactor Terminal to shared data

Refactor `whoami`, `social`, contact output, biography, resume link, and positioning text to use shared data. Use:

```text
Software & Systems Engineer
XR | Full-Stack | Infrastructure
```

Add commands where appropriate: `projects`, `projects bioreactorxr`, `experience`, `contact`, `skills`, `open github`, `open linkedin`, and `open resume`.

Preserve existing filesystem, GitHub browsing, autocomplete, history, and Easter eggs.

## 10. Build accessibility into the foundation

Use semantic headings, real buttons and links, keyboard-operable dock and title-bar controls, accessible labels, non-drag controls, focus management for project details, Escape-to-close, appropriate focus containment, visible focus styles, and pointer-free card/link operation.

## 11. Add error and fallback behavior

Unknown routes show 404; unknown projects show project-not-found; missing data/media/resume and failed lazy-loaded apps have graceful non-crashing states; deep-link refreshes never show a blank screen.

## 12. Handle production deep-link fallback

Configure and verify production SPA history fallback for client routes. Preserve real static assets and independent entry points: `/Resume.pdf`, `/hi` if separate, images, media, favicon, and other actual files must not be rewritten to the desktop SPA entry. Review the existing deployment workflow and hosting target.

## 13. Add baseline metadata and social previews

Add site-wide title, description, favicon, Open Graph title/description/image, and basic social metadata. Project-specific browser titles are desirable where practical. Do not add SSR or a major prerendering/SEO architecture solely for project previews.

## 14. Add `/hi` as a lightweight networking route

Implement after primary routing works. Include Azeem Ehtisham, Purdue University, Portfolio, Resume, LinkedIn, GitHub, and Email. Keep it mobile-first, fast, independently lightweight, and free of desktop, window, Terminal, AI, project-detail, and unrelated media dependencies where practical. Resume, LinkedIn, or Portfolio should be reachable in one tap.

## 15. Add automated route/state coverage where infrastructure allows

If suitable test infrastructure already exists, cover `/`, `/desktop`, `/terminal`, project routes, project clicks, direct project URLs, Back/Forward, routed-app close fallback, invalid project slugs/routes, and Resume links. Do not add a large test framework solely for this requirement; otherwise use manual verification.

## 16. Validate Stage 1

Run:

```bash
npm run lint
npm run build
```

Verify desktop default Portfolio, simultaneous secondary windows, URL/focus synchronization, routed-app close fallback to `/desktop`, deep-link refresh, external BioreactorXR demo, static Resume behavior, direct mobile Portfolio, explicit mobile `/terminal`, `/hi` one-tap links, production rewrites, error states, and the five-second recruiter acceptance test.

---

# Stage 2: Design and content replacement

Replace technical placeholders without rebuilding the architecture.

## 1. Finalize profile copy

Finalize the name presentation, title, XR/systems positioning, short introduction, education, About, contact language, and calls to action. Preferred direction:

```text
Software & Systems Engineer
XR • Full-Stack • Infrastructure
```

## 2. Finalize Portfolio visual design

Finalize typography, colors, spacing, buttons, cards, hierarchy, window proportions, mobile layout, hover/focus states, animation, and transitions while preserving the dark UI, blue grid desktop, restrained green/blue accents, terminal influence, desktop metaphor, and monospace technical labels.

Avoid generic developer styling, a giant headshot hero, skill bars, excessive logos, long autobiography, excessive glassmorphism, and generic AI-startup styling.

## 3. Replace project placeholders with final content and media

Add finalized project titles, summaries, context, contribution, architecture, challenges, outcomes, technologies, links, screenshots, and video where available.

BioreactorXR should emphasize multiplayer mixed-reality education/training, Unity, Meta Quest 3, Unity Relay, Netcode, the life-size bioreactor, 35 interactive components, and shared sessions while retaining the external desktop demo.

NASA SUITS should use a strong HMD, rover, mission, or integration visual and emphasize systems design, technical leadership, UX, and hardware/software integration.

Choose a complementary third project rather than another nearly identical XR project.

## 4. Finalize media handling and performance

Optimize image dimensions and formats, use responsive sources, lazy-load non-critical media, provide fallbacks, keep cards lightweight, avoid blocking Portfolio, and never preload the BioreactorXR WebGL demo.

## 5. Refine project detail presentation

Polish the detail view into a concise case study: hero, summary, context/problem, contribution, technical approach, challenges, results, technologies, and links. Use short sections, lists, diagrams, callouts, and visuals instead of walls of text.

## 6. Refine desktop and mobile integration

Tune Portfolio window dimensions, title bar, icons, dock spacing, desktop visibility, mobile type/spacing, card hierarchy, transitions, tap targets, and focus states. Keep the desktop metaphor lightweight.

## 7. Finalize Terminal presentation

Ensure Terminal uses finalized shared data, matches Portfolio copy and links, exposes useful project/experience information, and remains optional.

## 8. Final accessibility and quality pass

Recheck contrast, keyboard navigation, focus management, modal behavior, screen-reader labels, reduced motion, mobile tap targets, heading hierarchy, external-link labeling, and error/fallback states.

---

# Final acceptance criteria

- Portfolio opens by default on desktop.
- `/desktop` provides a deterministic bare-desktop state.
- URL state is the source of truth for primary/focused app and project state.
- Secondary windows may remain open without contradicting the route.
- Closing the routed app selects an appropriate remaining app or falls back to `/desktop`.
- Back/Forward and refresh restore the intended focused state.
- Terminal remains optional.
- Portfolio and Terminal consume shared data.
- Featured work is visible without terminal interaction.
- Project details are route-backed and shareable.
- BioreactorXR opens externally as a desktop-oriented demo.
- Resume remains a static `/Resume.pdf` link/action.
- Mobile bypasses the simulated desktop.
- `/terminal` has explicit desktop-oriented mobile behavior.
- Terminal is not required for mobile usability.
- Unknown routes and project slugs fail gracefully.
- Production deep links work on refresh.
- Static assets and independent entry points are not broken by fallback.
- Useful metadata and social previews exist without SSR.
- `/hi` is lightweight and one-tap friendly.
- Final design assets and copy replace all placeholders.
- README matches the new architecture.
- `npm run lint` passes.
- `npm run build` passes.
- A recruiter can understand Azeem’s identity and find featured work within approximately five seconds of desktop arrival.

Proceed directly with Stage 1. Make implementation-driven decisions within this plan and return for additional planning only if a concrete architectural conflict emerges.
