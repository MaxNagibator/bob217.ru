<script lang="ts" setup>
import type { IssueRow } from '@/composables/useIssues'
import { plural } from '@/utils/format'

defineProps<{
  row: IssueRow
  index: number
}>()
</script>

<template>
  <li
    class="line typed"
    :class="{ stale: row.heat > 0.66 }"
    :style="{ '--i': index, '--heat': row.heat, '--trail': `min(calc(${index} * 40ms), 480ms)` }"
  >
    <span class="code" :class="row.code === '??' ? 'fresh' : 'talk'" aria-hidden="true">{{
      row.code
    }}</span>
    <span class="sr-only">{{ row.code === '??' ? 'не тронута' : 'идёт обсуждение' }}</span>
    <a class="ref" :href="row.issue.url" target="_blank" rel="noopener noreferrer"
      >#{{ row.issue.number }}</a
    >
    <span class="title">{{ row.issue.title }}</span>
    <span class="meta">
      <span class="who">{{ row.issue.author }}</span>
      <span v-if="row.issue.comments" class="talks"
        >{{ row.issue.comments }}
        {{ plural(row.issue.comments, 'ответ', 'ответа', 'ответов') }}</span
      >
      <span class="age">{{ row.age }}</span>
    </span>
  </li>
</template>

<style scoped>
.line {
  position: relative;
  display: grid;
  grid-template-columns: 2ch auto 1fr auto;
  align-items: baseline;
  gap: var(--spacing-sm) var(--spacing-md);
  padding: var(--spacing-sm);
  margin-left: calc(var(--spacing-sm) * -1);
  border-radius: var(--radius-sm);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  transition: background var(--transition-fast);
}

.line:hover {
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--repo-color, var(--color-accent)) 12%, transparent),
    transparent 74%
  );
}

.line::after {
  content: '';
  position: absolute;
  left: var(--spacing-sm);
  bottom: 0;
  width: calc(var(--heat) * (100% - var(--spacing-sm) * 2));
  height: 2px;
  border-radius: var(--radius-full);
  background: color-mix(
    in srgb,
    var(--color-danger) calc(var(--heat) * 100%),
    var(--color-text-muted)
  );
  opacity: 0.5;
}

.line.stale::after {
  opacity: 0.75;
  box-shadow: 0 0 10px rgba(255, 102, 153, 0.4);
}

.code {
  color: var(--color-text-muted);
  letter-spacing: 0.06em;
  white-space: pre;
}

.code.talk {
  color: var(--color-accent);
}

.ref {
  padding: 0 3px;
  margin: 0 -3px;
  color: var(--color-link);
  text-decoration: none;
  font-variant-numeric: tabular-nums;
  transition:
    background var(--transition-fast),
    color var(--transition-fast);
}

.line:hover .ref {
  color: var(--color-bg-primary);
  background: var(--color-link);
}

.ref:hover {
  background: var(--color-accent);
}

.title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
}

.line:hover .title {
  color: var(--color-text-primary);
}

.meta {
  display: flex;
  gap: var(--spacing-sm);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
}

.who {
  max-width: 18ch;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.75;
}

.who::after,
.talks::after {
  content: '·';
  margin-left: var(--spacing-sm);
}

.line.stale .age {
  color: var(--color-danger);
}

@media (max-width: 720px) {
  .line {
    grid-template-columns: 2ch auto 1fr;
  }

  .title {
    white-space: normal;
  }

  .meta {
    grid-column: 2 / -1;
  }

  .who {
    display: none;
  }
}
</style>
