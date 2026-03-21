import type { Command } from './types'
import { lsCommand, cdCommand, catCommand, pwdCommand } from './commands/filesystem'
import { helpCommand, whoamiCommand, socialCommand } from './commands/info'
import { openCommand, clearCommand } from './commands/actions'
import {
  aptUpdateCommand,
  exitCommand,
  hackCommand,
  nanoCommand,
  rmCommand,
  sudoCommand,
  viCommand,
  vimCommand,
} from './commands/easter-eggs'

export const commandRegistry: Record<string, Command> = {}

export function registerCommand(cmd: Command): void {
  commandRegistry[cmd.name] = cmd
}

/** Registers every command once at app init. Keys drive tab completion for command names (FR-042). */
export function initializeCommands(): void {
  // Filesystem commands
  registerCommand(lsCommand)
  registerCommand(cdCommand)
  registerCommand(catCommand)
  registerCommand(pwdCommand)

  // Info commands
  registerCommand(helpCommand)
  registerCommand(whoamiCommand)
  registerCommand(socialCommand)

  // Action commands
  registerCommand(openCommand)
  registerCommand(clearCommand)

  // Easter egg commands (includes apt — extra easter egg beyond PRD list)
  registerCommand(sudoCommand)
  registerCommand(aptUpdateCommand)
  registerCommand(rmCommand)
  registerCommand(hackCommand)
  registerCommand(exitCommand)
  registerCommand(vimCommand)
  registerCommand(viCommand)
  registerCommand(nanoCommand)
}
