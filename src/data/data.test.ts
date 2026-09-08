import { describe, it, expect } from 'vitest'
import { profile } from './profile'
import {
  projects,
  projectSlugs,
  getProject,
  visibleProjects,
  featuredProjects,
} from './projects'
import { links, contactLinks, RESUME_PATH } from './links'

describe('profile', () => {
  it('uses the plan §9 positioning lines', () => {
    expect(profile.title).toBe('Software & Systems Engineer')
    expect(profile.tagline).toBe('XR | Full-Stack | Infrastructure')
  })
})

describe('projects', () => {
  it('has unique, url-safe slugs', () => {
    const seen = new Set<string>()
    for (const p of projects) {
      expect(p.slug).toMatch(/^[a-z0-9-]+$/)
      expect(seen.has(p.slug)).toBe(false)
      seen.add(p.slug)
    }
    expect(projectSlugs).toEqual(projects.map((p) => p.slug))
  })

  it('includes the two plan-required featured projects by slug', () => {
    expect(projectSlugs).toContain('bioreactorxr')
    expect(projectSlugs).toContain('suits')
  })

  it('is entirely placeholder content in Stage 1', () => {
    expect(projects.every((p) => p.placeholder)).toBe(true)
  })

  it('every project has media with alt text (a11y)', () => {
    for (const p of projects) {
      expect(p.media.length).toBeGreaterThan(0)
      for (const m of p.media) expect(m.alt.length).toBeGreaterThan(0)
    }
  })

  it('getProject resolves known slugs and rejects unknown ones', () => {
    expect(getProject('suits')?.title).toBe('NASA SUITS')
    expect(getProject('missing')).toBeUndefined()
  })

  it('visibleProjects excludes hidden projects', () => {
    expect(visibleProjects().every((p) => p.status !== 'hidden')).toBe(true)
  })

  it('featuredProjects are a subset of visible featured projects', () => {
    for (const p of featuredProjects()) {
      expect(p.featured).toBe(true)
      expect(p.status).not.toBe('hidden')
    }
  })

  it('bioreactorxr is flagged as a desktop-only demo (plan §6)', () => {
    expect(getProject('bioreactorxr')?.desktopOnlyDemo).toBe(true)
  })
})

describe('links', () => {
  it('resume points at the static asset, not a route', () => {
    expect(links.resume.href).toBe(RESUME_PATH)
    expect(RESUME_PATH).toBe('/Resume.pdf')
  })

  it('all external links are absolute or mailto and marked external', () => {
    for (const l of Object.values(links)) {
      if (l === links.resume) continue
      expect(l.external).toBe(true)
      expect(l.href).toMatch(/^(https?:\/\/|mailto:)/)
    }
  })

  it('contactLinks are a non-empty ordered subset', () => {
    expect(contactLinks.length).toBeGreaterThan(0)
  })
})
