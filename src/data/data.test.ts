import { describe, it, expect } from 'vitest'
import { profile } from './profile'
import {
  projects,
  projectSlugs,
  projectTitles,
  getProject,
  visibleProjects,
  featuredProjects,
} from './projects'
import { experience } from './experience'
import { links, contactLinks, RESUME_PATH } from './links'

describe('profile', () => {
  it('keeps the positioning lines', () => {
    expect(profile.title).toBe('Software & Systems Engineer')
    expect(profile.tagline).toBe('XR · Full-Stack · Infrastructure')
    expect(profile.focusAreas).toEqual(['XR', 'Full-Stack', 'Infrastructure'])
  })

  it('NOW field is a current role (not a role that has ended)', () => {
    // The design's NOW field showed a Jan–Jul 2026 role; corrected to the
    // ongoing research fellowship (see status doc).
    expect(profile.facts.now.role).toMatch(/Research Fellow/i)
  })
})

describe('projects', () => {
  it('has the three approved featured projects in order', () => {
    expect(projectSlugs).toEqual(['bioreactorxr', 'off-grid-telemetry', 'suits'])
    expect(projects.map((p) => p.index)).toEqual(['01', '02', '03'])
    expect(projects.every((p) => p.featured && p.status === 'public')).toBe(true)
  })

  it('standalone slug / title lookups stay in sync with the project list', () => {
    expect([...projectSlugs]).toEqual(projects.map((p) => p.slug))
    for (const p of projects) expect(projectTitles[p.slug]).toBe(p.title)
    expect(Object.keys(projectTitles).sort()).toEqual([...projectSlugs].sort())
  })

  it('has unique, url-safe slugs', () => {
    const seen = new Set<string>()
    for (const p of projects) {
      expect(p.slug).toMatch(/^[a-z0-9-]+$/)
      expect(seen.has(p.slug)).toBe(false)
      seen.add(p.slug)
    }
  })

  it('every project has media with a path + alt text', () => {
    for (const p of projects) {
      expect(p.media.src).toMatch(/^\/projects\/.+\.(png|webp|jpg|jpeg)$/)
      expect(p.media.alt.length).toBeGreaterThan(0)
    }
  })

  it('ships no placeholder / lorem strings in public content', () => {
    const blob = JSON.stringify(projects).toLowerCase()
    expect(blob).not.toContain('placeholder')
    expect(blob).not.toContain('lorem')
    expect(blob).not.toContain('tbd')
    expect(blob).not.toContain('finalized in stage 2')
  })

  it('every action is either an internal link or an absolute/mailto external', () => {
    for (const p of projects) {
      for (const a of [...p.actions, ...p.detailActions]) {
        if (a.internal) {
          expect(a.external).toBe(false)
          expect(a.href).toMatch(/^\/projects\//)
        } else {
          expect(a.external).toBe(true)
          expect(a.href).toMatch(/^https?:\/\//)
        }
      }
    }
  })

  it('getProject resolves known slugs and rejects unknown ones', () => {
    expect(getProject('suits')?.title).toBe('NASA SUITS')
    expect(getProject('stylegentsia')).toBeUndefined()
  })

  it('bioreactorxr is a desktop-only demo with an external demo URL (plan §6)', () => {
    const b = getProject('bioreactorxr')!
    expect(b.desktopOnlyDemo).toBe(true)
    expect(b.demoUrl).toBe('https://bioreactorxr.azeemme.com')
    expect(b.demoNotice).toBeTruthy()
  })

  it('visibleProjects / featuredProjects are consistent', () => {
    expect(visibleProjects().every((p) => p.status !== 'hidden')).toBe(true)
    expect(featuredProjects().every((p) => p.featured)).toBe(true)
  })
})

describe('experience', () => {
  it('is compressed and every entry has a real date + org', () => {
    expect(experience.length).toBeLessThanOrEqual(4)
    for (const e of experience) {
      expect(e.start).toMatch(/\d{4}/)
      expect(e.organization.length).toBeGreaterThan(0)
    }
  })

  it('at least one current entry, and the ended Space Force role is marked ended', () => {
    expect(experience.some((e) => e.current)).toBe(true)
    const ussf = experience.find((e) => /space force/i.test(e.organization))
    expect(ussf?.current).toBe(false)
    expect(ussf?.end).toBe('Jul 2026')
  })
})

describe('links', () => {
  it('resume points at the static asset', () => {
    expect(links.resume.href).toBe(RESUME_PATH)
    expect(RESUME_PATH).toBe('/Resume.pdf')
  })

  it('contactLinks expose the four channels', () => {
    const labels = contactLinks.map((l) => l.label)
    expect(labels).toEqual(
      expect.arrayContaining(['GitHub', 'LinkedIn', 'Email', 'Photography']),
    )
  })
})
