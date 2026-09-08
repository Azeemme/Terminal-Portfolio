import type { Command, TerminalContext } from '../types'
import {
  FAKE_FILES,
  GITHUB_URL,
  LINKEDIN_URL,
  PORTFOLIO_OWNER,
  PORTFOLIO_REPO_NAME,
  RESUME_URL,
} from '../filesystem/fakeFiles'
import { apiErrorMessage, fetchRepos } from '../filesystem/githubApi'
import { pathKey } from '../filesystem/virtualFs'

/** Named shortcuts for `open` beyond GitHub repositories (plan §9). */
const OPEN_SHORTCUTS: Record<string, { url: string; label: string }> = {
  github: { url: GITHUB_URL, label: 'GitHub profile' },
  linkedin: { url: LINKEDIN_URL, label: 'LinkedIn' },
  resume: { url: RESUME_URL, label: 'resume' },
}

export const openCommand: Command = {
  name: 'open',
  description: 'Open a GitHub repo, or: open github | linkedin | resume',
  execute: async (args: string[], ctx: TerminalContext) => {
    const username = ctx.username

    const shortcut = args[0] ? OPEN_SHORTCUTS[args[0].toLowerCase()] : undefined
    if (shortcut) {
      window.open(shortcut.url, '_blank')
      ctx.writeOutput(`Opening ${shortcut.label}...`)
      return
    }

    if (args.length === 0) {
      if (ctx.currentPath.length === 1) {
        window.open(`https://github.com/${PORTFOLIO_OWNER}/${PORTFOLIO_REPO_NAME}`, '_blank')
        ctx.writeOutput('Opening portfolio repository...')
        return
      }

      const repoName = ctx.currentPath[1]
      window.open(`https://github.com/${username}/${repoName}`, '_blank')
      ctx.writeOutput(`Opening github.com/${username}/${repoName}...`)
      return
    }

    const repoArgRaw = args[0]
    const repoArg = repoArgRaw.replace(/\/+$/, '')

    const rootKey = pathKey(['~'])
    let rootEntries = ctx.getCachedDir(rootKey)
    if (!rootEntries) {
      try {
        const repos = await fetchRepos(ctx.username)
        rootEntries = [...FAKE_FILES, ...repos]
        ctx.setCachedDir(rootKey, rootEntries)
      } catch (err: unknown) {
        const status = (err as { status?: number })?.status || 0
        const msg = apiErrorMessage(status)
        ctx.writeError(msg || 'open: API error')
        return
      }
    }

    if (repoArg === '') {
      ctx.writeError(`open: ${repoArgRaw}: repository not found`)
      return
    }

    const fileEntry = rootEntries.find((e) => e.name === repoArg && e.type === 'file')
    const found = rootEntries.find(
      (e) => e.name === repoArg && e.type === 'dir' && !e.isFake,
    )

    if (fileEntry) {
      ctx.writeError(`open: ${repoArgRaw}: Is a file`)
      return
    }

    if (!found) {
      ctx.writeError(`open: ${repoArgRaw}: repository not found`)
      return
    }

    window.open(`https://github.com/${username}/${repoArg}`, '_blank')
    ctx.writeOutput(`Opening github.com/${username}/${repoArg}...`)
  },
}

export const resumeCommand: Command = {
  name: 'resume',
  description: 'Open resume (PDF)',
  execute: async (_args: string[], ctx: TerminalContext) => {
    window.open(RESUME_URL, '_blank')
    ctx.writeOutput('Opening resume...')
  },
}

export const clearCommand: Command = {
  name: 'clear',
  description: 'Clear the terminal',
  execute: async (_args: string[], ctx: TerminalContext) => {
    ctx.terminal.clear()
  },
}
