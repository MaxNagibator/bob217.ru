<script lang="ts" setup>
import { computed } from 'vue'
import AssetList from '@/components/releases/AssetList.vue'
import type { ReleaseRow } from '@/composables/useReleases'
import { fmtSize, plural } from '@/utils/format'

const props = defineProps<{
  row: ReleaseRow
  repo: string
  index: number
  open: boolean
}>()

defineEmits<{
  toggle: []
}>()

const panelId = computed(() =>
  `assets-${props.repo}-${props.row.release.tag}`.replace(/[^\w-]/g, '-'),
)

const weight = computed(() => fmtSize(Math.round(props.row.bytes / 1024)))
</script>

<template>
  <li
    class="rel typed"
    :class="{ open, latest: row.latest }"
    :style="{ '--i': index, '--trail': `min(calc(${index} * 40ms), 480ms)` }"
  >
    <div class="head">
      <button
        class="toggle"
        type="button"
        :aria-expanded="open"
        :aria-controls="open ? panelId : undefined"
        :disabled="!row.release.assets.length"
        @click="$emit('toggle')"
      >
        <i class="fold" aria-hidden="true"></i>
        <span class="tag">{{ row.release.tag }}</span>
        <span class="title">{{ row.label }}</span>
        <span class="flags">
          <i v-if="row.latest" class="flag now">latest</i>
          <i v-if="row.release.pre" class="flag pre">pre</i>
        </span>
        <span class="meta">
          <span v-if="row.release.assets.length" class="files">
            {{ row.release.assets.length }}
            {{ plural(row.release.assets.length, 'файл', 'файла', 'файлов') }}
          </span>
          <span v-if="row.downloads" class="dl">↓{{ row.downloads }}</span>
          <span class="date">{{ row.date }}</span>
        </span>
      </button>
      <a
        class="ext"
        :href="row.release.url"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="`Открыть релиз ${row.release.tag} на GitHub`"
        >↗</a
      >
    </div>
    <div v-if="open" :id="panelId" class="panel">
      <p class="stamp">{{ row.release.author }} · {{ weight }} в сборке</p>
      <AssetList :assets="row.release.assets" />
    </div>
  </li>
</template>

<style scoped>
.rel {
  border-radius: var(--radius-sm);
}

.head {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}

.head:hover {
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--repo-color, var(--color-accent)) 12%, transparent),
    transparent 74%
  );
}

.toggle {
  display: grid;
  grid-template-columns: 2ch auto minmax(0, 1fr) auto auto;
  align-items: baseline;
  gap: var(--spacing-sm) var(--spacing-md);
  flex: 1;
  min-width: 0;
  padding: var(--spacing-sm);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  text-align: left;
  color: inherit;
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.toggle:disabled {
  cursor: default;
}

.toggle:focus-visible {
  outline: 1px solid var(--color-accent);
  outline-offset: -1px;
}

.fold {
  align-self: center;
  justify-self: start;
  width: 0;
  height: 0;
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  border-left: 6px solid var(--color-text-muted);
  transition: transform var(--transition-fast);
}

.rel.open .fold {
  border-left-color: var(--color-accent);
  transform: rotate(90deg);
}

.toggle:disabled .fold {
  opacity: 0.25;
}

.tag {
  color: var(--color-link);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.rel.latest .tag {
  color: var(--color-accent);
  font-weight: 500;
}

.title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-text-secondary);
}

.head:hover .title {
  color: var(--color-text-primary);
}

.flags {
  display: flex;
  gap: var(--spacing-xs);
}

.flag {
  padding: 0 var(--spacing-xs);
  font-size: var(--font-size-xs);
  font-style: normal;
  border-radius: var(--radius-sm);
}

.flag.now {
  color: var(--color-bg-primary);
  background: var(--color-accent);
}

.flag.pre {
  color: var(--color-danger);
  border: 1px solid currentcolor;
}

.meta {
  display: flex;
  gap: var(--spacing-sm);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
}

.dl {
  color: var(--color-accent);
  opacity: 0.85;
  font-variant-numeric: tabular-nums;
}

.ext {
  padding: 0 var(--spacing-sm);
  color: var(--color-text-muted);
  text-decoration: none;
  font-family: var(--font-family-mono);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.head:hover .ext,
.ext:focus-visible {
  opacity: 1;
  color: var(--color-link);
}

.stamp {
  margin: 0;
  padding-left: 3ch;
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

@media (max-width: 720px) {
  .toggle {
    grid-template-columns: 2ch auto minmax(0, 1fr);
    min-height: 44px;
  }

  .flags {
    grid-column: 2 / -1;
  }

  .meta {
    grid-column: 2 / -1;
    flex-wrap: wrap;
  }

  .ext {
    display: flex;
    align-items: center;
    min-height: 44px;
    opacity: 1;
  }

  .stamp {
    padding-left: var(--spacing-md);
  }
}
</style>
