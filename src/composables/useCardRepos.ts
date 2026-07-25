import { computed, onMounted, shallowRef, type ComputedRef, type ShallowRef } from 'vue'
import { loadRepos, OWNER, type Repo } from '@/composables/useForkMap'
import type { Card } from '@/types/card'

const OWNER_LOWER = OWNER.toLowerCase()
const PAGES_HOST = `${OWNER_LOWER}.github.io`

export const repoKey = (link: string): string | null => {
  let url: URL
  try {
    url = new URL(link)
  } catch {
    return null
  }

  const host = url.hostname.replace(/^www\./, '').toLowerCase()
  const parts = url.pathname.split('/').filter(Boolean)

  if (host === 'github.com') {
    const [owner, name] = parts
    if (!owner || !name || owner.toLowerCase() !== OWNER_LOWER) return null
    return name.replace(/\.git$/i, '').toLowerCase()
  }

  if (host === PAGES_HOST) {
    const [name] = parts
    return name ? name.toLowerCase() : null
  }

  return null
}

export const cardKey = (card: Card): string | null =>
  card.repo ? card.repo.toLowerCase() : repoKey(card.link)

export type RepoIndex = ReadonlyMap<string, Repo>

export function useCardRepos(): {
  repos: ShallowRef<RepoIndex>
  freshest: ComputedRef<Repo | null>
} {
  const repos = shallowRef<RepoIndex>(new Map())

  onMounted(() => {
    loadRepos()
      .then((list) => {
        repos.value = new Map(list.map((r) => [r.name.toLowerCase(), r]))
      })
      .catch(() => undefined)
  })

  const freshest = computed<Repo | null>(() => {
    let best: Repo | null = null
    for (const repo of repos.value.values()) {
      if (!best || repo.pushed > best.pushed) best = repo
    }
    return best
  })

  return { repos, freshest }
}
