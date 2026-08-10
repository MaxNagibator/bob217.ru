import { computed, ref } from 'vue'
import { loadRepos, OWNER } from '@/composables/useForkMap'
import type { Release, ReleaseRepo } from '@/types/release'
import { readCache, writeCache } from '@/utils/cache'
import { fetchGitHub } from '@/utils/github'
import { fmtDate } from '@/utils/format'
import { langColor } from '@/utils/lang'

export interface ReleaseRow {
  release: Release
  label: string
  latest: boolean
  date: string
  downloads: number
  bytes: number
}

export interface TrackDot {
  tag: string
  x: number
  latest: boolean
}

export interface ReleaseGroup {
  repo: string
  url: string
  color: string
  lang: string
  total: number
  downloads: number
  share: number
  rows: readonly ReleaseRow[]
  track: readonly TrackDot[]
}

export interface ReleaseStats {
  releases: number
  repos: number
  downloads: number
  latestAt: string
}

// TODO: набор репозиториев ведётся руками – анонимный REST не отвечает, где есть релизы,
// а обход всех репозиториев съедает часовой лимит; снять, когда запросы пойдут через прокси с токеном
const RELEASE_REPOS: readonly string[] = [
  'SpaceSnoop',
  'PoproshaykaBot',
  'MediaOrcestrator',
  'MacrosApp',
  'TwitchApi',
]

const CACHE_KEY = 'releases'
const CACHE_TTL = 15 * 60 * 1000

const releasesUrl = (repo: string): string =>
  `https://api.github.com/repos/${OWNER}/${repo}/releases?per_page=100`

interface AssetResponse {
  name: string
  size: number
  download_count: number
}

interface ReleaseResponse {
  tag_name: string
  name: string | null
  html_url: string
  published_at: string | null
  prerelease: boolean
  draft: boolean
  author: { login: string } | null
  assets: AssetResponse[]
}

interface RepoMeta {
  lang: string
  url: string
}

interface Cache {
  at: string
  repos: ReleaseRepo[]
}

const sumBy = <T>(list: readonly T[], pick: (item: T) => number): number =>
  list.reduce((sum, item) => sum + pick(item), 0)

const downloadsOf = (release: Release): number => sumBy(release.assets, (a) => a.downloads)

const bytesOf = (release: Release): number => sumBy(release.assets, (a) => a.size)

const timeOf = (iso: string): number => new Date(iso).getTime()

const labelOf = (release: Release, repo: string): string => {
  const trimmed = release.title.replace(repo, '').trim()
  if (!trimmed) return ''
  const echoesTag = release.tag.startsWith(trimmed) || trimmed.startsWith(release.tag)
  return echoesTag ? '' : trimmed
}

const toRelease = (node: ReleaseResponse): Release => ({
  tag: node.tag_name,
  title: node.name || node.tag_name,
  url: node.html_url,
  at: node.published_at ?? '',
  pre: node.prerelease,
  author: node.author?.login ?? OWNER,
  assets: node.assets.map((asset) => ({
    name: asset.name,
    size: asset.size,
    downloads: asset.download_count,
  })),
})

const loadMeta = async (): Promise<ReadonlyMap<string, RepoMeta>> => {
  const list = await loadRepos().catch(() => null)
  if (!list) return new Map<string, RepoMeta>()
  return new Map(list.map((repo) => [repo.name.toLowerCase(), { lang: repo.lang, url: repo.url }]))
}

const loadRepo = async (
  name: string,
  meta: ReadonlyMap<string, RepoMeta>,
): Promise<ReleaseRepo | null> => {
  const list = await fetchGitHub<ReleaseResponse[]>(releasesUrl(name))
  const releases = list
    .filter((node) => !node.draft && node.published_at)
    .map(toRelease)
    .sort((a, b) => b.at.localeCompare(a.at))
  if (!releases.length) return null

  const info = meta.get(name.toLowerCase())
  return {
    name,
    url: info?.url ?? `https://github.com/${OWNER}/${name}`,
    lang: info?.lang ?? '',
    total: releases.length,
    releases,
  }
}

export function useReleases() {
  const repos = ref<ReleaseRepo[]>([])
  const fetchedAt = ref('')
  const loading = ref(false)
  const loaded = ref(false)
  const error = ref<string | null>(null)

  const load = async (force = false): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      const cached = force ? null : readCache<Cache>(CACHE_KEY, CACHE_TTL)
      if (cached?.repos) {
        repos.value = cached.repos
        fetchedAt.value = cached.at
        return
      }

      const meta = await loadMeta()
      const settled = await Promise.allSettled(RELEASE_REPOS.map((name) => loadRepo(name, meta)))
      const list = settled.flatMap((res) =>
        res.status === 'fulfilled' && res.value ? [res.value] : [],
      )
      const reasons: unknown[] = settled.flatMap((res) =>
        res.status === 'rejected' ? [res.reason] : [],
      )

      if (!list.length) {
        const first = reasons[0]
        throw first instanceof Error ? first : new Error('релизы не загрузились')
      }

      list.sort((a, b) => (b.releases[0]?.at ?? '').localeCompare(a.releases[0]?.at ?? ''))
      repos.value = list
      fetchedAt.value = new Date().toISOString()
      writeCache<Cache>(CACHE_KEY, { at: fetchedAt.value, repos: list })

      if (reasons.length) error.value = `часть проектов не загрузилась (${reasons.length})`
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'не удалось загрузить'
    } finally {
      loading.value = false
      loaded.value = true
    }
  }

  const totalDownloads = computed(() =>
    sumBy(repos.value, (repo) => sumBy(repo.releases, downloadsOf)),
  )

  const groups = computed<ReleaseGroup[]>(() => {
    if (!repos.value.length) return []

    const all = repos.value.flatMap((repo) => repo.releases.map((r) => timeOf(r.at)))
    const first = Math.min(...all)
    const span = Math.max(1, Math.max(...all) - first)
    const grand = Math.max(1, totalDownloads.value)

    return repos.value.map((repo) => {
      const downloads = sumBy(repo.releases, downloadsOf)
      return {
        repo: repo.name,
        url: repo.url,
        color: langColor(repo.lang || 'прочее'),
        lang: repo.lang,
        total: repo.total,
        downloads,
        share: downloads / grand,
        rows: repo.releases.map((release, i) => ({
          release,
          label: labelOf(release, repo.name),
          latest: i === 0,
          date: fmtDate(release.at),
          downloads: downloadsOf(release),
          bytes: bytesOf(release),
        })),
        track: repo.releases.map((release, i) => ({
          tag: release.tag,
          x: (timeOf(release.at) - first) / span,
          latest: i === 0,
        })),
      }
    })
  })

  const stats = computed<ReleaseStats>(() => ({
    releases: sumBy(repos.value, (repo) => repo.releases.length),
    repos: repos.value.length,
    downloads: totalDownloads.value,
    latestAt: repos.value[0]?.releases[0]?.at ?? '',
  }))

  return { groups, stats, fetchedAt, loading, loaded, error, load }
}
