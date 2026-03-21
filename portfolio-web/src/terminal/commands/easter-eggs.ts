import type { Command, TerminalContext } from '../types'

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function writeAptUpdateOutput(ctx: TerminalContext): void {
  ctx.writeOutput('Reading package lists...')
  ctx.writeOutput('Building dependency tree...')
  ctx.writeOutput('Reading state information...')
  ctx.writeOutput('All packages are up to date.')
}

function writeAptUpgradeOutput(ctx: TerminalContext): void {
  ctx.writeOutput('Reading package lists...')
  ctx.writeOutput('Building dependency tree...')
  ctx.writeOutput('Calculating upgrade...')
  ctx.writeOutput('0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.')
}

export const aptUpdateCommand: Command = {
  name: 'apt',
  description: 'Easter egg',
  execute: async (args: string[], ctx: TerminalContext) => {
    const sub = args[0]
    if (sub === 'update') {
      writeAptUpdateOutput(ctx)
      return
    }
    if (sub === 'upgrade') {
      writeAptUpgradeOutput(ctx)
      return
    }
    ctx.writeError('apt: command not found')
  },
}

function writeSudoEasterEggHelp(ctx: TerminalContext): void {
  const col = 20
  const rows: [string, string][] = [
    ['rm', 'remove files'],
    ['hack', 'run security tool'],
    ['exit', 'exit the shell'],
    ['vim', 'text editor'],
    ['vi', 'text editor'],
    ['nano', 'text editor'],
    ['apt update', 'update package lists'],
    ['apt upgrade', 'upgrade installed packages'],
    ['sudo apt update', 'update package lists as root'],
    ['sudo apt upgrade', 'upgrade packages as root'],
  ]

  ctx.writeOutput('Commands:')
  ctx.writeOutput('')
  for (const [cmd, desc] of rows) {
    ctx.writeOutput(`  ${cmd.padEnd(col)}\x1b[2m${desc}\x1b[0m`)
  }
}

export const sudoCommand: Command = {
  name: 'sudo',
  description: 'Superuser command',
  execute: async (args: string[], ctx: TerminalContext) => {
    if (args.length === 0) {
      writeSudoEasterEggHelp(ctx)
      return
    }

    const sub = args[0]
    if (sub === 'apt') {
      const action = args[1]
      if (action === 'update') {
        writeAptUpdateOutput(ctx)
        return
      }
      if (action === 'upgrade') {
        writeAptUpgradeOutput(ctx)
        return
      }
    }
    ctx.writeOutput("Nice try. This isn't that kind of terminal.")
  },
}

export const rmCommand: Command = {
  name: 'rm',
  description: 'Remove files',
  execute: async (_args: string[], ctx: TerminalContext) => {
    const dirs = ['/bin', '/home', '/usr', '/etc']
    for (const dir of dirs) {
      ctx.writeOutput(`Deleting ${dir}...`)
      await delay(200)
    }
    ctx.writeOutput('Just kidding. Everything is fine.')
  },
}

export const hackCommand: Command = {
  name: 'hack',
  description: 'Hack the mainframe',
  execute: async (_args: string[], ctx: TerminalContext) => {
    ctx.writeOutput('Initializing exploit...')
    await delay(300)

    for (let i = 0; i < 5; i++) {
      const hexParts: string[] = []
      for (let j = 0; j < 8; j++) {
        const val = Math.floor(Math.random() * 0xffff)
        hexParts.push('0x' + val.toString(16).padStart(4, '0'))
      }
      ctx.writeOutput(hexParts.join(' '))
      await delay(150)
    }

    ctx.writeOutput('\x1b[92mACCESS GRANTED. Welcome, operator.\x1b[0m')
  },
}

export const exitCommand: Command = {
  name: 'exit',
  description: 'Exit terminal',
  execute: async (_args: string[], ctx: TerminalContext) => {
    ctx.writeOutput('There is no escape from the portfolio.')
  },
}

export const vimCommand: Command = {
  name: 'vim',
  description: 'Text editor',
  execute: async (_args: string[], ctx: TerminalContext) => {
    ctx.writeOutput("Editor not found. Try 'cat' instead.")
  },
}

export const viCommand: Command = {
  name: 'vi',
  description: 'Text editor',
  execute: async (_args: string[], ctx: TerminalContext) => {
    ctx.writeOutput("Editor not found. Try 'cat' instead.")
  },
}

export const nanoCommand: Command = {
  name: 'nano',
  description: 'Text editor',
  execute: async (_args: string[], ctx: TerminalContext) => {
    ctx.writeOutput("Editor not found. Try 'cat' instead.")
  },
}
