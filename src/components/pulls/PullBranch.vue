<script lang="ts" setup>
import { computed } from 'vue'
import { useCountUp } from '@/composables/useCountUp'
import { LANG_SHORT } from '@/utils/lang'
import type { PullRow } from '@/composables/usePullRequests'
import { fmtDate, plural } from '@/utils/format'

type DiffCell = 'add' | 'del'

const props = defineProps<{
  row: PullRow
  index: number
}>()

const pr = computed(() => props.row.pr)

const lang = computed(() => LANG_SHORT[props.row.lang] ?? props.row.lang)

const countDelay = Math.min(props.index * 70, 420) + 320
const additions = useCountUp(() => pr.value.additions, countDelay)
const deletions = useCountUp(() => pr.value.deletions, countDelay)

const cells = computed<DiffCell[]>(() => {
  const add = pr.value.additions ?? 0
  const del = pr.value.deletions ?? 0
  const sum = add + del
  if (!sum) return []
  let green = Math.round((add / sum) * 5)
  if (add > 0 && green === 0) green = 1
  if (del > 0 && green === 5) green = 4
  return Array.from({ length: 5 }, (_, i): DiffCell => (i < green ? 'add' : 'del'))
})
</script>

<template>
  <li
    class="branch"
    :class="{ 'is-draft': pr.draft }"
    :style="{ '--gap': `${row.gap}px`, '--branch': row.color, '--i': index }"
  >
    <span class="rail" aria-hidden="true">
      <i class="trunk"></i>
      <i class="base"></i>
      <i class="fork"></i>
      <i class="tip"></i>
    </span>

    <div class="body">
      <p class="head">
        <a class="repo" :href="pr.repoUrl" target="_blank" rel="noopener noreferrer">{{
          pr.repo
        }}</a>
        <a class="num" :href="pr.url" target="_blank" rel="noopener noreferrer">#{{ pr.number }}</a>
        <span v-if="pr.draft" class="draft">draft</span>
        <i class="fill" aria-hidden="true"></i>
        <span class="age">{{ row.age }}</span>
      </p>

      <a class="title" :href="pr.url" target="_blank" rel="noopener noreferrer">{{ pr.title }}</a>

      <p class="stats">
        <span class="stat">{{ fmtDate(pr.createdAt) }}</span>
        <span v-if="lang" class="stat lang">{{ lang }}</span>
        <span v-if="pr.commits !== null" class="stat">
          {{ pr.commits }} {{ plural(pr.commits, 'коммит', 'коммита', 'коммитов') }}
        </span>
        <span v-if="pr.changedFiles !== null" class="stat">
          {{ pr.changedFiles }} {{ plural(pr.changedFiles, 'файл', 'файла', 'файлов') }}
        </span>
        <span v-if="pr.comments" class="stat">
          {{ pr.comments }} {{ plural(pr.comments, 'комментарий', 'комментария', 'комментариев') }}
        </span>
        <span v-if="additions !== null" class="stat diff">
          <span class="add">+{{ additions }}</span>
          <span class="del">−{{ deletions ?? 0 }}</span>
          <span class="bar" aria-hidden="true">
            <i v-for="(cell, j) in cells" :key="j" :class="cell"></i>
          </span>
        </span>
      </p>
    </div>
  </li>
</template>

<style scoped>
.branch {
  --trail: min(calc(var(--i) * 70ms), 420ms);
  display: grid;
  grid-template-columns: var(--rail-w, 58px) 1fr;
}

.rail {
  position: relative;
}

.trunk {
  position: absolute;
  left: var(--lane-a, 15px);
  top: 0;
  bottom: 0;
  width: 2px;
  background: repeating-linear-gradient(
    to bottom,
    var(--rail-tick, #5c5c5c) 0 3px,
    transparent 3px 7px
  );
  transform-origin: top;
  animation: draw-down 0.4s ease backwards;
  animation-delay: var(--trail);
}

.branch:first-child .trunk {
  top: var(--base-y, 12px);
}

.base {
  position: absolute;
  left: calc(var(--lane-a, 15px) + 1px);
  top: var(--base-y, 12px);
  width: 7px;
  height: 7px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: var(--color-text-muted);
  animation: pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
  animation-delay: calc(var(--trail) + 90ms);
}

.fork {
  position: absolute;
  left: calc(var(--lane-a, 15px) + 1px);
  top: var(--base-y, 12px);
  width: calc(var(--lane-b, 40px) - var(--lane-a, 15px));
  height: calc(var(--tip-y, 44px) - var(--base-y, 12px));
  border-top: 2px solid var(--branch);
  border-right: 2px solid var(--branch);
  border-top-right-radius: var(--curve, 12px);
  transition: border-color var(--transition-base);
  animation: draw-right 0.35s ease backwards;
  animation-delay: calc(var(--trail) + 120ms);
}

.is-draft .fork {
  border-style: dashed;
}

.tip {
  position: absolute;
  left: calc(var(--lane-b, 40px) + 1px);
  top: var(--tip-y, 44px);
  width: 11px;
  height: 11px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 2px solid var(--branch);
  background: var(--color-bg-primary);
  transition:
    background var(--transition-fast),
    border-color var(--transition-base);
  animation: tip-run 0.38s cubic-bezier(0.33, 1, 0.68, 1) backwards;
  animation-delay: calc(var(--trail) + 130ms);
}

@keyframes tip-run {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%)
      translate(
        calc(var(--lane-a, 15px) - var(--lane-b, 40px)),
        calc(var(--base-y, 12px) - var(--tip-y, 44px))
      );
  }
  25% {
    opacity: 1;
  }
  55% {
    transform: translate(-50%, -50%) translate(0, calc(var(--base-y, 12px) - var(--tip-y, 44px)));
  }
  86% {
    transform: translate(-50%, -50%) scale(1.35);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.branch:hover .tip,
.branch:focus-within .tip {
  background: var(--branch);
}

@keyframes draw-down {
  from {
    transform: scaleY(0);
  }
}

@keyframes draw-right {
  from {
    clip-path: inset(0 100% 0 0);
  }
}

@keyframes pop {
  from {
    transform: translate(-50%, -50%) scale(0);
  }
}

.body {
  min-width: 0;
  padding-right: var(--spacing-sm);
  padding-bottom: var(--gap);
  animation: settle 0.45s cubic-bezier(0.16, 1, 0.3, 1) backwards;
  animation-delay: calc(var(--trail) + 60ms);
}

@keyframes settle {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
}

.head,
.stats {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin: 0;
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.head {
  line-height: 1.7;
}

.repo {
  color: var(--color-link);
}

.num {
  color: inherit;
  font-variant-numeric: tabular-nums;
}

.repo:hover,
.repo:focus-visible,
.num:hover,
.num:focus-visible {
  text-decoration: underline;
}

.draft {
  padding: 0 var(--spacing-sm);
  border: 1px dashed currentcolor;
  border-radius: var(--radius-full);
  letter-spacing: 0.06em;
}

.fill {
  flex: 1;
  min-width: var(--spacing-md);
  height: 0;
  border-bottom: 1px dotted currentcolor;
  opacity: 0.4;
  transform: translateY(-3px);
}

.age {
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.title {
  display: block;
  margin: 2px 0 var(--spacing-xs);
  font-size: var(--font-size-base);
  font-weight: 500;
  line-height: var(--line-height-tight);
  color: var(--color-text-primary);
}

.title:hover,
.title:focus-visible {
  color: var(--branch);
}

.stats {
  min-height: 1.4em;
  gap: 0 var(--spacing-md);
}

.stat {
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.lang {
  color: var(--branch);
  letter-spacing: 0.04em;
}

.diff {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-weight: 600;
}

.add {
  color: var(--color-success);
}

.del {
  color: var(--color-danger);
}

.bar {
  display: inline-flex;
  gap: 2px;
  margin-left: 2px;
}

.bar i {
  width: 7px;
  height: 7px;
  border-radius: 1px;
}

.bar .add {
  background: var(--color-success);
}

.bar .del {
  background: var(--color-danger);
}

@media (max-width: 720px) {
  .title {
    font-size: var(--font-size-sm);
  }

  .stats {
    gap: 0 var(--spacing-sm);
  }
}

@media (prefers-reduced-motion: reduce) {
  .trunk,
  .base,
  .fork,
  .tip,
  .body {
    animation: none;
  }
}
</style>
