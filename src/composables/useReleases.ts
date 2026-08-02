import { computed } from 'vue'
import snapshot from '@/assets/data/releases.json'
import type { Release, ReleasesSnapshot } from '@/types/release'
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

const data = snapshot as ReleasesSnapshot

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

export function useReleases() {
  const repos = computed(() =>
    [...data.repos]
      .map((repo) => ({
        ...repo,
        releases: [...repo.releases].sort((a, b) => b.at.localeCompare(a.at)),
      }))
      .sort((a, b) => (b.releases[0]?.at ?? '').localeCompare(a.releases[0]?.at ?? '')),
  )

  const totalDownloads = computed(() =>
    sumBy(repos.value, (repo) => sumBy(repo.releases, downloadsOf)),
  )

  const groups = computed<ReleaseGroup[]>(() => {
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

  return { groups, stats, generatedAt: data.generatedAt }
}
