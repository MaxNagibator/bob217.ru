<script lang="ts" setup>
import { computed, ref } from 'vue'
import CmdLine from '@/components/CmdLine.vue'
import RepoReleases from '@/components/releases/RepoReleases.vue'
import StatStrip from '@/components/stats/StatStrip.vue'
import { useCmdRun } from '@/composables/useCmdRun'
import { useReleases } from '@/composables/useReleases'
import type { StatItem } from '@/types/stat'
import { fmtDate, plural } from '@/utils/format'

const { groups, stats, generatedAt } = useReleases()

const open = ref<string | null>(null)

const toggle = (key: string): void => {
  open.value = open.value === key ? null : key
}

const DAY_MS = 86_400_000

const sinceLatest = computed(() => {
  const at = stats.value.latestAt
  if (!at) return '–'
  const days = Math.max(0, Math.round((Date.now() - new Date(at).getTime()) / DAY_MS))
  return days === 0 ? 'сегодня' : `${days} ${plural(days, 'день', 'дня', 'дней')}`
})

const metrics = computed<StatItem[]>(() => [
  { key: 'releases', value: stats.value.releases, label: 'релизов собрано', accent: true },
  { key: 'repos', value: stats.value.repos, label: 'проектов с релизами' },
  { key: 'downloads', value: stats.value.downloads, label: 'скачиваний' },
  { key: 'latest', text: sinceLatest.value, label: 'с последнего релиза' },
])

const { runKey, running, begin, finish } = useCmdRun()
</script>

<template>
  <div class="releases">
    <div class="releases-container">
      <header class="releases-header">
        <CmdLine @run="begin" @done="finish">gh release list --repo MaxNagibator/*</CmdLine>
        <h1>Релизы</h1>
        <p class="lede">
          собранные версии проектов
          <a href="https://github.com/MaxNagibator" target="_blank" rel="noopener noreferrer"
            >MaxNagibator</a
          >
          – теги, к которым приложены готовые файлы
        </p>
      </header>

      <div class="stage" :class="{ running }">
        <div :key="runKey" class="out">
          <template v-if="groups.length">
            <StatStrip :items="metrics" class="strip" />

            <p class="legend">
              <span class="key"><i class="chip now">latest</i> текущая версия</span>
              <span class="key"><i class="dot" aria-hidden="true"></i> релиз на оси времени</span>
              <span class="key">↓ скачивания файлов релиза</span>
            </p>

            <div class="tree">
              <RepoReleases
                v-for="group in groups"
                :key="group.repo"
                :group="group"
                :open-key="open"
                @toggle="toggle"
              />
            </div>

            <p class="foot">
              <span class="stamp"># снапшот собран {{ fmtDate(generatedAt) }}</span>
            </p>
          </template>

          <div v-else class="fail">
            <p class="fatal"><span class="kw">fatal:</span> релизы не собраны</p>
            <p class="note"># снапшот пуст – запусти npm run releases перед сборкой</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.releases {
  min-height: 100vh;
  padding: var(--spacing-xl);
}

.releases-container {
  width: 100%;
  max-width: 820px;
  margin: 0 auto;
}

.releases-header {
  margin-bottom: var(--spacing-lg);
}

.releases-header h1 {
  margin: 0;
}

.lede {
  max-width: 58ch;
  margin: var(--spacing-sm) auto 0;
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.lede a {
  color: var(--color-link);
  text-decoration: none;
}

.lede a:hover {
  text-decoration: underline;
}

.stage {
  position: relative;
  min-height: 120px;
}

.stage.running .out {
  visibility: hidden;
}

.strip {
  margin-bottom: var(--spacing-lg);
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm) var(--spacing-lg);
  margin: 0 0 var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-bg-tertiary);
}

.key {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.chip {
  padding: 0 var(--spacing-xs);
  font-style: normal;
  color: var(--color-bg-primary);
  background: var(--color-accent);
  border-radius: var(--radius-sm);
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--color-text-muted);
}

.foot {
  margin: var(--spacing-xl) 0 0;
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.fail {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  font-family: var(--font-family-mono);
}

.fatal {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-danger);
}

.fatal .kw {
  font-weight: 700;
}

.note {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

@media (max-width: 720px) {
  .releases {
    padding: var(--spacing-lg);
  }
}
</style>
