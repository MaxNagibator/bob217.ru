import { computed, ref, shallowRef } from 'vue'
import { langColor, loadRepos, OWNER } from '@/composables/useForkMap'
import { readCache, writeCache } from '@/utils/cache'
import { fmtDate } from '@/utils/format'

export interface Commit {
  sha: string
  short: string
  url: string
  repo: string
  repoUrl: string
  author: string
  authorUrl: string
  title: string
  date: string
}

export interface LaneCell {
  node: boolean
  up: boolean
  down: boolean
  color: string
}

export interface DayRow {
  kind: 'day'
  key: string
  label: string
  count: number
  lanes: LaneCell[]
}

export interface CommitRow {
  kind: 'commit'
  key: string
  commit: Commit
  color: string
  time: string
  lanes: LaneCell[]
}

export type LogRow = DayRow | CommitRow

export interface SparkBar {
  key: string
  label: string
  count: number
  level: number
}

export interface LogStats {
  commits: number
  repos: number
  authors: number
  days: number
}

interface SearchItem {
  sha: string
  html_url: string
  commit: { message: string; author: { name: string; date: string } }
  author: { login: string; html_url: string } | null
  repository: { name: string; html_url: string }
}

interface SearchResponse {
  total_count: number
  items: SearchItem[]
}

interface Span {
  repo: string
  first: number
  last: number
  lane: number
}

const HEADERS = { Accept: 'application/vnd.github+json' }
const PER_PAGE = 100
const MAX_PAGES = 5

const CACHE_KEY = 'commit-log'
const CACHE_TTL = 30 * 60 * 1000

const PENDING_COLOR = 'var(--color-text-muted)'

const pageUrl = (page: number): string =>
  `https://api.github.com/search/commits?q=user:${OWNER}+merge:false&sort=author-date&order=desc&per_page=${PER_PAGE}&page=${page}`

interface Cache {
  total: number
  pages: Record<number, Commit[]>
}

const readLog = (): Cache => {
  const hit = readCache<Cache>(CACHE_KEY, CACHE_TTL)
  return hit?.pages ? hit : { total: 0, pages: {} }
}

const toCommit = (it: SearchItem): Commit => ({
  sha: it.sha,
  short: it.sha.slice(0, 7),
  url: it.html_url,
  repo: it.repository.name,
  repoUrl: it.repository.html_url,
  author: it.author?.login ?? it.commit.author.name,
  authorUrl: it.author?.html_url ?? '',
  title: it.commit.message.split('\n', 1)[0] ?? '',
  date: it.commit.author.date,
})

const dayKey = (iso: string): string => new Date(iso).toLocaleDateString('ru-RU')

const timeOf = (iso: string): string =>
  new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

const spansOf = (commits: Commit[]): Span[] => {
  const bounds = new Map<string, Span>()
  commits.forEach((c, i) => {
    const span = bounds.get(c.repo)
    if (span) span.last = i
    else bounds.set(c.repo, { repo: c.repo, first: i, last: i, lane: -1 })
  })

  const spans = [...bounds.values()].sort((a, b) => a.first - b.first)
  const busy: Span[] = []
  for (const span of spans) {
    const free = busy.findIndex((held) => held.last < span.first)
    if (free === -1) {
      span.lane = busy.length
      busy.push(span)
    } else {
      span.lane = free
      busy[free] = span
    }
  }
  return spans
}

export function useCommitLog() {
  const commits = ref<Commit[]>([])
  const langs = shallowRef<ReadonlyMap<string, string>>(new Map())
  const total = ref(0)
  const page = ref(0)
  const loading = ref(false)
  const loaded = ref(false)
  const error = ref<string | null>(null)

  const loadLangs = async (): Promise<void> => {
    const list = await loadRepos().catch(() => null)
    if (list) langs.value = new Map(list.map((r) => [r.name.toLowerCase(), r.lang]))
  }

  const loadPage = async (next: number): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      const cache = readLog()
      const hit = cache.pages[next]
      if (hit && cache.total) {
        total.value = cache.total
        commits.value = next === 1 ? hit : [...commits.value, ...hit]
      } else {
        const res = await fetch(pageUrl(next), { headers: HEADERS })
        if (!res.ok)
          throw new Error(res.status === 403 ? 'лимит GitHub исчерпан' : `GitHub ${res.status}`)
        const data = (await res.json()) as SearchResponse
        total.value = data.total_count
        const fresh = data.items.map(toCommit)
        commits.value = next === 1 ? fresh : [...commits.value, ...fresh]
        cache.total = data.total_count
        cache.pages[next] = fresh
        writeCache(CACHE_KEY, cache)
      }
      page.value = next
      if (!langs.value.size) void loadLangs()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'не удалось загрузить'
    } finally {
      loading.value = false
      loaded.value = true
    }
  }

  const load = (): Promise<void> => loadPage(1)

  const more = (): Promise<void> => loadPage(page.value + 1)

  const hasMore = computed(
    () => page.value > 0 && page.value < MAX_PAGES && commits.value.length < total.value,
  )

  const colorOf = (repo: string): string => {
    const lang = langs.value.get(repo.toLowerCase())
    return lang ? langColor(lang) : PENDING_COLOR
  }

  const spans = computed<Span[]>(() => spansOf(commits.value))

  const laneCount = computed<number>(() =>
    spans.value.reduce((max, s) => Math.max(max, s.lane + 1), 0),
  )

  const rows = computed<LogRow[]>(() => {
    const list = commits.value
    if (!list.length) return []

    const cellsAt = (index: number, node: string | null): LaneCell[] => {
      const cells: LaneCell[] = Array.from({ length: laneCount.value }, () => ({
        node: false,
        up: false,
        down: false,
        color: '',
      }))
      for (const span of spans.value) {
        if (index > span.last) continue
        if (node === null ? index <= span.first : index < span.first) continue
        cells[span.lane] = {
          node: span.repo === node,
          up: index > span.first,
          down: node === null ? index <= span.last : index < span.last,
          color: colorOf(span.repo),
        }
      }
      return cells
    }

    const perDay = new Map<string, number>()
    for (const c of list) perDay.set(dayKey(c.date), (perDay.get(dayKey(c.date)) ?? 0) + 1)

    const out: LogRow[] = []
    let day = ''
    list.forEach((commit, i) => {
      const key = dayKey(commit.date)
      if (key !== day) {
        day = key
        out.push({
          kind: 'day',
          key: `day-${key}-${i}`,
          label: fmtDate(commit.date),
          count: perDay.get(key) ?? 0,
          lanes: cellsAt(i, null),
        })
      }
      out.push({
        kind: 'commit',
        key: commit.sha,
        commit,
        color: colorOf(commit.repo),
        time: timeOf(commit.date),
        lanes: cellsAt(i, commit.repo),
      })
    })
    return out
  })

  const spark = computed<SparkBar[]>(() => {
    const byDay = new Map<string, { date: string; count: number }>()
    for (const commit of commits.value) {
      const key = dayKey(commit.date)
      const bucket = byDay.get(key)
      if (bucket) bucket.count += 1
      else byDay.set(key, { date: commit.date, count: 1 })
    }

    const days = [...byDay.entries()].sort((a, b) => a[1].date.localeCompare(b[1].date))
    const peak = days.reduce((max, [, day]) => Math.max(max, day.count), 1)
    return days.map(([key, day]) => ({
      key,
      label: fmtDate(day.date),
      count: day.count,
      level: day.count / peak,
    }))
  })

  const stats = computed<LogStats>(() => ({
    commits: commits.value.length,
    repos: new Set(commits.value.map((c) => c.repo)).size,
    authors: new Set(commits.value.map((c) => c.author)).size,
    days: new Set(commits.value.map((c) => dayKey(c.date))).size,
  }))

  return { rows, laneCount, spark, stats, total, loading, loaded, error, hasMore, load, more }
}
