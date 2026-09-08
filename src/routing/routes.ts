/**
 * Pure route logic. No DOM, no router, no Zustand imports — this module is unit
 * tested directly (plan §15) and is the single source of truth for the mapping
 * between URL pathnames and primary/focused desktop state (plan §4, §5).
 *
 * Invariants enforced here:
 * - The URL determines the primary/focused app and the selected project.
 * - Secondary windows are NOT represented in the URL.
 */

/** Apps that can be the URL-primary (routed) application. */
export type PrimaryApp = 'portfolio' | 'terminal'

export const PROJECTS_PATH = '/projects'
export const DESKTOP_PATH = '/desktop'
export const TERMINAL_PATH = '/terminal'
export const HI_PATH = '/hi'
export const HOME_PATH = '/'
// The static resume path lives in the shared data layer (`src/data/links.ts`);
// it is intentionally not re-exported here to keep a single source of truth.

export type ParsedRoute =
  /** `/` and `/projects` — Portfolio with no / list selection. */
  | { type: 'portfolio'; section: 'home' | 'projects'; slug: null }
  /** `/projects/:slug` where `:slug` is a known project. */
  | { type: 'project'; section: 'projects'; slug: string }
  /** `/projects/:slug` where `:slug` is unknown — render project-not-found. */
  | { type: 'project-not-found'; slug: string }
  /** `/terminal`. */
  | { type: 'terminal' }
  /** `/desktop` — deterministic bare desktop. */
  | { type: 'desktop' }
  /** `/hi` — lightweight networking page. */
  | { type: 'hi' }
  /** `/resume` — redirect to the static `/Resume.pdf` asset. */
  | { type: 'resume' }
  /** Anything else — render the 404 state. */
  | { type: 'not-found' }

function normalize(pathname: string): string {
  if (!pathname) return '/'
  // Collapse a trailing slash (except for root) and any duplicate slashes.
  const collapsed = pathname.replace(/\/{2,}/g, '/')
  if (collapsed.length > 1 && collapsed.endsWith('/')) {
    return collapsed.slice(0, -1)
  }
  return collapsed
}

/**
 * Map a pathname to a route. `knownSlugs` decides project vs. project-not-found
 * so this stays pure (no data import needed for the mapping itself).
 */
export function parseRoute(pathname: string, knownSlugs: readonly string[]): ParsedRoute {
  const path = normalize(pathname)

  if (path === HOME_PATH) return { type: 'portfolio', section: 'home', slug: null }
  if (path === DESKTOP_PATH) return { type: 'desktop' }
  if (path === TERMINAL_PATH) return { type: 'terminal' }
  if (path === HI_PATH) return { type: 'hi' }
  if (path === '/resume') return { type: 'resume' }
  if (path === PROJECTS_PATH) return { type: 'portfolio', section: 'projects', slug: null }

  const projectMatch = path.match(/^\/projects\/([^/]+)$/)
  if (projectMatch) {
    const slug = decodeURIComponent(projectMatch[1])
    if (knownSlugs.includes(slug)) {
      return { type: 'project', section: 'projects', slug }
    }
    return { type: 'project-not-found', slug }
  }

  return { type: 'not-found' }
}

/** The primary app a parsed route focuses, or `null` for bare desktop / standalone pages. */
export function primaryAppOf(route: ParsedRoute): PrimaryApp | null {
  switch (route.type) {
    case 'portfolio':
    case 'project':
    case 'project-not-found':
      return 'portfolio'
    case 'terminal':
      return 'terminal'
    default:
      return null
  }
}

/**
 * Build the canonical pathname for a primary app.
 * - `terminal` → `/terminal`
 * - `portfolio` with a slug → `/projects/:slug`
 * - `portfolio` with `'projects'` → `/projects`
 * - `portfolio` with no slug → `/`
 */
export function pathForPrimary(
  primary: PrimaryApp,
  slug?: string | 'projects' | null,
): string {
  if (primary === 'terminal') return TERMINAL_PATH
  if (slug === 'projects') return PROJECTS_PATH
  if (slug) return `${PROJECTS_PATH}/${encodeURIComponent(slug)}`
  return HOME_PATH
}

interface RoutedWindowState {
  isOpen: boolean
  isMinimized: boolean
  zIndex: number
}

/**
 * What the route → store bridge should do to make `win` the visible, focused
 * primary app for the current URL. Pure so the decision is unit tested without
 * a DOM (covers the "restore from minimized" path in particular).
 *
 * - `'open'`   — window is closed OR minimized: needs a full open (clears both).
 * - `'focus'`  — window is visible but not on top: raise it.
 * - `'noop'`   — already open, not minimized, already on top.
 */
export function primaryFocusAction(
  win: RoutedWindowState | undefined,
  topZ: number,
): 'open' | 'focus' | 'noop' {
  if (!win || !win.isOpen || win.isMinimized) return 'open'
  if (win.zIndex !== topZ) return 'focus'
  return 'noop'
}

interface ClosableWindow {
  id: string
  isOpen: boolean
  zIndex: number
}

/**
 * When the routed app is closed, choose the most-recently-focused remaining
 * *routed* app (plan §4). Returns `null` when none remain → navigate to
 * `/desktop`. `aichat` and any non-routed window are ignored.
 */
export function nextPrimaryAfterClose(
  windows: Record<string, ClosableWindow | undefined>,
  closedId: string,
): PrimaryApp | null {
  const routed: PrimaryApp[] = ['portfolio', 'terminal']
  const candidates = routed
    .filter((id) => id !== closedId)
    .map((id) => windows[id])
    .filter((w): w is ClosableWindow => !!w && w.isOpen)
    .sort((a, b) => b.zIndex - a.zIndex)

  return candidates.length > 0 ? (candidates[0].id as PrimaryApp) : null
}
