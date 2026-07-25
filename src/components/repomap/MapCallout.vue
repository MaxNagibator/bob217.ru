<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  x: number
  y: number
  stageW: number
  stageH: number
  accent: string
  width: number
  pinned?: boolean
}>()

const LEAD_X = 34
const LEAD_Y = 24
const GAP = 13

const flip = computed(() => ({
  x: props.x > props.stageW * 0.62,
  y: props.y > props.stageH * 0.66,
}))

const root = computed(() => ({
  left: `${props.x}px`,
  top: `${props.y}px`,
  '--tip-accent': props.accent,
  '--tip-w': `${props.width}px`,
}))

const card = computed(() => ({
  left: `${flip.value.x ? -LEAD_X : LEAD_X}px`,
  top: `${flip.value.y ? -LEAD_Y : LEAD_Y}px`,
  transform: `translate(${flip.value.x ? '-100%' : '0'}, ${flip.value.y ? '-100%' : '0'})`,
}))

const wire = computed(() => {
  const dx = flip.value.x ? -LEAD_X : LEAD_X
  const dy = flip.value.y ? -LEAD_Y : LEAD_Y
  const k = GAP / Math.hypot(dx, dy)
  return { x1: dx * k, y1: dy * k, x2: dx, y2: dy }
})
</script>

<template>
  <div class="callout" :style="root">
    <svg class="wire" width="1" height="1" aria-hidden="true">
      <line :x1="wire.x1" :y1="wire.y1" :x2="wire.x2" :y2="wire.y2" />
    </svg>
    <div class="card" :class="{ pin: pinned }" :style="card">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.callout {
  position: absolute;
  z-index: var(--z-tooltip);
  width: 0;
  height: 0;
  pointer-events: none;
  transform-origin: 0 0;
  animation: pop 170ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.wire {
  position: absolute;
  left: 0;
  top: 0;
  overflow: visible;
}

.wire line {
  stroke: var(--tip-accent);
  stroke-width: 1.2;
  opacity: 0.8;
  stroke-dasharray: 64;
  animation: draw 280ms ease both;
}

.card {
  position: absolute;
  width: var(--tip-w);
  padding: 10px 13px 11px;
  background: rgba(24, 24, 27, 0.92);
  backdrop-filter: blur(5px);
  border: 1px solid var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  box-shadow:
    var(--shadow-lg),
    0 0 24px -8px var(--tip-accent);
  overflow: hidden;
}

.card.pin {
  pointer-events: auto;
  border-color: var(--tip-accent);
  animation: snap 460ms ease both;
}

@keyframes pop {
  from {
    opacity: 0;
    transform: scale(0.94);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes draw {
  from {
    stroke-dashoffset: 64;
  }
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes snap {
  0% {
    box-shadow:
      var(--shadow-lg),
      0 0 0 3px rgba(255, 204, 0, 0.45);
  }
  100% {
    box-shadow:
      var(--shadow-lg),
      0 0 24px -8px var(--tip-accent);
  }
}

@media (max-width: 720px) {
  .card {
    width: min(var(--tip-w), 74vw);
  }
}

@media (prefers-reduced-motion: reduce) {
  .callout,
  .wire line,
  .card.pin {
    animation: none;
  }
}
</style>
