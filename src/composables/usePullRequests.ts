import { computed, ref } from 'vue'

export interface PullRequest {
  id: number
  title: string
  url: string
  number: number
  repo: string
  apiUrl: string
  author: string
  authorUrl: string
  avatar: string
  createdAt: string
  updatedAt: string
  draft: boolean
  comments: number
  reactions: number
  commits: number | null
  additions: number | null
  deletions: number | null
  changedFiles: number | null
}

export interface PullStats {
  total: number
  ready: number
  draft: number
  repos: number
}

interface SearchItem {
  id: number
  title: string
  html_url: string
  number: number
  repository_url: string
  created_at: string
  updated_at: string
  draft?: boolean
  comments: number
  reactions?: { total_count: number }
  user: { login: string; html_url: string; avatar_url: string }
}

interface SearchResponse {
  total_count: number
  items: SearchItem[]
}

interface PullDetail {
  commits: number
  additions: number
  deletions: number
  changed_files: number
}

const ENDPOINT =
  'https://api.github.com/search/issues?q=is:pr+is:open+user:MaxNagibator&per_page=100&sort=updated'

const HEADERS = { Accept: 'application/vnd.github+json' }

const repoFrom = (url: string): string => url.slice(url.lastIndexOf('/') + 1)

export function usePullRequests() {
  const pulls = ref<PullRequest[]>([])
  const total = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const load = async (): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(ENDPOINT, { headers: HEADERS })
      if (!res.ok) throw new Error(`GitHub ${res.status}`)
      const data = (await res.json()) as SearchResponse
      total.value = data.total_count
      pulls.value = data.items.map((it) => ({
        id: it.id,
        title: it.title,
        url: it.html_url,
        number: it.number,
        repo: repoFrom(it.repository_url),
        apiUrl: `${it.repository_url}/pulls/${it.number}`,
        author: it.user.login,
        authorUrl: it.user.html_url,
        avatar: it.user.avatar_url,
        createdAt: it.created_at,
        updatedAt: it.updated_at,
        draft: it.draft ?? false,
        comments: it.comments,
        reactions: it.reactions?.total_count ?? 0,
        commits: null,
        additions: null,
        deletions: null,
        changedFiles: null,
      }))
      void Promise.all(pulls.value.map(enrich))
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Не удалось загрузить'
    } finally {
      loading.value = false
    }
  }

  const enrich = async (pr: PullRequest): Promise<void> => {
    const res = await fetch(pr.apiUrl, { headers: HEADERS }).catch(() => null)
    if (!res || !res.ok) return
    const d = (await res.json().catch(() => null)) as PullDetail | null
    if (!d) return
    pr.commits = d.commits
    pr.additions = d.additions
    pr.deletions = d.deletions
    pr.changedFiles = d.changed_files
  }

  const stats = computed<PullStats>(() => ({
    total: pulls.value.length,
    ready: pulls.value.filter((p) => !p.draft).length,
    draft: pulls.value.filter((p) => p.draft).length,
    repos: new Set(pulls.value.map((p) => p.repo)).size,
  }))

  return { pulls, total, stats, loading, error, load }
}
