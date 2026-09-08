import { parseRoute } from '../../routing/routes'
import { projectSlugs } from '../../data'
import { useLocation } from 'react-router-dom'
import Portfolio from '../apps/Portfolio/Portfolio'
import TerminalUnavailable from './TerminalUnavailable'

/**
 * Mobile / small-tablet presentation (plan §6): the simulated desktop, draggable
 * windows, and dock are bypassed. Portfolio renders directly with normal
 * document scrolling against the same shared data and routes. `/terminal` gets a
 * lightweight desktop-only notice.
 */
export default function MobileShell() {
  const { pathname } = useLocation()
  const route = parseRoute(pathname, projectSlugs)

  if (route.type === 'terminal') return <TerminalUnavailable />

  // portfolio / project / project-not-found / desktop → Portfolio inline.
  return <Portfolio bare />
}
