import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { profile } from '../data/profile'
import { projectSlugs, projectTitles } from '../data/projects'
import { parseRoute } from './routes'

const SUFFIX = profile.name
const HOME_TITLE = `${profile.name} — ${profile.title}`

interface RouteMeta {
  /** `document.title`. */
  title: string
  /** Short spoken label for the live region. */
  label: string
}

function metaFor(pathname: string): RouteMeta {
  const route = parseRoute(pathname, projectSlugs)
  switch (route.type) {
    case 'portfolio':
      return route.section === 'projects'
        ? { title: `Projects — ${SUFFIX}`, label: 'Projects' }
        : { title: HOME_TITLE, label: 'Portfolio' }
    case 'project': {
      const title = projectTitles[route.slug]
      return title
        ? { title: `${title} — ${SUFFIX}`, label: `${title} project` }
        : { title: `Project not found — ${SUFFIX}`, label: 'Project not found' }
    }
    case 'project-not-found':
      return { title: `Project not found — ${SUFFIX}`, label: 'Project not found' }
    case 'terminal':
      return { title: `Terminal — ${SUFFIX}`, label: 'Terminal' }
    case 'hi':
      return { title: `Hi — ${SUFFIX}`, label: 'Contact card' }
    case 'not-found':
      return { title: `Page not found — ${SUFFIX}`, label: 'Page not found' }
    case 'desktop':
      return { title: HOME_TITLE, label: 'Desktop' }
    case 'resume':
    default:
      return { title: HOME_TITLE, label: 'Portfolio' }
  }
}

/**
 * Keeps `document.title` in sync with the route (plan §13 — project-specific
 * browser titles "where practical", no SSR) and politely announces client-side
 * navigations to assistive tech (plan §10).
 */
export default function DocumentTitle() {
  const { pathname } = useLocation()
  const { title, label } = metaFor(pathname)

  useEffect(() => {
    document.title = title
  }, [title])

  // An `aria-live` region does not announce content that is already present when
  // it first mounts, so the initial page is not announced — only later route
  // changes are.
  return (
    <div className="sr-only" role="status" aria-live="polite">
      {label}
    </div>
  )
}
