import type { Command, TerminalContext } from '../types'
import { profile } from '../../data/profile'
import { experience } from '../../data/experience'
import { projects, getProject, visibleProjects } from '../../data/projects'
import { contactLinks } from '../../data/links'
import { EMAIL_ADDRESS } from '../filesystem/fakeFiles'

const DIM = (s: string) => `\x1b[2m${s}\x1b[0m`
const GREEN = (s: string) => `\x1b[38;5;82m${s}\x1b[0m`
const CYAN = (s: string) => `\x1b[36m${s}\x1b[0m`

function printProjectDetail(ctx: TerminalContext, slug: string): void {
  const project = getProject(slug)
  if (!project) {
    ctx.writeError(`projects: ${slug}: no such project`)
    ctx.writeOutput(DIM(`try: projects`))
    return
  }

  const role = project.detailFacts.find((f) => f.label === 'Role')?.value
  const since =
    project.detailFacts.find((f) => f.label === 'Since')?.value ??
    project.detailFacts.find((f) => f.label === 'Duration')?.value

  ctx.writeOutput(GREEN(project.title))
  ctx.writeOutput(
    DIM([project.category, role, since].filter(Boolean).join('  ·  ')),
  )
  ctx.writeOutput('')
  ctx.writeOutput(project.summary)

  const tech = project.detailTechnologies.length
    ? project.detailTechnologies
    : project.technologies
  if (tech.length > 0) {
    ctx.writeOutput('')
    ctx.writeOutput(`${GREEN('Tech')}   ${tech.join(', ')}`)
  }

  for (const section of project.sections) {
    ctx.writeOutput('')
    ctx.writeOutput(GREEN(section.heading))
    ctx.writeOutput(section.body)
  }

  if (project.systemFlow) {
    ctx.writeOutput('')
    ctx.writeOutput(GREEN('System flow'))
    ctx.writeOutput(
      project.systemFlow.map((s) => `${s.label} → ${s.value}`).join('  |  '),
    )
  }

  if (project.desktopOnlyDemo && project.demoUrl) {
    ctx.writeOutput('')
    ctx.writeOutput(
      DIM('Desktop Demo — keyboard and mouse recommended. ') + CYAN(project.demoUrl),
    )
  }

  const external = [...project.detailActions, ...project.actions].filter((a) => a.external)
  const seen = new Set<string>()
  for (const link of external) {
    if (seen.has(link.href)) continue
    seen.add(link.href)
    ctx.writeOutput(`  ${link.label.replace(/\s*↗$/, '').padEnd(18)}${CYAN(link.href)}`)
  }
}

export const projectsCommand: Command = {
  name: 'projects',
  description: 'List featured projects, or show one: projects <slug>',
  execute: async (args: string[], ctx: TerminalContext) => {
    if (args.length > 0) {
      printProjectDetail(ctx, args[0].toLowerCase())
      return
    }

    ctx.writeOutput('Featured projects:')
    ctx.writeOutput('')
    for (const project of visibleProjects()) {
      ctx.writeOutput(`  ${GREEN((project.index + ' ' + project.slug).padEnd(24))}${project.title}`)
      ctx.writeOutput(`  ${' '.repeat(24)}${DIM(project.cardSummary)}`)
    }
    ctx.writeOutput('')
    ctx.writeOutput(DIM('Details: projects <slug>'))
  },
}

export const experienceCommand: Command = {
  name: 'experience',
  description: 'Work and research experience',
  execute: async (_args: string[], ctx: TerminalContext) => {
    for (const entry of experience) {
      ctx.writeOutput(GREEN(entry.role))
      ctx.writeOutput(DIM(entry.organization))
      ctx.writeOutput(entry.summary)
      ctx.writeOutput('')
    }
  },
}

export const contactCommand: Command = {
  name: 'contact',
  description: 'Contact details',
  execute: async (_args: string[], ctx: TerminalContext) => {
    ctx.writeOutput(`${GREEN('Email')}   ${CYAN(EMAIL_ADDRESS)}`)
    for (const link of contactLinks) {
      if (link.href.startsWith('mailto:')) continue
      ctx.writeOutput(`${GREEN(link.label.padEnd(8))}${CYAN(link.href)}`)
    }
  },
}

export const skillsCommand: Command = {
  name: 'skills',
  description: 'Focus areas and selected technologies',
  execute: async (_args: string[], ctx: TerminalContext) => {
    ctx.writeOutput(`${GREEN('Focus')}   ${profile.focusAreas.join(' · ')}`)

    const tech = Array.from(
      new Set(
        projects
          .flatMap((p) => p.technologies)
          .filter((t) => !/placeholder/i.test(t)),
      ),
    )
    if (tech.length > 0) {
      ctx.writeOutput(`${GREEN('Tech')}    ${tech.join(', ')}`)
    }
    ctx.writeOutput('')
    ctx.writeOutput(DIM('A fuller breakdown lands with the Stage 2 content pass.'))
  },
}
