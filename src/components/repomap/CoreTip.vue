<script lang="ts" setup>
import { computed } from 'vue'
import type { CoreTipState } from '@/composables/repoMap/types'
import { OWNER, type MapStats } from '@/composables/useForkMap'
import { plural } from '@/utils/format'

const props = defineProps<{
  tip: CoreTipState
  stats: MapStats
}>()

const style = computed(() => ({
  left: `${props.tip.x}px`,
  top: `${props.tip.y - 52}px`,
  transform: 'translate(-50%, -100%)',
}))
</script>

<template>
  <div class="coretip" :style="style">
    <div class="nm">@{{ OWNER }}</div>
    <div class="meta">
      {{ stats.total }} {{ plural(stats.total, 'репозиторий', 'репозитория', 'репозиториев') }} ·
      {{ stats.stars }}★ · {{ stats.languages }}
      {{ plural(stats.languages, 'язык', 'языка', 'языков') }}
    </div>
    <div class="meta">
      {{ stats.forked }} форкнуто · {{ stats.contributors }}
      {{ plural(stats.contributors, 'соавтор', 'соавтора', 'соавторов') }} · {{ stats.merged }} PR
    </div>
    <div class="hint">клик — вернуться к обзору</div>
  </div>
</template>

<style scoped>
.coretip {
  position: absolute;
  z-index: var(--z-tooltip);
  pointer-events: none;
  background: rgba(30, 30, 30, 0.9);
  backdrop-filter: blur(4px);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-md);
  padding: 9px 13px;
  text-align: center;
  box-shadow:
    var(--shadow-lg),
    0 0 22px rgba(255, 204, 0, 0.2);
  white-space: nowrap;
}

.nm {
  font-family: var(--font-family-mono);
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.14em;
  color: var(--color-accent);
}

.meta {
  font-family: var(--font-family-mono);
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-top: 3px;
  font-variant-numeric: tabular-nums;
}

.hint {
  font-family: var(--font-family-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  margin-top: 5px;
}
</style>
