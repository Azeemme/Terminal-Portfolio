import type { DirEntry } from '../types'

const BASE_URL = 'https://api.github.com'

async function githubFetch(url: string, token: string): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  if (token) headers.Authorization = `Bearer ${token}`

  try {
    const response = await fetch(url, { headers })
    if (!response.ok) throw { status: response.status }
    return response
  } catch (err: unknown) {
    const maybe = err as { status?: unknown }
    if (typeof maybe?.status === 'number') throw { status: maybe.status }
    throw { status: 0 } // network error
  }
}

export function apiErrorMessage(status: number): string {
  if (status === 401)
    return 'Error: GitHub API authentication failed. Set VITE_GITHUB_TOKEN in .env.local.'
  if (status === 403) return 'Error: GitHub API rate limit exceeded. Try again later.'
  if (status === 404) return '' // caller handles 404 specifically
  if (status === 429) return 'Error: GitHub API rate limit exceeded. Try again later.'
  if (status >= 500) return 'Error: GitHub API unavailable. Try again later.'
  if (status === 0) return 'Error: Network request failed. Check your connection.'
  return 'Error: Unexpected API error.'
}

export async function fetchRepos(username: string): Promise<DirEntry[]> {
  const token = import.meta.env.VITE_GITHUB_TOKEN || ''
  const url = `${BASE_URL}/users/${username}/repos?per_page=100&sort=updated`
  const response = await githubFetch(url, token)
  const repos: any[] = await response.json()

  return repos.map((repo) => ({
    name: repo.name,
    type: 'dir' as const,
    sha: repo.node_id || String(repo.id),
  }))
}

export async function fetchRepoContents(
  username: string,
  repo: string,
  path: string,
): Promise<DirEntry[]> {
  const token = import.meta.env.VITE_GITHUB_TOKEN || ''
  const encodedPath = path ? encodeURIComponent(path).replace(/%2F/g, '/') : ''
  const url = `${BASE_URL}/repos/${username}/${repo}/contents/${encodedPath}`

  const response = await githubFetch(url, token)
  const data: any = await response.json()

  // Defensive: if single object returned instead of array
  if (!Array.isArray(data)) {
    return [
      {
        name: data.name,
        type: data.type === 'dir' ? 'dir' : 'file',
        download_url: data.download_url,
        sha: data.sha,
      },
    ]
  }

  return data.map((item: any) => ({
    name: item.name,
    type: item.type === 'dir' ? ('dir' as const) : ('file' as const),
    download_url: item.download_url,
    sha: item.sha,
  }))
}

export interface FileContentResult {
  content: string | null
}

/** GET file metadata + base64 content from `/contents/{path}` (not `download_url`). */
export async function fetchFileContent(
  username: string,
  repo: string,
  filePath: string,
): Promise<FileContentResult> {
  const token = import.meta.env.VITE_GITHUB_TOKEN || ''
  const encodedPath = encodeURIComponent(filePath).replace(/%2F/g, '/')
  const url = `${BASE_URL}/repos/${username}/${repo}/contents/${encodedPath}`
  const response = await githubFetch(url, token)
  const data: unknown = await response.json()
  if (Array.isArray(data)) {
    return { content: null }
  }
  const obj = data as { content?: string | null; type?: string }
  if (obj.type === 'dir') {
    return { content: null }
  }
  const content = obj.content ?? null
  return { content }
}
