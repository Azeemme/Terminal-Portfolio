import { describe, it, expect } from 'vitest'
import {
  parseRoute,
  pathForPrimary,
  primaryAppOf,
  nextPrimaryAfterClose,
  type ParsedRoute,
} from './routes'

const SLUGS = ['bioreactorxr', 'suits', 'stylegentsia'] as const

describe('parseRoute', () => {
  it('maps / to Portfolio home', () => {
    expect(parseRoute('/', SLUGS)).toEqual({ type: 'portfolio', section: 'home', slug: null })
  })

  it('maps /desktop to the bare desktop', () => {
    expect(parseRoute('/desktop', SLUGS)).toEqual({ type: 'desktop' })
  })

  it('maps /terminal to Terminal', () => {
    expect(parseRoute('/terminal', SLUGS)).toEqual({ type: 'terminal' })
  })

  it('maps /projects to Portfolio project list', () => {
    expect(parseRoute('/projects', SLUGS)).toEqual({
      type: 'portfolio',
      section: 'projects',
      slug: null,
    })
  })

  it('maps a known project slug to a project route', () => {
    expect(parseRoute('/projects/bioreactorxr', SLUGS)).toEqual({
      type: 'project',
      section: 'projects',
      slug: 'bioreactorxr',
    })
  })

  it('maps an unknown project slug to project-not-found', () => {
    expect(parseRoute('/projects/nope', SLUGS)).toEqual({
      type: 'project-not-found',
      slug: 'nope',
    })
  })

  it('maps /hi to the networking page', () => {
    expect(parseRoute('/hi', SLUGS)).toEqual({ type: 'hi' })
  })

  it('maps /resume to a resume redirect', () => {
    expect(parseRoute('/resume', SLUGS)).toEqual({ type: 'resume' })
  })

  it('maps unknown routes to not-found', () => {
    expect(parseRoute('/nonsense', SLUGS)).toEqual({ type: 'not-found' })
    expect(parseRoute('/projects/a/b', SLUGS)).toEqual({ type: 'not-found' })
  })

  it('tolerates trailing and duplicate slashes', () => {
    expect(parseRoute('/projects/', SLUGS)).toEqual({
      type: 'portfolio',
      section: 'projects',
      slug: null,
    })
    expect(parseRoute('//projects//suits/', SLUGS)).toEqual({
      type: 'project',
      section: 'projects',
      slug: 'suits',
    })
  })

  it('decodes percent-encoded slugs', () => {
    expect(parseRoute('/projects/a%20b', SLUGS)).toEqual({
      type: 'project-not-found',
      slug: 'a b',
    })
  })
})

describe('primaryAppOf', () => {
  const cases: Array<[ParsedRoute, ReturnType<typeof primaryAppOf>]> = [
    [{ type: 'portfolio', section: 'home', slug: null }, 'portfolio'],
    [{ type: 'project', section: 'projects', slug: 'suits' }, 'portfolio'],
    [{ type: 'project-not-found', slug: 'x' }, 'portfolio'],
    [{ type: 'terminal' }, 'terminal'],
    [{ type: 'desktop' }, null],
    [{ type: 'hi' }, null],
    [{ type: 'not-found' }, null],
  ]
  it.each(cases)('%o -> %s', (route, expected) => {
    expect(primaryAppOf(route)).toBe(expected)
  })
})

describe('pathForPrimary', () => {
  it('builds the terminal path', () => {
    expect(pathForPrimary('terminal')).toBe('/terminal')
  })
  it('builds the portfolio home path', () => {
    expect(pathForPrimary('portfolio')).toBe('/')
    expect(pathForPrimary('portfolio', null)).toBe('/')
  })
  it('builds the project list path', () => {
    expect(pathForPrimary('portfolio', 'projects')).toBe('/projects')
  })
  it('builds a project detail path', () => {
    expect(pathForPrimary('portfolio', 'bioreactorxr')).toBe('/projects/bioreactorxr')
  })
})

describe('round-trip: parseRoute <-> pathForPrimary (Back/Forward stability)', () => {
  const paths = ['/', '/terminal', '/projects', '/projects/bioreactorxr', '/projects/suits']
  it.each(paths)('%s survives a parse/build round trip', (path) => {
    const route = parseRoute(path, SLUGS)
    const primary = primaryAppOf(route)
    expect(primary).not.toBeNull()
    const slug =
      route.type === 'project'
        ? route.slug
        : route.type === 'portfolio' && route.section === 'projects'
          ? 'projects'
          : null
    expect(pathForPrimary(primary as 'portfolio' | 'terminal', slug)).toBe(path)
  })
})

describe('nextPrimaryAfterClose', () => {
  const win = (id: string, isOpen: boolean, zIndex: number) => ({ id, isOpen, zIndex })

  it('returns the most-recently-focused remaining routed app', () => {
    const windows = {
      portfolio: win('portfolio', true, 105),
      terminal: win('terminal', true, 110),
    }
    expect(nextPrimaryAfterClose(windows, 'portfolio')).toBe('terminal')
  })

  it('prefers the higher z-index among survivors', () => {
    const windows = {
      portfolio: win('portfolio', true, 130),
      terminal: win('terminal', true, 110),
    }
    expect(nextPrimaryAfterClose(windows, 'terminal')).toBe('portfolio')
  })

  it('ignores closed / not-open windows', () => {
    const windows = {
      portfolio: win('portfolio', false, 200),
      terminal: win('terminal', true, 100),
    }
    expect(nextPrimaryAfterClose(windows, 'portfolio')).toBe('terminal')
  })

  it('returns null (=> /desktop) when no routed app remains', () => {
    const windows = {
      portfolio: win('portfolio', true, 100),
      terminal: win('terminal', false, 90),
      aichat: win('aichat', true, 300),
    }
    expect(nextPrimaryAfterClose(windows, 'portfolio')).toBeNull()
  })
})
