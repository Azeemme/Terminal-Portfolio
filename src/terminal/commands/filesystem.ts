import type { Command, DirEntry, TerminalContext } from '../types'
import { FAKE_FILES, getFakeFileContent, RESUME_URL } from '../filesystem/fakeFiles'
import { apiErrorMessage, fetchFileContent, fetchRepoContents, fetchRepos } from '../filesystem/githubApi'
import {
  getRepoName,
  getSubPath,
  isBinaryFile,
  isPathTooDeep,
  pathKey,
  pathToString,
  sanitizeAnsi,
} from '../filesystem/virtualFs'

function colorEntry(entry: DirEntry): string {
  if (entry.type === 'dir') {
    return '\x1b[36m' + entry.name + '\x1b[0m' // cyan for directories
  }
  return '\x1b[37m' + entry.name + '\x1b[0m' // white for files
}

function formatColumns(entries: DirEntry[]): string {
  if (entries.length === 0) return '(empty directory)'

  // If fewer than 4 entries, single column
  if (entries.length < 4) {
    return entries.map((e) => colorEntry(e)).join('\r\n')
  }

  // 3-column layout
  const cols = 3
  const rows = Math.ceil(entries.length / cols)

  // Calculate max width per column (based on raw name length)
  const maxNameLen = Math.max(...entries.map((e) => e.name.length))
  const colWidth = maxNameLen + 2

  const lines: string[] = []
  for (let row = 0; row < rows; row++) {
    let line = ''
    for (let col = 0; col < cols; col++) {
      const idx = col * rows + row // column-major order
      if (idx < entries.length) {
        const entry = entries[idx]
        const colored = colorEntry(entry)
        const padding = ' '.repeat(Math.max(0, colWidth - entry.name.length))
        line += colored + padding
      }
    }
    lines.push(line.trimEnd())
  }

  return lines.join('\r\n')
}

export const lsCommand: Command = {
  name: 'ls',
  description: 'List directory contents',
  execute: async (args: string[], ctx: TerminalContext) => {
    let targetPath = [...ctx.currentPath]

    // Argument (FR-060): relative path argument
    if (args.length > 0 && args[0] !== '.') {
      const arg = args[0]
      targetPath = [...ctx.currentPath, ...arg.split('/').filter(Boolean)]
    }

    const key = pathKey(targetPath)

    let entries = ctx.getCachedDir(key)

    if (!entries) {
      try {
        if (targetPath.length === 1) {
          // At ~/ root: fetch repos + fake files
          const repos = await fetchRepos(ctx.username)
          entries = [...FAKE_FILES, ...repos]
        } else {
          // Inside a repo
          const repo = targetPath[1]
          const subPath = targetPath.slice(2).join('/')
          entries = await fetchRepoContents(ctx.username, repo, subPath)
        }

        ctx.setCachedDir(key, entries)
      } catch (err: any) {
        const status = err?.status || 0
        const msg = apiErrorMessage(status)
        if (msg) {
          ctx.writeError(msg)
        } else {
          ctx.writeError(`ls: cannot access '${pathToString(targetPath)}': API error (HTTP ${status})`)
        }
        return
      }
    }

    const output = formatColumns(entries)
    ctx.writeOutput(output)
  },
}

/** Load directory listing for `buildPath`, using cache first; populates cache on miss. */
async function loadDirEntriesForPath(
  ctx: TerminalContext,
  buildPath: string[]
): Promise<DirEntry[]> {
  const key = pathKey(buildPath)
  let entries = ctx.getCachedDir(key)
  if (entries) return entries
  if (buildPath.length === 1) {
    const repos = await fetchRepos(ctx.username)
    entries = [...FAKE_FILES, ...repos]
  } else {
    const repo = buildPath[1]
    const subPath = buildPath.slice(2).join('/')
    entries = await fetchRepoContents(ctx.username, repo, subPath)
  }
  ctx.setCachedDir(key, entries)
  return entries
}

function writeCdApiError(ctx: TerminalContext, segment: string, err: unknown): void {
  const status = (err as { status?: number })?.status || 0
  const msg = apiErrorMessage(status)
  ctx.writeError(msg || `bash: cd: ${segment}: API error`)
}

export const cdCommand: Command = {
  name: 'cd',
  description: 'Change directory',
  execute: async (args: string[], ctx: TerminalContext) => {
    if (args.length === 0 || args[0] === '~') {
      ctx.setCurrentPath(['~'])
      return
    }

    const arg = args[0]

    if (arg === '..') {
      if (ctx.currentPath.length > 1) {
        ctx.setCurrentPath(ctx.currentPath.slice(0, -1))
      }
      return
    }

    if (arg.startsWith('~/')) {
      const segments = arg.slice(2).split('/').filter(Boolean)
      let buildPath: string[] = ['~']
      for (const segment of segments) {
        if (isPathTooDeep([...buildPath, segment])) {
          ctx.writeError('bash: cd: path too deep')
          return
        }
        let entries: DirEntry[]
        try {
          entries = await loadDirEntriesForPath(ctx, buildPath)
        } catch (err) {
          writeCdApiError(ctx, segment, err)
          return
        }
        const entry = entries.find((e) => e.name === segment)
        if (!entry) {
          ctx.writeError(`bash: cd: ${segment}: No such file or directory`)
          return
        }
        if (entry.type !== 'dir') {
          ctx.writeError(`bash: cd: ${segment}: Not a directory`)
          return
        }
        buildPath = [...buildPath, segment]
      }
      ctx.setCurrentPath(buildPath)
      return
    }

    const segments = arg.split('/').filter(Boolean)
    let buildPath = [...ctx.currentPath]

    for (const segment of segments) {
      if (segment === '..') {
        if (buildPath.length > 1) {
          buildPath = buildPath.slice(0, -1)
        }
        continue
      }

      if (isPathTooDeep([...buildPath, segment])) {
        ctx.writeError('bash: cd: path too deep')
        return
      }

      let entries: DirEntry[]
      try {
        entries = await loadDirEntriesForPath(ctx, buildPath)
      } catch (err) {
        writeCdApiError(ctx, segment, err)
        return
      }

      const entry = entries.find((e) => e.name === segment)
      if (!entry) {
        ctx.writeError(`bash: cd: ${segment}: No such file or directory`)
        return
      }
      if (entry.type !== 'dir') {
        ctx.writeError(`bash: cd: ${segment}: Not a directory`)
        return
      }
      buildPath = [...buildPath, segment]
    }

    ctx.setCurrentPath(buildPath)
  },
}

export const pwdCommand: Command = {
  name: 'pwd',
  description: 'Print working directory',
  execute: async (_args: string[], ctx: TerminalContext) => {
    ctx.writeOutput(pathToString(ctx.currentPath))
  },
}

export const catCommand: Command = {
  name: 'cat',
  description: 'Display file contents',
  execute: async (args: string[], ctx: TerminalContext) => {
    if (args.length === 0) {
      ctx.writeError('cat: missing file operand')
      return
    }

    const filename = args[0]

    if (ctx.currentPath.length === 1) {
      if (filename === 'resume.pdf') {
        window.open(RESUME_URL, '_blank')
        ctx.writeOutput('Opening resume.pdf...')
        return
      }

      const fakeContent = getFakeFileContent(filename)
      if (fakeContent !== null) {
        const lines = fakeContent.split('\n')
        for (const line of lines) {
          ctx.writeOutput(line)
        }
        return
      }
    }

    let dirEntries: DirEntry[]
    try {
      dirEntries = await loadDirEntriesForPath(ctx, ctx.currentPath)
    } catch (err) {
      const status = (err as { status?: number })?.status || 0
      const msg = apiErrorMessage(status)
      ctx.writeError(msg || `cat: ${filename}: API error`)
      return
    }

    const entry = dirEntries.find((e) => e.name === filename)
    if (entry === undefined) {
      ctx.writeError(`cat: ${filename}: No such file or directory`)
      return
    }
    if (entry.type === 'dir') {
      ctx.writeError(`cat: ${filename}: Is a directory`)
      return
    }

    if (isBinaryFile(filename)) {
      ctx.writeOutput('binary file, cannot display')
      return
    }

    const repoName = getRepoName(ctx.currentPath)
    if (!repoName) {
      // Safeguard: GitHub fetch only applies inside a repo; fake files at ~/ are handled above.
      return
    }

    const subPath = getSubPath(ctx.currentPath)
    const filePath = subPath ? `${subPath}/${filename}` : filename

    try {
      const result = await fetchFileContent(ctx.username, repoName, filePath)

      if (!result || !result.content) {
        ctx.writeOutput('binary file, cannot display')
        return
      }

      const decoded = atob(result.content.replace(/\n/g, ''))
      const sanitized = sanitizeAnsi(decoded)
      const lines = sanitized.split('\n')
      const isTruncated = decoded.length > 10000
      const displayLines = isTruncated ? lines.slice(0, 200) : lines

      for (const line of displayLines) {
        ctx.writeOutput(line)
      }

      if (isTruncated) {
        ctx.writeOutput('')
        ctx.writeOutput('... (truncated, file too large to display)')
      }
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status || 0
      if (status === 404) {
        ctx.writeError(`cat: ${filename}: No such file or directory`)
      } else {
        const msg = apiErrorMessage(status)
        ctx.writeError(msg || `cat: ${filename}: API error`)
      }
    }
  },
}
