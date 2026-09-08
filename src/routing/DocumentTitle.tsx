import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { profile } from '../data/profile'
import { getProject, projectSlugs } from '../data/projects'
import { parseRoute } from './routes'

const SUFFIX = profile.name
const HOME_TITLE = `${profile.name} — ${profile.title}`

function titleFor(pathname: string): string {
  const route = parseRoute(pathname, projectSlugs)
  switch (route.type) {
    case 'portfolio':
      return route.section === 'projects' ? `Projects — ${SUFFIX}` : HOME_TITLE
    case 'project': {
      const project = getProject(route.slug)
      return project ? `${project.title} — ${SUFFIX}` : `Project not found — ${SUFFIX}`
    }
    case 'project-not-found':
      return `Project not found — ${SUFFIX}`
    case 'terminal':
      return `Terminal — ${SUFFIX}`
    case 'hi':
      return `Hi — ${SUFFIX}`
    case 'not-found':
      return `Page not found — ${SUFFIX}`
    case 'desktop':
    case 'resume':
    default:
      return HOME_TITLE
  }
}

/**
 * Keeps `document.title` in sync with the route (plan §13 — project-specific
 * browser titles "where practical", no SSR).
 */
export default function DocumentTitle() {
  const { pathname } = useLocation()
  useEffect(() => {
    document.title = titleFor(pathname)
  }, [pathname])
  return null
}
