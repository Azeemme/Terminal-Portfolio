import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useWindowStore } from '../store/windowStore'
import { projectSlugs } from '../data'
import { parseRoute, primaryAppOf, primaryFocusAction } from './routes'

/**
 * The single route → store synchronisation point (plan §4).
 *
 * This is the ONLY effect in the app that reacts to the URL. It idempotently
 * opens + focuses the app the route names. It never calls `navigate()`, so it
 * cannot form a loop with the event-handler-driven store → route direction.
 */
export default function RouteBridge() {
  const { pathname } = useLocation()
  const route = parseRoute(pathname, projectSlugs)
  const primary = primaryAppOf(route)

  useLayoutEffect(() => {
    // `/desktop`, `/hi`, `/resume`, 404 — never auto-open Portfolio (plan §4).
    if (!primary) return

    const { windows, topZ, openApp, focusApp } = useWindowStore.getState()
    const action = primaryFocusAction(windows[primary], topZ)

    if (action === 'open') openApp(primary) // openApp() also focuses + un-minimizes
    else if (action === 'focus') focusApp(primary)
  }, [primary, pathname])

  return null
}
