export function pathToString(path: string[]): string {
  // ['~'] => '~'
  // ['~', 'repo', 'src'] => '~/repo/src'
  if (path.length === 1) return '~'
  return path.join('/')
}

export function pathKey(path: string[]): string {
  return path.join('/')
}

const BINARY_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.ico',
  '.bmp',
  '.svg',
  '.woff',
  '.woff2',
  '.ttf',
  '.otf',
  '.eot',
  '.zip',
  '.tar',
  '.gz',
  '.exe',
  '.bin',
  '.pdf',
  '.mp4',
  '.mp3',
  '.wav',
  '.webm',
  '.mov',
])

export function isBinaryFile(filename: string): boolean {
  const lastDot = filename.lastIndexOf('.')
  if (lastDot === -1) return false
  const ext = filename.slice(lastDot).toLowerCase()
  return BINARY_EXTENSIONS.has(ext)
}

// Strip cursor-movement and erase ANSI sequences while preserving color/style sequences.
export function sanitizeAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;]*[ABCDEFGJKST]/g, '')
}

export function getRepoName(currentPath: string[]): string | null {
  // ['~', 'repo-name', ...] => 'repo-name'
  if (currentPath.length < 2) return null
  return currentPath[1]
}

export function getSubPath(currentPath: string[]): string {
  // ['~', 'repo-name', 'src', 'index.ts'] => 'src/index.ts'
  // ['~', 'repo-name'] => ''
  if (currentPath.length <= 2) return ''
  return currentPath.slice(2).join('/')
}

export const MAX_PATH_DEPTH = 10

export function isPathTooDeep(path: string[]): boolean {
  return path.length > MAX_PATH_DEPTH
}
