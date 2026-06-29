<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import {
  GitPullRequest,
  GitPullRequestDraft,
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
      <div class="pulls-header">
        <GitPullRequest class="pulls-icon" :size="56" :stroke-width="1.5" />
        <h2>Открытые Pull Request</h2>
        <p class="pulls-subtitle">
          Все открытые PR в репозиториях
          <a href="https://github.com/MaxNagibator" target="_blank" rel="noopener noreferrer">
            MaxNagibator
          </a>
        </p>
        <button class="refresh-button" :disabled="loading" @click="load" aria-label="Обновить">
          <RefreshCw :size="16" :class="{ spin: loading }" />
          <span>Обновить</span>
        </button>
      </div>

      <LoadingSkeleton v-if="loading && !pulls.length" :count="4" variant="card" />

      <div v-else-if="error" class="pulls-error">
        <AlertCircle :size="24" />
        <span>{{ error }}</span>
      </div>

      <p v-else-if="!pulls.length" class="pulls-empty">Открытых PR нет.</p>

      <template v-else>
        <div class="stats-bar">
          <div class="seg">
            <span class="seg-num total">{{ stats.total }}</span>
            <span class="seg-label">PR</span>
          </div>
          <div class="seg">
            <span class="seg-num ready">{{ stats.ready }}</span>
            <span class="seg-label">готовы</span>
          </div>
          <div class="seg">
            <span class="seg-num draft">{{ stats.draft }}</span>
            <span class="seg-label">черновики</span>
          </div>
          <div class="seg">
            <span class="seg-num">{{ stats.repos }}</span>
            <span class="seg-label">репо</span>
          </div>
        </div>

        <ul class="pulls-list">
          <li
            v-for="pr in sortedPulls"
            :key="pr.id"
            class="pull"
            :class="pr.draft ? 'is-draft' : 'is-ready'"
          >
            <a :href="pr.url" class="pull-link" target="_blank" rel="noopener noreferrer">
              <img :src="pr.avatar" :alt="pr.author" class="pull-avatar" loading="lazy" />
              <div class="pull-body">
                <span class="pull-title">
                  <component
                    :is="pr.draft ? GitPullRequestDraft : GitPullRequest"
                    class="pull-state-icon"
                    :size="16"
                  />
                  <span class="pull-title-text">{{ pr.title }}</span>
                  <span v-if="pr.draft" class="pull-badge">Черновик</span>
                </span>
                <span class="pull-meta">
                  {{ pr.repo }} #{{ pr.number }} · {{ pr.author }} · {{ formatDate(pr.createdAt) }}
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
                        v-for="(cell, i) in diffCells(pr.additions, pr.deletions ?? 0)"
                        :key="i"
                        class="diffcell"
                        :class="cell"
                      ></span>
                    </span>
                  </span>
                  <span v-if="pr.comments" class="stat">
                    <MessageSquare :size="13" /> {{ pr.comments }}
                  </span>
                  <span v-if="pr.reactions" class="stat"><Smile :size="13" /> {{ pr.reactions }}</span>
                </span>
              </div>
              <ExternalLink class="pull-external" :size="18" />
            </a>
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
  padding-top: calc(var(--nav-height) + var(--spacing-xl));
}

.pulls-container {
  width: 100%;
  max-width: var(--max-width-content);
  margin: 0 auto;
}

.pulls-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.pulls-icon {
  display: block;
  margin: 0 auto var(--spacing-md);
  color: var(--color-accent);
}

.pulls-header h2 {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-2xl);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.pulls-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin: 0 0 var(--spacing-md) 0;
}

.pulls-subtitle a {
  color: var(--color-link);
  text-decoration: none;
}

.pulls-subtitle a:hover {
  text-decoration: underline;
}

.refresh-button {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-bg-elevated);
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
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.stats-bar {
  display: flex;
  margin-bottom: var(--spacing-lg);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.seg {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-md) var(--spacing-sm);
  border-left: 1px solid var(--color-bg-tertiary);
}

.seg:first-child {
  border-left: none;
}

.seg-num {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-2xl);
  font-weight: 700;
  line-height: 1;
  color: var(--color-text-primary);
}

.seg-num.total {
  color: var(--color-accent);
}

.seg-num.ready {
  color: var(--color-success);
}

.seg-num.draft {
  color: var(--color-text-muted);
}

.seg-label {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.pulls-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin: 0;
  padding: 0;
  list-style: none;
}

.pull-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  text-decoration: none;
  background: var(--color-bg-secondary);
  border: 1px solid transparent;
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
}

.pull-link:hover {
  border-color: var(--color-accent);
  transform: translateY(-2px);
}

.pull-avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
}

.pull-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  min-width: 0;
}

.pull-title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--color-text-primary);
}

.pull-state-icon {
  flex-shrink: 0;
}

.is-ready .pull-state-icon {
  color: var(--color-success);
}

.is-draft .pull-state-icon {
  color: var(--color-text-muted);
}

.pull-badge {
  padding: 0 var(--spacing-sm);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  border: 1px dashed var(--color-text-muted);
  border-radius: var(--radius-full);
}

.is-draft .pull-link {
  background: repeating-linear-gradient(
    45deg,
    var(--color-bg-secondary),
    var(--color-bg-secondary) 7px,
    var(--color-bg-elevated) 7px,
    var(--color-bg-elevated) 14px
  );
}

.pull-meta {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  flex-shrink: 0;
  color: var(--color-text-muted);
}

.pull-link:hover .pull-external {
  color: var(--color-accent);
}

@media (max-width: 768px) {
  .pulls {
    padding: var(--spacing-lg);
    padding-top: calc(var(--nav-height) + var(--spacing-lg));
  }
}
</style>
