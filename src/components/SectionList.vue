<script lang="ts" setup>
import { computed } from 'vue'
import CmdLine from '@/components/CmdLine.vue'
import { SECTION_PAGES } from '@/site/pages'
import { plural } from '@/utils/format'

const props = defineProps<{
  repoCount: number
}>()

const noteOf = (path: string): string =>
  path === '/repos' && props.repoCount
    ? `${props.repoCount} ${plural(props.repoCount, 'проект', 'проекта', 'проектов')}`
    : ''

const rows = computed(() =>
  SECTION_PAGES.map((section) => ({ ...section, note: noteOf(section.path) })),
)
</script>

<template>
  <section class="sections">
    <CmdLine>ls ~/site</CmdLine>
    <h2 class="md-head"><span class="hash">##</span> Разделы</h2>

    <ul class="list">
      <li v-for="(row, i) in rows" :key="row.path">
        <RouterLink class="row" :to="row.path" :style="{ '--i': i }">
          <span class="dir">{{ row.dir }}</span>
          <span class="desc">{{ row.summary }}</span>
          <span v-if="row.note" class="note">{{ row.note }}</span>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.sections {
  margin-bottom: var(--spacing-2xl);
}

.md-head {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-sm);
  margin: 0 0 var(--spacing-md) 0;
}

.md-head .hash {
  font-family: var(--font-family-mono);
  font-size: 0.8em;
  color: var(--color-accent);
}

.list {
  max-width: 62ch;
  margin: 0;
  padding: 0;
  list-style: none;
}

.row {
  display: grid;
  grid-template-columns: 10ch 1fr auto;
  align-items: baseline;
  gap: var(--spacing-sm) var(--spacing-md);
  padding: var(--spacing-sm);
  margin-left: calc(var(--spacing-sm) * -1);
  border-radius: var(--radius-sm);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  text-decoration: none;
  transition: background var(--transition-fast);
}

.row:hover,
.row:focus-visible {
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--color-link) 12%, transparent),
    transparent 74%
  );
}

.dir {
  color: var(--color-link);
}

.row:hover .dir,
.row:focus-visible .dir {
  color: var(--color-link-hover);
}

.desc {
  min-width: 0;
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
}

.row:hover .desc,
.row:focus-visible .desc {
  color: var(--color-text-primary);
}

.note {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
}

@media (max-width: 720px) {
  .row {
    grid-template-columns: 10ch 1fr;
  }

  .note {
    grid-column: 2 / -1;
  }
}
</style>
