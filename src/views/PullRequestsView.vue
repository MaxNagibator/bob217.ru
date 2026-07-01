<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import {
  MessageSquare,
  Smile,
  Clock,
  GitCommit,
  FileDiff,
  ExternalLink,
  RefreshCw,
  AlertCircle,
} from 'lucide-vue-next'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'
import { usePullRequests } from '@/composables/usePullRequests'

const { pulls, total, stats, loading, error, load } = usePullRequests()

const sortedPulls = computed(() =>
  [...pulls.value].sort((a, b) => Number(a.draft) - Number(b.draft)),
)

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })

const plural = (n: number, one: string, few: string, many: string): string => {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few
  return many
}

const ageLabel = (iso: string): string => {
  const days = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000))
  return days === 0 ? 'сегодня' : `${days} ${plural(days, 'день', 'дня', 'дней')}`
}

type DiffCell = 'add' | 'del' | 'none'

const diffCells = (add: number, del: number): DiffCell[] => {
  const total = add + del
  if (total === 0) return ['none', 'none', 'none', 'none', 'none']
  let green = Math.round((add / total) * 5)
  if (add > 0 && green === 0) green = 1
  if (del > 0 && green === 5) green = 4
  return Array.from({ length: 5 }, (_, i): DiffCell => (i < green ? 'add' : 'del'))
}

onMounted(load)
</script>

<template>
  <div class="pulls">
    <div class="pulls-container">
      <header class="pulls-header">
        <p class="cmd">
          <span class="cmd-prompt">$</span> gh pr list --author
          <a href="https://github.com/MaxNagibator" target="_blank" rel="noopener noreferrer">
            MaxNagibator
          </a>
          --state open
        </p>
        <h1>Открытые Pull Request</h1>
        <div class="head-actions">
          <button class="refresh-button" :disabled="loading" @click="load" aria-label="Обновить">
            <RefreshCw :size="16" :class="{ spin: loading }" />
            <span>Обновить</span>
          </button>
        </div>
      </header>

      <LoadingSkeleton v-if="loading && !pulls.length" :count="4" variant="card" />

      <div v-else-if="error" class="pulls-error">
        <AlertCircle :size="24" />
        <span>{{ error }}</span>
      </div>

      <p v-else-if="!pulls.length" class="pulls-empty">Открытых PR нет – всё уже в master.</p>

      <template v-else>
        <p class="shortstat">
          <span class="n accent">{{ stats.total }}</span>
          PR {{ plural(stats.total, 'открыт', 'открыто', 'открыто') }} ·
          <span class="n ready">{{ stats.ready }}</span>
          {{ plural(stats.ready, 'готов', 'готовы', 'готовы') }} ·
          <span class="n draft">{{ stats.draft }}</span>
          {{ plural(stats.draft, 'черновик', 'черновика', 'черновиков') }} ·
          <span class="n">{{ stats.repos }}</span>
          {{ plural(stats.repos, 'репозиторий', 'репозитория', 'репозиториев') }}
        </p>

        <ul class="log">
          <li
            v-for="(pr, i) in sortedPulls"
            :key="pr.id"
            class="entry"
            :class="pr.draft ? 'is-draft' : 'is-ready'"
            :style="{ '--i': i }"
          >
            <span class="rail" aria-hidden="true">
              <span class="node"></span>
            </span>
            <a :href="pr.url" class="entry-link" target="_blank" rel="noopener noreferrer">
              <span class="pull-title">
                <span class="pull-title-text">{{ pr.title }}</span>
                <span v-if="pr.draft" class="pull-badge">Черновик</span>
              </span>
              <span class="pull-meta">
                <span class="pull-repo">{{ pr.repo }}</span> #{{ pr.number }} ·
                <img :src="pr.avatar" :alt="''" class="pull-avatar" loading="lazy" />
                {{ pr.author }} · {{ formatDate(pr.createdAt) }}
              </span>
              <span class="pull-stats">
                <span class="stat"><Clock :size="13" /> {{ ageLabel(pr.createdAt) }}</span>
                <span v-if="pr.commits !== null" class="stat">
                  <GitCommit :size="13" /> {{ pr.commits }}
                </span>
                <span v-if="pr.changedFiles !== null" class="stat">
                  <FileDiff :size="13" /> {{ pr.changedFiles }}
                </span>
                <span v-if="pr.additions !== null" class="stat diffstat">
                  <span class="add">+{{ pr.additions }}</span>
                  <span class="del">−{{ pr.deletions ?? 0 }}</span>
                  <span class="diffbar" aria-hidden="true">
                    <span
                      v-for="(cell, j) in diffCells(pr.additions, pr.deletions ?? 0)"
                      :key="j"
                      class="diffcell"
                      :class="cell"
                    ></span>
                  </span>
                </span>
                <span v-if="pr.comments" class="stat">
                  <MessageSquare :size="13" /> {{ pr.comments }}
                </span>
                <span v-if="pr.reactions" class="stat">
                  <Smile :size="13" /> {{ pr.reactions }}
                </span>
              </span>
              <ExternalLink class="pull-external" :size="16" />
            </a>
          </li>
          <li class="trunk" aria-hidden="true" :style="{ '--i': sortedPulls.length }">
            <span class="rail">
              <span class="node trunk-node"></span>
            </span>
            <span class="trunk-label">master</span>
          </li>
        </ul>
      </template>

      <p v-if="!loading && total > pulls.length" class="pulls-more">
        Показаны {{ pulls.length }} из {{ total }}.
      </p>
    </div>
  </div>
</template>

<style scoped>
.pulls {
  min-height: 100vh;
  padding: var(--spacing-xl);
}

.pulls-container {
  width: 100%;
  max-width: var(--max-width-content);
  margin: 0 auto;
}

.pulls-header {
  margin-bottom: var(--spacing-xl);
}

.cmd {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  letter-spacing: 0.03em;
  margin: 0 0 var(--spacing-sm) 0;
}

.cmd-prompt {
  color: var(--color-accent);
}

.cmd a {
  color: var(--color-link);
  text-decoration: none;
}

.cmd a:hover {
  text-decoration: underline;
}

.pulls-header h1 {
  margin: 0;
}

.head-actions {
  display: flex;
  justify-content: center;
}

.refresh-button {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  background: transparent;
  border: 1px solid var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.refresh-button:hover:not(:disabled) {
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.refresh-button:disabled {
  cursor: default;
  opacity: 0.7;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.pulls-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  color: var(--color-danger);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
}

.pulls-empty,
.pulls-more {
  text-align: center;
  font-family: var(--font-family-mono);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.shortstat {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0 0 var(--spacing-lg) 0;
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-bg-tertiary);
}

.n {
  font-weight: 700;
  color: var(--color-text-primary);
}

.n.accent {
  color: var(--color-accent);
}

.n.ready {
  color: var(--color-success);
}

.n.draft {
  color: var(--color-text-secondary);
}

.log {
  --node-y: 26px;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}

.entry,
.trunk {
  position: relative;
  display: grid;
  grid-template-columns: 28px 1fr;
  animation: entry-in 0.35s ease backwards;
  animation-delay: min(calc(var(--i) * 45ms), 600ms);
}

@keyframes entry-in {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
}

.rail {
  position: relative;
}

.rail::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  margin-left: -1px;
  background: var(--color-bg-tertiary);
}

.log li:first-child .rail::before {
  top: var(--node-y);
}

.node {
  position: absolute;
  left: 50%;
  top: var(--node-y);
  transform: translate(-50%, -50%);
  width: 11px;
  height: 11px;
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
}

.is-ready .node {
  background: var(--color-success);
}

.is-draft .node {
  background: var(--color-bg-primary);
  border: 2px solid var(--color-text-muted);
}

.entry:hover .node {
  background: var(--color-accent);
  border-color: var(--color-accent);
}

.entry-link {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-md) var(--spacing-sm);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.entry-link:hover {
  background: var(--color-bg-secondary);
}

.pull-title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  padding-right: var(--spacing-xl);
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--color-text-primary);
}

.is-draft .pull-title-text {
  color: var(--color-text-secondary);
}

.pull-badge {
  padding: 0 var(--spacing-sm);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  border: 1px dashed var(--color-text-muted);
  border-radius: var(--radius-full);
}

.pull-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.pull-repo {
  color: var(--color-link);
  font-weight: 600;
}

.pull-avatar {
  width: 16px;
  height: 16px;
  border-radius: var(--radius-full);
}

.pull-stats {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-md);
  margin-top: 2px;
}

.stat {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.diffstat {
  gap: var(--spacing-xs);
  font-weight: 600;
}

.diffstat .add {
  color: var(--color-success);
}

.diffstat .del {
  color: var(--color-danger);
}

.diffbar {
  display: inline-flex;
  gap: 2px;
  margin-left: var(--spacing-xs);
}

.diffcell {
  width: 7px;
  height: 7px;
  border-radius: 1px;
  background: var(--color-bg-tertiary);
}

.diffcell.add {
  background: var(--color-success);
}

.diffcell.del {
  background: var(--color-danger);
}

.pull-external {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  color: var(--color-text-muted);
  transition: color var(--transition-fast);
}

.entry-link:hover .pull-external {
  color: var(--color-accent);
}

.trunk {
  --node-y: 18px;
  min-height: 36px;
}

.trunk .rail::before {
  bottom: calc(100% - var(--node-y));
}

.trunk-node {
  background: var(--color-accent);
  box-shadow: var(--shadow-glow);
}

.trunk-label {
  align-self: center;
  padding-left: var(--spacing-sm);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  letter-spacing: 0.05em;
  color: var(--color-accent);
}

@media (max-width: 768px) {
  .pulls {
    padding: var(--spacing-lg);
  }

  .pull-stats {
    gap: var(--spacing-sm);
  }
}

@media (prefers-reduced-motion: reduce) {
  .entry,
  .trunk {
    animation: none;
  }

  .spin {
    animation: none;
  }
}
</style>
