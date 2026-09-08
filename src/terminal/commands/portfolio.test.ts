import { describe, it, expect } from 'vitest'
import type { TerminalContext } from '../types'
import {
  projectsCommand,
  experienceCommand,
  contactCommand,
  skillsCommand,
} from './portfolio'
import { projectSlugs } from '../../data/projects'

function mockCtx() {
  const out: string[] = []
  const err: string[] = []
  const ctx = {
    writeOutput: (t: string) => out.push(t),
    writeError: (t: string) => err.push(t),
  } as unknown as TerminalContext
  // Strip ANSI for assertions.
  const ansi = new RegExp(String.fromCharCode(0x1b) + '\\[[0-9;]*m', 'g')
  const plain = () => out.join('\n').replace(ansi, '')
  return { ctx, out, err, plain }
}

describe('projects command', () => {
  it('lists every visible project slug', async () => {
    const { ctx, plain } = mockCtx()
    await projectsCommand.execute([], ctx)
    for (const slug of projectSlugs) expect(plain()).toContain(slug)
  })

  it('shows a single project by slug', async () => {
    const { ctx, plain } = mockCtx()
    await projectsCommand.execute(['bioreactorxr'], ctx)
    expect(plain()).toContain('BioreactorXR')
    expect(plain()).toContain('Unity')
    expect(plain()).toMatch(/Desktop Demo/i)
  })

  it('errors on an unknown slug', async () => {
    const { ctx, err } = mockCtx()
    await projectsCommand.execute(['nope'], ctx)
    expect(err.join('\n')).toMatch(/no such project/i)
  })
})

describe('experience command', () => {
  it('prints the seeded role', async () => {
    const { ctx, plain } = mockCtx()
    await experienceCommand.execute([], ctx)
    expect(plain()).toMatch(/Data Mine/i)
  })
})

describe('contact command', () => {
  it('prints an email and no raw mailto: scheme', async () => {
    const { ctx, plain } = mockCtx()
    await contactCommand.execute([], ctx)
    expect(plain()).toContain('azeemmehtisham@gmail.com')
    expect(plain()).not.toContain('mailto:')
  })
})

describe('skills command', () => {
  it('lists focus areas and omits placeholder technologies', async () => {
    const { ctx, plain } = mockCtx()
    await skillsCommand.execute([], ctx)
    expect(plain()).toContain('XR')
    expect(plain()).not.toMatch(/placeholder/i)
  })
})
