<script lang="ts" setup>
import type { LaneCell } from '@/composables/useCommitLog'

defineProps<{
  lanes: LaneCell[]
  head?: boolean
}>()
</script>

<template>
  <span class="lanes" aria-hidden="true">
    <i
      v-for="(cell, i) in lanes"
      :key="i"
      class="lane"
      :class="{ up: cell.up, down: cell.down }"
      :style="{ '--lane-color': cell.color }"
    >
      <b v-if="cell.node" class="dot" :class="{ head }"></b>
    </i>
  </span>
</template>

<style scoped>
.lanes {
  display: flex;
  align-self: stretch;
  min-width: var(--rail-w);
}

.lane {
  position: relative;
  width: var(--lane-w);
}

.lane.up::before,
.lane.down::after {
  content: '';
  position: absolute;
  left: 50%;
  width: 2px;
  background: var(--lane-color);
  opacity: 0.45;
  transform: translateX(-50%);
  transform-origin: top;
  animation: lane-draw 0.45s cubic-bezier(0.16, 1, 0.3, 1) backwards;
  animation-delay: var(--trail, 0ms);
}

.lane.up::before {
  top: 0;
  height: var(--node-y);
}

.lane.down::after {
  top: var(--node-y);
  bottom: 0;
}

.dot {
  position: absolute;
  left: 50%;
  top: var(--node-y);
  width: 9px;
  height: 9px;
  margin: -5px 0 0 -5px;
  border-radius: 50%;
  background: var(--lane-color);
  box-shadow: 0 0 0 3px var(--color-bg-primary);
  animation: lane-pop 0.36s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
  animation-delay: var(--trail, 0ms);
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast);
}

.dot.head::after {
  content: '';
  position: absolute;
  inset: -4px;
  border: 1px solid var(--color-accent);
  border-radius: 50%;
  opacity: 0.7;
}

@keyframes lane-draw {
  from {
    transform: translateX(-50%) scaleY(0);
  }
}

@keyframes lane-pop {
  from {
    transform: scale(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .dot,
  .lane.up::before,
  .lane.down::after {
    animation: none;
  }
}
</style>
