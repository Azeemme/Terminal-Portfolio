import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useWindowStore } from '../store/windowStore'
import { projectSlugs } from '../data'
import {
  parseRoute,
  primaryAppOf,
  pathForPrimary,
  nextPrimaryAfterClose,
  DESKTOP_PATH,
  type ParsedRoute,
  type PrimaryApp,
} from './routes'

interface FocusOpts {
  /** Replace the history entry instead of pushing (used for focus-follow, not deliberate nav). */
  replace?: boolean
}

/**
 * Bridges router state and the window store from *event handlers only*.
 * Nothing here runs from an effect — that is what keeps history, route state,
 * and Zustand from forming a sync loop (plan §4).
 */
export function useRouteControls() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const route: ParsedRoute = parseRoute(pathname, projectSlugs)
  const currentPrimary = primaryAppOf(route)

  const openApp = useWindowStore((s) => s.openApp)
  const focusApp = useWindowStore((s) => s.focusApp)
  const closeApp = useWindowStore((s) => s.closeApp)

  /**
   * Focus a routed app (dock button, window mousedown) and reflect it in the URL.
   * `openApp` (not bare `focusApp`) so a minimized window is also restored even
   * when the URL is already correct.
   */
  const goToPrimary = useCallback(
    (primary: PrimaryApp, slug?: string | 'projects' | null, opts?: FocusOpts) => {
      openApp(primary)
      const target = pathForPrimary(primary, slug)
      if (target !== pathname) navigate(target, { replace: opts?.replace })
    },
    [openApp, navigate, pathname],
  )

  /**
   * Focus a window from a raw click on its frame. Routed apps reflect focus in
   * the URL, but:
   * - if the app is already the URL primary, keep the URL as-is (preserves an
   *   open `/projects/:slug` detail) and just restore/raise the window;
   * - otherwise use a *replace* navigation — focus-follow is not a deliberate
   *   navigation milestone, and this avoids a spurious extra history entry when
   *   the same gesture also triggers a card click (mousedown then click).
   */
  const focusWindow = useCallback(
    (id: string) => {
      const isRouted = id === 'portfolio' || id === 'terminal'
      if (!isRouted) {
        focusApp(id)
        return
      }
      if (currentPrimary === id) {
        openApp(id)
        return
      }
      goToPrimary(id, null, { replace: true })
    },
    [currentPrimary, openApp, focusApp, goToPrimary],
  )

  /** Navigate to a project detail (card click). */
  const openProject = useCallback(
    (slug: string) => {
      openApp('portfolio')
      navigate(pathForPrimary('portfolio', slug))
    },
    [openApp, navigate],
  )

  /** Close a window; if it was the routed app, move focus + URL per plan §4. */
  const closeWindow = useCallback(
    (id: string) => {
      const windows = useWindowStore.getState().windows
      closeApp(id)

      const isRouted = id === 'portfolio' || id === 'terminal'
      if (!isRouted || currentPrimary !== id) return

      const next = nextPrimaryAfterClose(windows, id)
      navigate(next ? pathForPrimary(next) : DESKTOP_PATH)
    },
    [closeApp, navigate, currentPrimary],
  )

  return { route, currentPrimary, goToPrimary, focusWindow, openProject, closeWindow }
}
