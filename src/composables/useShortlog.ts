import { computed, ref } from 'vue'
import { loadMergedPulls, OWNER } from '@/composables/useForkMap'
import { ago } from '@/utils/format'

export interface Author {
  login: string
  url: string
  avatar: string
  merged: number
  repos: string[]
  last: string
  owner: boolean
}

export interface ShortlogRow {
  author: Author
  age: string
}

export interface ShortlogStats {
  authors: number
  merged: number
  repos: number
}

interface Tally {
  merged: number
  repos: Map<string, number>
  last: string
}

const byCountDesc = (a: [string, number], b: [string, number]): number => b[1] - a[1]

export function useShortlog() {
  const authors = ref<Author[]>([])
  const loading = ref(false)
  const loaded = ref(false)
  const error = ref<string | null>(null)

  const load = async (): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      const tally = new Map<string, Tally>()
      for (const { login, repo, at } of await loadMergedPulls()) {
        const t = tally.get(login) ?? { merged: 0, repos: new Map<string, number>(), last: '' }
        t.merged++
        t.repos.set(repo, (t.repos.get(repo) ?? 0) + 1)
        if (at > t.last) t.last = at
        tally.set(login, t)
      }

      authors.value = [...tally.entries()]
        .map(([login, t]) => ({
          login,
          url: `https://github.com/${login}`,
          avatar: `https://github.com/${login}.png?size=96`,
          merged: t.merged,
          repos: [...t.repos.entries()].sort(byCountDesc).map(([name]) => name),
          last: t.last,
          owner: login === OWNER,
        }))
        .sort(
          (a, b) =>
            b.last.localeCompare(a.last) || b.merged - a.merged || a.login.localeCompare(b.login),
        )
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'не удалось загрузить'
    } finally {
      loading.value = false
      loaded.value = true
    }
  }

  const rows = computed<ShortlogRow[]>(() =>
    authors.value.map((author) => ({ author, age: ago(author.last) })),
  )

  const stats = computed<ShortlogStats>(() => ({
    authors: authors.value.length,
    merged: authors.value.reduce((sum, a) => sum + a.merged, 0),
    repos: new Set(authors.value.flatMap((a) => a.repos)).size,
  }))

  return { rows, stats, loading, loaded, error, load }
}
