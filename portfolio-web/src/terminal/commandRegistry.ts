import type { Command } from './types'
import { catCommand, cdCommand, lsCommand, pwdCommand } from './commands/filesystem'
import { helpCommand, socialCommand, whoamiCommand } from './commands/info'

export const commandRegistry: Record<string, Command> = {}

export function registerCommand(cmd: Command): void {
  commandRegistry[cmd.name] = cmd
}

// Register all commands by importing command modules (which self-register).
// This function should be called once during app initialization.
export function initializeCommands(): void {
  registerCommand(lsCommand)
  registerCommand(cdCommand)
  registerCommand(catCommand)
  registerCommand(pwdCommand)
  registerCommand(helpCommand)
  registerCommand(whoamiCommand)
  registerCommand(socialCommand)
}
