<script lang="ts" setup>
import type { TrackDot } from '@/composables/useReleases'

defineProps<{
  dots: readonly TrackDot[]
  label: string
}>()
</script>

<template>
  <div class="track" role="img" :aria-label="label">
    <i class="rail" aria-hidden="true"></i>
    <i
      v-for="dot in dots"
      :key="dot.tag"
      class="tick"
      :class="{ now: dot.latest }"
      aria-hidden="true"
      :style="{ '--x': `${dot.x * 100}%` }"
    ></i>
  </div>
</template>

<style scoped>
.track {
  position: relative;
  height: 10px;
  margin: var(--spacing-xs) 0 var(--spacing-sm);
}

.rail {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 1px;
  background: var(--color-bg-tertiary);
}

.tick {
  position: absolute;
  top: 50%;
  left: var(--x);
  width: 5px;
  height: 5px;
  margin: -3px 0 0 -3px;
  border-radius: var(--radius-full);
  background: var(--repo-color, var(--color-text-muted));
  opacity: 0.65;
  animation: tick-in 0.3s ease-out backwards;
  animation-delay: calc(var(--x) * 0.4s);
}

.tick.now {
  width: 8px;
  height: 8px;
  margin: -4.5px 0 0 -4.5px;
  background: var(--color-accent);
  opacity: 1;
  box-shadow: var(--shadow-glow);
}

@keyframes tick-in {
  from {
    transform: scale(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .tick {
    animation: none;
  }
}
</style>
