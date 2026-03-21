import type { Command, TerminalContext } from '../types'
import {
  EMAIL_ADDRESS,
  LINKEDIN_URL,
  PORTFOLIO_PHOTO_URL,
  WHOAMI_CONTENT,
} from '../filesystem/fakeFiles'

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
      ['social', 'Social links and contact'],
      ['open [repo]', 'Open a GitHub repository in browser'],
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
    const links: [string, string][] = [
      ['GitHub   ', `https://github.com/${ctx.username}`],
      ['LinkedIn ', LINKEDIN_URL],
      ['Portfolio', PORTFOLIO_PHOTO_URL],
      ['Email    ', EMAIL_ADDRESS],
    ]
    for (const [label, value] of links) {
      ctx.writeOutput(`  ${label}  \x1b[36m→\x1b[0m  ${value}`)
    }
  },
}
