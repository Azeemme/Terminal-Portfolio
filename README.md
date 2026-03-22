# Terminal Portfolio

> A browser-based personal portfolio presented as a Windows-style desktop shell — explore the owner's background by typing real terminal commands.

## Overview

Terminal Portfolio turns a developer portfolio into an interactive experience. Visitors land on a Windows 10/11-style desktop and open a terminal window that behaves like a real shell. The virtual filesystem at `~/` exposes injected profile files (`whoami.txt`, `contact.txt`, `resume.pdf`) alongside every public GitHub repository as a live, browsable directory. Type `ls`, `cd`, `cat`, and `open` to navigate — actual GitHub API responses power every listing and file read.

The project is fully static and deploys to Vercel with no backend.

## Features

- Windows 10/11 chrome — draggable, resizable windows via react-rnd; minimize, maximize, and close controls on the right
- xterm.js terminal on canvas with JetBrains Mono, blinking block cursor, and a VS Code-inspired color theme
- Boot splash: ANSI color ASCII portrait rendered side-by-side with a live info panel
- Virtual filesystem rooted at `~/` — fake profile files plus all public GitHub repos as directories
- Live GitHub API browsing — `ls` and `cat` inside any repo directory fetch real contents
- Session-scoped directory cache — repeated `ls` calls never re-fetch
- Tab autocomplete — command names at the prompt; filenames and directory names for arguments; longest-common-prefix expansion for multiple matches
- Command history — up/down arrow navigation, capped at 500 entries, no consecutive duplicates
- Keyboard shortcuts — Ctrl+C (interrupt or copy selection), Ctrl+L (clear + replay boot)
- Animated gradient desktop background with a subtle dot-grid overlay
- Dock with open-app indicators; auto-hides when a window is maximized
- Easter eggs behind `sudo`, `rm`, `hack`, `vim`, `vi`, `nano`, `exit`, and `apt`

## Tech Stack

| Layer | Library | Version |
|---|---|---|
| UI framework | React | ^18.3 |
| State management | Zustand | ^4.5 |
| Window management | react-rnd | ^10.4 |
| Terminal emulator | @xterm/xterm | ^5.5 |
| Terminal addons | @xterm/addon-fit, @xterm/addon-web-links | ^0.10 / ^0.11 |
| Build tool | Vite | ^5.4 |
| Language | TypeScript | ^5.5 |

## Prerequisites

- Node.js 18 or later
- npm 9 or later (or an equivalent package manager)
- A GitHub Personal Access Token (optional, but raises the API rate limit from 60 to 5000 requests/hr)

## Installation

```bash
git clone https://github.com/Azeemme/Terminal-Portfolio.git
cd Terminal-Portfolio
npm install
```

Copy the example environment file and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Read-only PAT scoped to public repos only.
# This token is embedded in the browser bundle — keep it minimal scope.
VITE_GITHUB_TOKEN=ghp_yourTokenHere

# GitHub username whose repositories appear as directories.
VITE_GITHUB_USERNAME=Azeemme
```

Both variables are optional. Without `VITE_GITHUB_TOKEN` the app falls back to the unauthenticated rate limit (60 requests/hr per IP). Without `VITE_GITHUB_USERNAME` it defaults to `Azeemme`.

## Usage

### Start the dev server

```bash
npm run dev
```

Open `http://localhost:5173` in a browser (1024px minimum viewport — no mobile layout).

### Build for production

```bash
npm run build
```

Output lands in `dist/`. Deploy the `dist/` folder to any static host (Vercel, Netlify, GitHub Pages, etc.).

### Preview the production build locally

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Command Reference

Commands available in the terminal:

| Command | Description |
|---|---|
| `ls [path]` | List directory contents |
| `cd [dir]` | Change directory (`cd ..`, `cd ~`, `cd ~/repo/src`) |
| `cat [file]` | Display file contents; opens `resume.pdf` in a new tab |
| `pwd` | Print current path |
| `whoami` | Display bio |
| `social` | Print GitHub, LinkedIn, photography, and email links |
| `open [repo]` | Open a GitHub repository in the browser |
| `help` | Show all available commands |
| `clear` | Clear the terminal |
| `sudo` | Easter egg help menu |
| `rm` | Easter egg (fake rm -rf /) |
| `hack` | Easter egg |
| `exit` / `vim` / `vi` / `nano` | Easter eggs |
| `apt update` / `apt upgrade` | Easter eggs |

### Keyboard shortcuts

| Key | Action |
|---|---|
| Tab | Autocomplete command name or argument |
| Up / Down | Navigate command history |
| Ctrl+C | Interrupt current input (or copy selected text) |
| Ctrl+L | Clear screen and replay boot sequence |

### Filesystem layout

```
~/
├── whoami.txt        # Bio (hardcoded)
├── contact.txt       # Contact links (hardcoded)
├── resume.pdf        # Opens resume URL in a new tab
├── Terminal-Portfolio/   # GitHub repo (live)
├── <other-repo>/         # GitHub repo (live)
└── ...
```

Inside any repo directory, `ls` and `cat` fetch live content from the GitHub Contents API. Results are cached per path for the duration of the browser session.

## Configuration

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_GITHUB_TOKEN` | No | `""` | Read-only GitHub PAT; raises rate limit to 5000 req/hr |
| `VITE_GITHUB_USERNAME` | No | `Azeemme` | GitHub username whose repos populate `~/` |

Set both in `.env.local` (development) or in your hosting provider's environment variable settings (production). Never commit `.env.local` — it is in `.gitignore`.

## Project Structure

```
Terminal-Portfolio/
├── public/
│   └── terminal-window-icon.png   # Title bar icon
├── src/
│   ├── assets/
│   │   ├── Azeem-ascii-ansi.txt   # ANSI color ASCII portrait (boot splash)
│   │   └── ascii-art.ts           # Re-exports the raw art as a string
│   ├── components/
│   │   ├── Desktop/               # Root layout, renders windows + dock
│   │   ├── Dock/                  # Taskbar with app buttons and indicators
│   │   ├── Window/                # react-rnd wrapper with Windows-style chrome
│   │   └── apps/Terminal/         # xterm.js mount, input handler, all keybindings
│   ├── store/
│   │   └── windowStore.ts         # Zustand store — open/close/minimize/maximize/focus
│   ├── terminal/
│   │   ├── bootSequence.ts        # ASCII art + info panel rendered on mount
│   │   ├── commandRegistry.ts     # Central registry; initializeCommands() populates it
│   │   ├── types.ts               # Command, TerminalContext, DirEntry interfaces
│   │   ├── commands/
│   │   │   ├── filesystem.ts      # ls, cd, cat, pwd
│   │   │   ├── info.ts            # help, whoami, social
│   │   │   ├── actions.ts         # open, clear
│   │   │   └── easter-eggs.ts     # sudo, rm, hack, exit, vim, vi, nano, apt
│   │   └── filesystem/
│   │       ├── fakeFiles.ts       # Hardcoded profile constants and fake DirEntry list
│   │       ├── githubApi.ts       # Typed GitHub API client (fetchRepos, fetchRepoContents, fetchFileContent)
│   │       └── virtualFs.ts       # Path utilities, binary file detection, ANSI sanitizer
│   ├── App.tsx
│   ├── main.tsx
│   └── reset.css
├── .env.example                   # Copy to .env.local and fill in values
├── vite.config.ts
├── tsconfig.app.json
└── package.json
```

## Development Notes

- **CSS Modules only** — no Tailwind, no styled-components. All styles live in `*.module.css` files co-located with their component.
- **No mobile layout** — the app targets a minimum viewport of 1024px.
- **No backend, no SSR** — fully static. The GitHub token is embedded in the browser bundle; use a minimal read-only scope.
- **Adding a command** — implement the `Command` interface in `src/terminal/types.ts`, add the handler to the appropriate file under `src/terminal/commands/`, and register it via `registerCommand()` in `src/terminal/commandRegistry.ts`. Tab autocomplete picks it up automatically.
- **Replacing the ASCII art** — generate a new ANSI art file with `ascii-image-converter -C` and overwrite `src/assets/Azeem-ascii-ansi.txt`. The boot sequence reads it as a raw Vite import.
- **Resume URL** — set `RESUME_URL` in `src/terminal/filesystem/fakeFiles.ts` before deploying. It currently defaults to `'#'`.

## License

This project is not open-source licensed. All rights reserved by Azeem Ehtisham.
