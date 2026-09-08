# Portfolio

> Azeem Ehtisham's personal portfolio — a functional Portfolio app framed by a
> simulated desktop, with an optional interactive terminal.

## Overview

The site opens on a **Portfolio** app inside a Windows-style desktop shell: hero,
résumé / LinkedIn actions, featured project cards, and route-backed project
detail pages. A **Terminal** is available as an optional second app — an
xterm.js shell over a virtual filesystem that browses the owner's public GitHub
repositories live.

- The **URL is the source of truth** for the primary/focused app and the selected
  project. Browser Back/Forward, refresh, and deep links all work.
- On phones and small tablets the simulated desktop is **bypassed** — Portfolio
  renders directly with normal scrolling.
- Portfolio and Terminal share one data layer (`src/data/`), so profile copy,
  links, projects, and experience stay consistent.
- Fully static, no backend. Deploys to **GitHub Pages** at `azeemme.com`.

> **Media:** the three project images live in `public/projects/` — see the README
> there. If a file is absent the card/hero shows a labelled graph-paper
> placeholder (no broken image, no layout shift).

## Routes

| Route | Content |
|---|---|
| `/` | Portfolio (default) |
| `/desktop` | Bare desktop |
| `/terminal` | Terminal |
| `/projects` | Portfolio, project list |
| `/projects/:slug` | Portfolio, project detail — `bioreactorxr`, `off-grid-telemetry`, `suits` |
| `/hi` | Lightweight networking card |
| `/resume` | Redirects to `/Resume.pdf` |
| `/Resume.pdf` | Static résumé asset (never routed) |

Unknown routes show a 404; unknown project slugs show an in-Portfolio
"project not found". Production deep links resolve via a `404.html` copy of
`index.html` (GitHub Pages SPA fallback).

## Features

- Desktop shell — draggable, resizable windows via react-rnd; minimize, maximize,
  close, focus/z-order; dock (`Portfolio | Terminal | Resume ↗ | AI`) that
  auto-hides when a window is maximized
- Route-backed navigation (react-router) with a single route→store bridge and
  event-handler-only store→route wiring (no history/state sync loop)
- Terminal (lazy-loaded, closed by default) — xterm.js on canvas, JetBrains Mono,
  VS Code-inspired theme, ANSI ASCII boot splash
- Virtual filesystem rooted at `~/` — profile files plus every public GitHub repo
  as a live, browsable directory (`ls`, `cd`, `cat`, `open`); session-scoped cache
- Tab autocomplete, command history (Up/Down, capped at 500), Ctrl+C / Ctrl+L
- Portfolio data commands — `projects`, `experience`, `skills`, `contact`
- Mobile bypass of the desktop metaphor; `/terminal` on mobile shows a
  desktop-only notice (never loads xterm.js)
- Accessibility — semantic landmarks/headings, keyboard-operable controls, focus
  management for project details, visible focus styles, skip link
- Open Graph / Twitter metadata; per-route `document.title`
- Easter eggs behind `sudo`, `rm`, `hack`, `vim`, `vi`, `nano`, `exit`, `apt`

## Tech Stack

| Layer | Library | Version |
|---|---|---|
| UI framework | React | ^18.3 |
| Routing | react-router-dom | ^6.30 |
| State management | Zustand | ^4.5 |
| Window management | react-rnd | ^10.4 |
| Terminal emulator | @xterm/xterm | ^5.5 |
| Build tool | Vite | ^5.4 |
| Unit tests | Vitest | ^2.1 |
| Language | TypeScript | ^5.5 |

## Prerequisites

- Node.js 18 or later
- A GitHub Personal Access Token (optional — raises the API rate limit from 60 to
  5000 requests/hr for the Terminal's repo browsing)

## Installation

```bash
git clone https://github.com/Azeemme/Terminal-Portfolio.git
cd Terminal-Portfolio
npm install
cp .env.example .env.local   # optional
```

`.env.local` (both variables optional):

```env
# Read-only PAT, public-repo scope only. Embedded in the browser bundle.
VITE_GITHUB_TOKEN=ghp_yourTokenHere
# GitHub username whose repos appear in the Terminal filesystem
VITE_GITHUB_USERNAME=Azeemme
```

## Scripts

```bash
npm run dev       # dev server
npm test          # Vitest (route + data + terminal-command unit tests)
npm run lint      # ESLint
npm run build     # tsc -b && vite build  (also emits dist/404.html)
npm run preview   # serve the production build
```

## Command Reference

| Command | Description |
|---|---|
| `ls [path]` | List directory contents |
| `cd [dir]` | Change directory (`cd ..`, `cd ~`, `cd ~/repo/src`) |
| `cat [file]` | Display file contents; opens `resume.pdf` in a new tab |
| `pwd` | Print current path |
| `whoami` | Bio |
| `projects [slug]` | List featured projects, or show one |
| `experience` | Work and research experience |
| `skills` | Focus areas and technologies |
| `contact` | Contact details |
| `social` | GitHub, LinkedIn, photography, email |
| `open [target]` | Open a GitHub repo, or `github` \| `linkedin` \| `resume` |
| `resume` | Open the résumé PDF |
| `help` | List commands |
| `clear` | Clear the terminal |
| `sudo`, `rm`, `hack`, `exit`, `vim`, `vi`, `nano`, `apt …` | Easter eggs |

### Keyboard shortcuts

| Key | Action |
|---|---|
| Tab | Autocomplete command name or argument |
| Up / Down | Command history |
| Ctrl+C | Interrupt input (or copy selection) |
| Ctrl+L | Clear screen and replay boot |

## Project Structure

```
src/
├── data/                     # Shared data layer (single source of truth)
│   ├── profile.ts  projects.ts  experience.ts  links.ts  index.ts
├── routing/
│   ├── routes.ts             # pure route logic (parseRoute, pathForPrimary, …) + tests
│   ├── RouteBridge.tsx       # the one route → store effect
│   ├── useRouteControls.ts   # store → route, from event handlers only
│   ├── useIsMobile.ts  DocumentTitle.tsx
├── store/windowStore.ts      # Zustand — open/close/minimize/maximize/focus/geometry
├── components/
│   ├── Desktop/  Dock/  Window/
│   ├── apps/
│   │   ├── Portfolio/        # Portfolio.tsx, ProjectCard.tsx, ProjectDetail.tsx
│   │   └── Terminal/         # xterm.js mount (lazy)
│   ├── mobile/               # MobileShell, TerminalUnavailable
│   ├── routes/               # NotFound, ResumeRedirect, Hi
│   └── common/               # AppErrorBoundary, RootErrorBoundary
├── terminal/                 # command registry, virtual FS, GitHub client, boot
├── App.tsx  main.tsx  reset.css
```

## Development Notes

- **CSS Modules only** — no Tailwind, no styled-components. Styles co-located as
  `*.module.css`. Shared design tokens (the "Console / instrumentation"
  vocabulary — surfaces, rules, corner-tick panels, section rails, accents) live
  as CSS custom properties in `src/styles/tokens.css`.
- **Type** — Archivo (names / titles / summaries / body) + JetBrains Mono
  (metadata / labels / tags / buttons / anything structural), one combined
  Google Fonts request.
- **URL ↔ window state** — the URL owns the primary app and selected project;
  Zustand owns window open/minimize/maximize/geometry/z-order. `navigate()` is
  called only from event handlers; `RouteBridge` is the only URL-reactive effect.
- **Mobile** — below 768px (`useIsMobile`) the desktop shell, windows, and dock
  are bypassed; Portfolio renders inline.
- **No backend, no SSR** — fully static. The GitHub token is embedded in the
  bundle; use a minimal read-only scope.
- **Adding a command** — implement `Command` (`src/terminal/types.ts`), add it to
  a file under `src/terminal/commands/`, register it in
  `src/terminal/commandRegistry.ts`. Autocomplete picks it up automatically.
- **Deploy** — GitHub Actions (`.github/workflows/deploy.yml`) builds on push to
  `main` and publishes `dist/` to GitHub Pages; `public/CNAME` sets `azeemme.com`.

## License

Not open-source licensed. All rights reserved by Azeem Ehtisham.
