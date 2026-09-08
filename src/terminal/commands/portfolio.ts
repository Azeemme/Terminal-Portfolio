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

  ctx.writeOutput(GREEN(project.title))
  ctx.writeOutput(DIM(`${project.category}  ·  ${project.role}  ·  ${project.date}`))
  ctx.writeOutput('')
  ctx.writeOutput(project.summary)

  if (project.technologies.length > 0) {
    ctx.writeOutput('')
    ctx.writeOutput(`${GREEN('Tech')}   ${project.technologies.join(', ')}`)
  }

  for (const section of project.sections) {
    ctx.writeOutput('')
    ctx.writeOutput(GREEN(section.heading))
    ctx.writeOutput(section.body)
  }

  if (project.desktopOnlyDemo) {
    ctx.writeOutput('')
    ctx.writeOutput(
      DIM('Desktop Demo — best with a keyboard and mouse.') +
        (project.demoUrl ? ` ${CYAN(project.demoUrl)}` : DIM(' Link coming in Stage 2.')),
    )
  }

  for (const link of project.links) {
    ctx.writeOutput(`  ${link.label.padEnd(12)}${CYAN(link.href)}`)
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
      ctx.writeOutput(`  ${GREEN(project.slug.padEnd(16))}${project.title}`)
      ctx.writeOutput(`  ${' '.repeat(16)}${DIM(project.summary)}`)
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
