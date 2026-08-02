import { computed, type ComputedRef } from 'vue'
import { LANG_COLORS } from '@/utils/lang'
import type { ResumeEntry } from '@/types/resume'
import resumeJson from '@/assets/data/resume.json'

export interface ResumeRef {
  name: string
  color: string | null
}

export interface ResumeRow {
  entry: ResumeEntry
  hash: string
  pointer: string
  refs: ResumeRef[]
}

const FNV_OFFSET = 0x811c9dc5
const FNV_PRIME = 0x01000193

const shortHash = (seed: string): string => {
  let h = FNV_OFFSET
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, FNV_PRIME)
  }
  return (h >>> 0).toString(16).padStart(8, '0').slice(0, 7)
}

export function useResumeLog(): { rows: ComputedRef<ResumeRow[]> } {
  const entries = resumeJson as readonly ResumeEntry[]

  const rows = computed<ResumeRow[]>(() =>
    entries.map((entry, i) => ({
      entry,
      hash: shortHash(`${entry.id}:${entry.title}`),
      pointer: `HEAD@{${i}}`,
      refs: entry.tags.map((name) => ({ name, color: LANG_COLORS[name] ?? null })),
    })),
  )

  return { rows }
}
