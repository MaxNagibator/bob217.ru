<script lang="ts" setup>
import StatCell from '@/components/stats/StatCell.vue'
import type { StatItem } from '@/types/stat'

defineProps<{
  items: StatItem[]
}>()
</script>

<template>
  <div class="strip">
    <StatCell v-for="(item, i) in items" :key="item.key" :item="item" :index="i" />
  </div>
</template>

<style scoped>
.strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  overflow: hidden;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-bg-tertiary);
  border-radius: var(--radius-md);
}

@media (max-width: 720px) {
  .strip {
    grid-template-columns: repeat(2, 1fr);
  }

  .strip > :nth-child(odd) {
    border-left: none;
  }

  .strip > :nth-child(n + 3) {
    border-top: 1px solid var(--color-bg-tertiary);
  }
}
</style>
