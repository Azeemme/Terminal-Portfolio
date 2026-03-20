import type { Terminal } from '@xterm/xterm'

export interface DirEntry {
  name: string
  type: 'dir' | 'file'
  download_url?: string
  sha: string
  isFake?: boolean
}

export interface TerminalContext {
  terminal: Terminal
  currentPath: string[]
  setCurrentPath: (path: string[]) => void
  writeOutput: (text: string) => void
  writeError: (text: string) => void
  getCachedDir: (pathKey: string) => DirEntry[] | null
  setCachedDir: (pathKey: string, entries: DirEntry[]) => void
  username: string
  token: string
}

export interface Command {
  name: string
  description: string
  execute: (args: string[], ctx: TerminalContext) => Promise<void>
}
