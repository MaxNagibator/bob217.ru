<script lang="ts" setup>
import { computed } from 'vue'
import type { StatItem } from '@/types/stat'

const props = defineProps<{
  item: StatItem
  index: number
}>()

const display = computed(() => props.item.text ?? String(props.item.value ?? 0))
</script>

<template>
  <div
    class="cell"
    :class="{ accent: item.accent }"
    :style="{ '--trail': `${140 + index * 260}ms` }"
  >
    <span class="value typed">{{ display }}</span>
    <span class="label typed">{{ item.label }}</span>
  </div>
</template>

<style scoped>
.cell {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--spacing-md) var(--spacing-lg);
  font-family: var(--font-family-mono);
}

.cell + .cell {
  border-left: 1px solid var(--color-bg-tertiary);
}

.cell.accent::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 2px;
  height: 100%;
  background: var(--color-accent);
  transform-origin: top;
  animation: mark-in 0.3s steps(6, end) backwards;
  animation-delay: var(--trail);
}

.value {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  line-height: var(--line-height-tight);
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}

.cell.accent .value {
  color: var(--color-accent);
  text-shadow: 0 0 18px rgba(255, 204, 0, 0.28);
}

.label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  letter-spacing: 0.08em;
  animation-delay: calc(var(--trail) + 180ms);
}

@keyframes mark-in {
  from {
    transform: scaleY(0);
  }
}

@media (max-width: 720px) {
  .cell {
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .value {
    font-size: var(--font-size-xl);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cell.accent::before {
    animation: none;
  }
}
</style>
