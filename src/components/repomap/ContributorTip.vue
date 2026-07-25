<script lang="ts" setup>
import { computed } from 'vue'
import type { SatTipState } from '@/composables/repoMap/types'
import { fmtDate, plural } from '@/utils/format'

const props = defineProps<{
  tip: SatTipState
  stageW: number
}>()

const style = computed(() => {
  const flipX = props.tip.x > props.stageW * 0.7
  return {
    left: `${props.tip.x + (flipX ? -14 : 14)}px`,
    top: `${props.tip.y + 14}px`,
    transform: `translate(${flipX ? '-100%' : '0'}, 0)`,
  }
})
</script>

<template>
  <div class="sattip" :style="style">
    <div class="head">
      <span class="dot"></span>
      <b>{{ tip.login }}</b>
      <span class="role">в {{ tip.repo }}</span>
    </div>
    <div class="stats">
      <b class="num">{{ tip.merged }}</b>
      {{ plural(tip.merged, 'принятый PR', 'принятых PR', 'принятых PR') }}
      <template v-if="tip.people > 1"> · {{ tip.share }} % вклада</template>
      <template v-else> · единственный соавтор</template>
    </div>
    <div v-if="tip.last" class="last">последний {{ fmtDate(tip.last) }}</div>
    <div class="hint">клик → профиль на github</div>
  </div>
</template>

<style scoped>
.sattip {
  position: absolute;
  z-index: var(--z-tooltip);
  pointer-events: none;
  background: rgba(30, 30, 30, 0.9);
  backdrop-filter: blur(4px);
  border: 1px solid var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  padding: 8px 11px;
  font-family: var(--font-family-mono);
  font-size: 11px;
  color: var(--color-text-secondary);
  box-shadow: var(--shadow-lg);
  max-width: 240px;
}

.head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 7px;
}

b {
  color: var(--color-text-primary);
  font-weight: 600;
}

.role {
  color: var(--color-text-muted);
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-accent);
  box-shadow: 0 0 8px var(--color-accent);
  flex: none;
}

.stats {
  color: var(--color-text-muted);
  margin-top: 5px;
  font-variant-numeric: tabular-nums;
}

.num {
  color: var(--color-accent);
  font-weight: 600;
}

.last {
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.hint {
  color: var(--color-text-muted);
  opacity: 0.7;
  margin-top: 6px;
}
</style>
