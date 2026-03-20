import type { DirEntry } from '../types'

export async function fetchRepos(username: string): Promise<DirEntry[]> {
  void username
  return []
}

export async function fetchRepoContents(
  username: string,
  repo: string,
  path: string,
): Promise<DirEntry[]> {
  void username
  void repo
  void path
  return []
}
