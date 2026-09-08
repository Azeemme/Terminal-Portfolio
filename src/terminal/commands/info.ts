import type { Command, TerminalContext } from '../types'
import { WHOAMI_CONTENT } from '../filesystem/fakeFiles'
import { contactLinks } from '../../data/links'

export const helpCommand: Command = {
  name: 'help',
  description: 'Show this help message',
  execute: async (_args: string[], ctx: TerminalContext) => {
    const commands: [string, string][] = [
      ['ls [path]', 'List directory contents'],
      ['cd [dir]', 'Change directory'],
      ['cat [file]', 'Display file contents'],
      ['pwd', 'Print working directory'],
      ['whoami', 'About me'],
      ['projects [slug]', 'List featured projects, or show one'],
      ['experience', 'Work and research experience'],
      ['skills', 'Focus areas and technologies'],
      ['contact', 'Contact details'],
      ['social', 'Social links and contact'],
      ['open [target]', 'Open a GitHub repo, or github | linkedin | resume'],
      ['resume', 'Open resume (PDF)'],
      ['help', 'Show this help message'],
      ['clear', 'Clear the terminal'],
    ]
    ctx.writeOutput('Available commands:')
    for (const [cmd, desc] of commands) {
      const padded = cmd.padEnd(16)
      ctx.writeOutput(`  ${padded}\x1b[2m${desc}\x1b[0m`)
    }
  },
}

export const whoamiCommand: Command = {
  name: 'whoami',
  description: 'About me',
  execute: async (_args: string[], ctx: TerminalContext) => {
    const lines = WHOAMI_CONTENT.split('\n')
    for (const line of lines) {
      ctx.writeOutput(line)
    }
  },
}

export const socialCommand: Command = {
  name: 'social',
  description: 'Social links and contact',
  execute: async (_args: string[], ctx: TerminalContext) => {
    for (const link of contactLinks) {
      const value = link.href.startsWith('mailto:')
        ? link.href.slice('mailto:'.length)
        : link.href
      ctx.writeOutput(`  ${link.label.padEnd(10)}\x1b[36m→\x1b[0m  ${value}`)
    }
  },
}
