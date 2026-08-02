import { computed, ref, shallowRef } from 'vue'
import { langColor, loadRepos, OWNER } from '@/composables/useForkMap'
import { readCache, writeCache } from '@/utils/cache'
import { fetchGitHub, githubResponse } from '@/utils/github'
import { plural } from '@/utils/format'

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
  draft: number
  repos: number
}

export interface PullRow {
  pr: PullRequest
  days: number
  age: string
  lang: string
  color: string
  gap: number
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

interface CachedDetail {
  updated: string
  detail: PullDetail
}

const ENDPOINT =
  `https://api.github.com/search/issues?q=is:pr+is:open+user:${OWNER}` +
  '&per_page=100&sort=updated'

const DETAILS_KEY = 'pull-details'
const DETAILS_TTL = 30 * 60 * 1000

const DAY_MS = 86_400_000
const GAP_MIN = 26
const GAP_MAX = 118
const GAP_STEP = 22

const PENDING_COLOR = 'var(--color-text-muted)'

const repoFrom = (url: string): string => url.slice(url.lastIndexOf('/') + 1)

const detailKey = (pr: PullRequest): string => `${pr.repo}#${pr.number}`

const readDetails = (): Record<string, CachedDetail> =>
  readCache<Record<string, CachedDetail>>(DETAILS_KEY, DETAILS_TTL) ?? {}

const applyDetail = (pr: PullRequest, d: PullDetail): void => {
  pr.commits = d.commits
  pr.additions = d.additions
  pr.deletions = d.deletions
  pr.changedFiles = d.changed_files
}

const daysBetween = (from: number, to: number): number =>
  Math.max(0, Math.round((to - from) / DAY_MS))

const ageLabel = (days: number): string =>
  days === 0 ? 'сегодня' : `${days} ${plural(days, 'день', 'дня', 'дней')}`

const gapPx = (days: number): number =>
  Math.round(Math.min(GAP_MAX, Math.max(GAP_MIN, GAP_STEP * Math.log2(1 + days))))

export function usePullRequests() {
  const pulls = ref<PullRequest[]>([])
  const langs = shallowRef<ReadonlyMap<string, string>>(new Map())
  const total = ref(0)
  const loading = ref(false)
  const loaded = ref(false)
  const error = ref<string | null>(null)

  const loadLangs = async (): Promise<void> => {
    const list = await loadRepos().catch(() => null)
    if (list) langs.value = new Map(list.map((r) => [r.name.toLowerCase(), r.lang]))
  }

  const load = async (): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      const data = await fetchGitHub<SearchResponse>(ENDPOINT)
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
      void loadLangs()
      void enrich()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'не удалось загрузить'
    } finally {
      loading.value = false
      loaded.value = true
    }
  }

  const enrich = async (): Promise<void> => {
    const cache = readDetails()
    const misses: PullRequest[] = []
    for (const pr of pulls.value) {
      const hit = cache[detailKey(pr)]
      if (hit && hit.updated === pr.updatedAt) applyDetail(pr, hit.detail)
      else misses.push(pr)
    }
    if (!misses.length) return

    let fetched = false
    await Promise.all(
      misses.map(async (pr) => {
        const res = await githubResponse(pr.apiUrl)
        if (!res?.ok) return
        const d = (await res.json().catch(() => null)) as PullDetail | null
        if (!d) return
        applyDetail(pr, d)
        cache[detailKey(pr)] = { updated: pr.updatedAt, detail: d }
        fetched = true
      }),
    )
    if (fetched) writeCache(DETAILS_KEY, cache)
  }

  const stats = computed<PullStats>(() => ({
    total: pulls.value.length,
    draft: pulls.value.filter((p) => p.draft).length,
    repos: new Set(pulls.value.map((p) => p.repo)).size,
  }))

  const rows = computed<PullRow[]>(() => {
    const now = Date.now()
    const sorted = [...pulls.value].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    const at = sorted.map((pr) => new Date(pr.createdAt).getTime())
    return sorted.map((pr, i) => {
      const lang = langs.value.get(pr.repo.toLowerCase()) ?? ''
      const born = at[i] ?? now
      const days = daysBetween(born, now)
      return {
        pr,
        days,
        age: ageLabel(days),
        lang,
        color: lang ? langColor(lang) : PENDING_COLOR,
        gap: gapPx(daysBetween(born, at[i + 1] ?? now)),
      }
    })
  })

  return { rows, total, stats, loading, loaded, error, load }
}
