<script lang="ts" setup>
import { computed } from 'vue'
import type { ReleaseAsset } from '@/types/release'
import { fmtSize, plural } from '@/utils/format'

const props = defineProps<{
  assets: readonly ReleaseAsset[]
}>()

const peak = computed(() => Math.max(1, ...props.assets.map((a) => a.downloads)))

const size = (bytes: number): string => fmtSize(Math.round(bytes / 1024))
</script>

<template>
  <div class="assets">
    <p class="cmd">
      $ gh release download – {{ assets.length }}
      {{ plural(assets.length, 'файл', 'файла', 'файлов') }}
    </p>
    <ul class="files">
      <li v-for="asset in assets" :key="asset.name" class="file">
        <span class="name">{{ asset.name }}</span>
        <span class="size">{{ size(asset.size) }}</span>
        <span class="dl" :class="{ zero: !asset.downloads }">
          <i
            class="bar"
            aria-hidden="true"
            :style="{ '--w': `${(asset.downloads / peak) * 100}%` }"
          ></i>
          <b>{{ asset.downloads }}</b>
        </span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.assets {
  padding: var(--spacing-sm) 0 var(--spacing-md) 3ch;
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
}

.cmd {
  margin: 0 0 var(--spacing-sm);
  color: var(--color-text-muted);
}

.files {
  display: grid;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.file {
  display: grid;
  grid-template-columns: 1fr auto 7ch;
  align-items: center;
  gap: var(--spacing-md);
  padding: 2px var(--spacing-sm);
  border-left: 1px solid var(--color-bg-tertiary);
  color: var(--color-text-muted);
}

.name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-text-secondary);
}

.size {
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.dl {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-xs);
  font-variant-numeric: tabular-nums;
}

.dl b {
  font-weight: 400;
  color: var(--color-accent);
}

.dl.zero b {
  color: var(--color-text-muted);
}

.bar {
  width: var(--w);
  max-width: 4ch;
  height: 2px;
  border-radius: var(--radius-full);
  background: var(--repo-color, var(--color-accent));
  opacity: 0.6;
}

@media (max-width: 720px) {
  .assets {
    padding-left: var(--spacing-md);
  }

  .file {
    grid-template-columns: 1fr auto 5ch;
    gap: var(--spacing-sm);
  }
}
</style>
