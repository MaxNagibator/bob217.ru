const HEADERS = { Accept: 'application/vnd.github+json' }

export const githubResponse = (url: string): Promise<Response | null> =>
  fetch(url, { headers: HEADERS }).catch(() => null)

export const fetchGitHub = async <T>(url: string): Promise<T> => {
  const res = await githubResponse(url)
  if (!res) throw new Error('GitHub недоступен')
  if (!res.ok)
    throw new Error(res.status === 403 ? 'лимит GitHub исчерпан' : `GitHub ${res.status}`)
  return (await res.json()) as T
}
