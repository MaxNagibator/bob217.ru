<script lang="ts" setup>
import { computed } from 'vue'
import type { TipState } from '@/composables/repoMap/types'
import { fmtSize, plural } from '@/utils/format'

const props = defineProps<{
  tip: TipState
  stageW: number
  stageH: number
}>()

const style = computed(() => {
  const flipX = props.tip.x > props.stageW * 0.62
  const flipY = props.tip.y > props.stageH * 0.62
  return {
    left: `${props.tip.x + (flipX ? -16 : 16)}px`,
    top: `${props.tip.y + (flipY ? -8 : 8)}px`,
    transform: `translate(${flipX ? '-100%' : '0'}, ${flipY ? '-100%' : '0'})`,
  }
})
</script>

<template>
  <div class="tip" :class="{ pin: tip.pinned }" :style="style">
    <div class="nm">{{ tip.repo.name }}</div>
    <div v-if="tip.repo.desc" class="ds">{{ tip.repo.desc }}</div>
    <div class="dm">домен: {{ tip.repo.domainLabel }}</div>
    <div class="st">
      ★ {{ tip.repo.stars }} · {{ tip.repo.lang }} · forks {{ tip.repo.forks }} ·
      {{ fmtSize(tip.repo.sizeKb)
      }}<template v-if="tip.repo.commits !== null">
        · {{ tip.repo.commits }}
        {{ plural(tip.repo.commits, 'коммит', 'коммита', 'коммитов') }}</template
      ><template v-if="tip.repo.merged"> · merged {{ tip.repo.merged }}</template>
    </div>
    <div v-if="tip.repo.contributors.length" class="fk">
      {{ tip.repo.contributors.map((c) => `${c.login} ×${c.merged}`).join(' · ') }}
    </div>
    <a v-if="tip.pinned" class="go" :href="tip.repo.url" target="_blank" rel="noopener noreferrer">
      Открыть на GitHub →
    </a>
  </div>
</template>

<style scoped>
.tip {
  position: absolute;
  z-index: var(--z-tooltip);
  pointer-events: none;
  background: rgba(30, 30, 30, 0.9);
  backdrop-filter: blur(4px);
  border: 1px solid var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  max-width: 300px;
  box-shadow: var(--shadow-lg);
}

.tip.pin {
  pointer-events: auto;
  border-color: var(--color-accent);
  box-shadow:
    var(--shadow-lg),
    0 0 18px rgba(255, 204, 0, 0.18);
}

.nm {
  font-family: var(--font-family-heading);
  font-weight: 600;
  font-size: 14px;
  color: var(--color-text-primary);
}

.ds {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 3px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.dm,
.st {
  font-family: var(--font-family-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 3px;
  font-variant-numeric: tabular-nums;
}

.st {
  margin-top: 6px;
}

.fk {
  font-family: var(--font-family-mono);
  font-size: 11px;
  color: var(--color-link);
  margin-top: 5px;
  line-height: 1.5;
  word-break: break-word;
}

.go {
  display: inline-block;
  margin-top: 9px;
  font-family: var(--font-family-mono);
  font-size: 12px;
  color: var(--color-link);
  text-decoration: none;
  border: 1px solid var(--color-bg-tertiary);
  border-radius: var(--radius-sm);
  padding: 4px 9px;
  transition: border-color var(--transition-fast);
}

.go:hover {
  border-color: var(--color-link);
}
</style>
