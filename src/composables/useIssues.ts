import { computed, ref, shallowRef } from 'vue'
import { langColor, loadRepos, OWNER } from '@/composables/useForkMap'
import { readCache, writeCache } from '@/utils/cache'
import { plural } from '@/utils/format'

export interface Issue {
  id: number
  number: number
  title: string
  url: string
  repo: string
  repoUrl: string
  author: string
  authorUrl: string
  comments: number
  createdAt: string
  updatedAt: string
}

export type IssueCode = '??' | ' M'

export interface IssueRow {
  issue: Issue
  code: IssueCode
  days: number
  age: string
  heat: number
}

export interface IssueGroup {
  repo: string
  repoUrl: string
  color: string
  newest: string
  offset: number
  rows: IssueRow[]
}

export interface AgeDot {
  id: number
  x: number
  row: number
  level: number
  label: string
}

export interface IssueStats {
  total: number
  repos: number
  discussed: number
  oldest: number
}

interface SearchItem {
  id: number
  number: number
  title: string
  html_url: string
  repository_url: string
  created_at: string
  updated_at: string
  comments: number
  user: { login: string; html_url: string }
}

interface SearchResponse {
  total_count: number
  items: SearchItem[]
}

const HEADERS = { Accept: 'application/vnd.github+json' }

const ENDPOINT =
  `https://api.github.com/search/issues?q=is:issue+is:open+user:${OWNER}` +
  '&per_page=100&sort=created&order=desc'

const CACHE_KEY = 'open-issues'
const CACHE_TTL = 30 * 60 * 1000

const DAY_MS = 86_400_000
const DOT_GAP = 0.035
const PENDING_COLOR = 'var(--color-text-muted)'

interface Cache {
  total: number
  items: Issue[]
}

const repoFrom = (url: string): string => url.slice(url.lastIndexOf('/') + 1)

const toIssue = (it: SearchItem): Issue => {
  const repo = repoFrom(it.repository_url)
  return {
    id: it.id,
    number: it.number,
    title: it.title,
    url: it.html_url,
    repo,
    repoUrl: `https://github.com/${OWNER}/${repo}`,
    author: it.user.login,
    authorUrl: it.user.html_url,
    comments: it.comments,
    createdAt: it.created_at,
    updatedAt: it.updated_at,
  }
}

const daysSince = (iso: string): number =>
  Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / DAY_MS))

const ageLabel = (days: number): string => {
  if (days === 0) return 'сегодня'
  if (days < 45) return `${days} ${plural(days, 'день', 'дня', 'дней')}`
  if (days < 365) {
    const months = Math.round(days / 30)
    return `${months} ${plural(months, 'месяц', 'месяца', 'месяцев')}`
  }
  const years = Math.floor(days / 365)
  return `${years} ${plural(years, 'год', 'года', 'лет')}`
}

export function useIssues() {
  const issues = ref<Issue[]>([])
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
      const cached = readCache<Cache>(CACHE_KEY, CACHE_TTL)
      if (cached?.items) {
        total.value = cached.total
        issues.value = cached.items
      } else {
        const res = await fetch(ENDPOINT, { headers: HEADERS })
        if (!res.ok)
          throw new Error(res.status === 403 ? 'лимит GitHub исчерпан' : `GitHub ${res.status}`)
        const data = (await res.json()) as SearchResponse
        total.value = data.total_count
        issues.value = data.items.map(toIssue)
        writeCache<Cache>(CACHE_KEY, { total: total.value, items: issues.value })
      }
      void loadLangs()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'не удалось загрузить'
    } finally {
      loading.value = false
      loaded.value = true
    }
  }

  const groups = computed<IssueGroup[]>(() => {
    const list = issues.value
    if (!list.length) return []

    const oldest = list.reduce((max, i) => Math.max(max, daysSince(i.createdAt)), 1)
    const byRepo = new Map<string, Issue[]>()
    for (const issue of list) {
      const bucket = byRepo.get(issue.repo)
      if (bucket) bucket.push(issue)
      else byRepo.set(issue.repo, [issue])
    }

    return [...byRepo.entries()]
      .map(([repo, bucket]) => {
        const sorted = [...bucket].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        const lang = langs.value.get(repo.toLowerCase())
        return {
          repo,
          repoUrl: sorted[0]?.repoUrl ?? `https://github.com/${OWNER}/${repo}`,
          color: lang ? langColor(lang) : PENDING_COLOR,
          newest: sorted[0]?.createdAt ?? '',
          offset: 0,
          rows: sorted.map((issue) => {
            const days = daysSince(issue.createdAt)
            return {
              issue,
              code: issue.comments ? (' M' as IssueCode) : ('??' as IssueCode),
              days,
              age: ageLabel(days),
              heat: Math.min(1, days / oldest),
            }
          }),
        }
      })
      .sort((a, b) => b.newest.localeCompare(a.newest))
      .map((group, i, all) => ({
        ...group,
        offset: all.slice(0, i).reduce((sum, g) => sum + g.rows.length, 0) + i,
      }))
  })

  const dots = computed<AgeDot[]>(() => {
    const list = issues.value
    if (!list.length) return []

    const oldest = list.reduce((max, issue) => Math.max(max, daysSince(issue.createdAt)), 1)
    const sorted = list
      .map((issue) => {
        const days = daysSince(issue.createdAt)
        return {
          id: issue.id,
          x: days / oldest,
          row: 0,
          level: days / oldest,
          label: `#${issue.number} · ${ageLabel(days)}`,
        }
      })
      .sort((a, b) => a.x - b.x)

    const taken: number[] = []
    for (const dot of sorted) {
      let row = 0
      for (let held = taken[row]; held !== undefined && dot.x - held < DOT_GAP; held = taken[row]) {
        row += 1
      }
      taken[row] = dot.x
      dot.row = row
    }
    return sorted
  })

  const stats = computed<IssueStats>(() => ({
    total: issues.value.length,
    repos: new Set(issues.value.map((i) => i.repo)).size,
    discussed: issues.value.filter((i) => i.comments > 0).length,
    oldest: issues.value.reduce((max, i) => Math.max(max, daysSince(i.createdAt)), 0),
  }))

  return { groups, dots, stats, total, loading, loaded, error, load }
}
