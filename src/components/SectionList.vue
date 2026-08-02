<script lang="ts" setup>
import { computed } from 'vue'
import CmdLine from '@/components/CmdLine.vue'
import { plural } from '@/utils/format'

interface SiteSection {
  to: string
  dir: string
  desc: string
}

const props = defineProps<{
  repoCount: number
}>()

const SECTIONS: SiteSection[] = [
  { to: '/log', dir: 'log/', desc: 'лента коммитов по всем репозиториям' },
  { to: '/issues', dir: 'issues/', desc: 'что ждёт работы' },
  { to: '/pulls', dir: 'pulls/', desc: 'что сейчас на ревью' },
  { to: '/repos', dir: 'repos/', desc: 'карта репозиториев' },
  { to: '/resume', dir: 'resume/', desc: 'опыт и стек как вывод git reflog' },
  { to: '/about', dir: 'about/', desc: 'кто пишет код – git shortlog' },
  { to: '/donate', dir: 'donate/', desc: 'поддержать проекты' },
  { to: '/tarkov', dir: 'tarkov/', desc: 'игровое время и таймеры крафтов' },
]

const noteOf = (to: string): string =>
  to === '/repos' && props.repoCount
    ? `${props.repoCount} ${plural(props.repoCount, 'проект', 'проекта', 'проектов')}`
    : ''

const rows = computed(() => SECTIONS.map((section) => ({ ...section, note: noteOf(section.to) })))
</script>

<template>
  <section class="sections">
    <CmdLine>ls ~/site</CmdLine>
    <h2 class="md-head"><span class="hash">##</span> Разделы</h2>

    <ul class="list">
      <li v-for="(row, i) in rows" :key="row.to">
        <RouterLink class="row" :to="row.to" :style="{ '--i': i }">
          <span class="dir">{{ row.dir }}</span>
          <span class="desc">{{ row.desc }}</span>
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
  grid-template-columns: 9ch 1fr auto;
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
    grid-template-columns: 9ch 1fr;
  }

  .note {
    grid-column: 2 / -1;
  }
}
</style>
