import './reset.css'
import { lazy, Suspense } from 'react'
import { useLocation } from 'react-router-dom'
import { projectSlugs } from './data/projects'
import { parseRoute } from './routing/routes'

// Each top-level branch is its own chunk so `/hi` and the 404 page do not pull
// in the desktop shell / Portfolio / xterm.js (plan §14 "independently lightweight").
const Desktop = lazy(() => import('./components/Desktop/Desktop'))
const NotFound = lazy(() => import('./components/routes/NotFound'))
const ResumeRedirect = lazy(() => import('./components/routes/ResumeRedirect'))
const Hi = lazy(() => import('./components/routes/Hi'))

/**
 * Top-level route view. The URL is the source of truth for primary content
 * (plan §4). Standalone pages (`/hi`, 404, `/resume`) render outside the desktop
 * shell; everything else renders the desktop, where <RouteBridge> opens the app
 * the route names.
 */
export default function App() {
  const { pathname } = useLocation()
  const route = parseRoute(pathname, projectSlugs)

  let view
  if (route.type === 'not-found') view = <NotFound />
  else if (route.type === 'resume') view = <ResumeRedirect />
  else if (route.type === 'hi') view = <Hi />
  else view = <Desktop />

  return <Suspense fallback={<RouteFallback />}>{view}</Suspense>
}

/** Full-bleed dark placeholder while a route chunk loads — never a blank white screen (plan §11). */
function RouteFallback() {
  return (
    <div
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, background: '#0a1830' }}
    />
  )
}
