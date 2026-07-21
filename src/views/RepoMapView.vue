<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import CmdLine from '@/components/CmdLine.vue'
import {
  langColor,
  LANG_SHORT,
  SIZE_OPTIONS,
  useForkMap,
  type SizeBy,
} from '@/composables/useForkMap'
import { useRepoMapScene } from '@/composables/useRepoMapScene'

const {
  repos,
  stats,
  langCounts,
  load,
  error,
  loadCommits,
  commitsState,
  commitsDone,
  stage: loadStage,
  foundRepos,
  foundPulls,
} = useForkMap()

const filt = ref<'all' | 'forked'>('all')
const flowLayer = ref(false)
const langOff = ref<Set<string>>(new Set())
const sizeBy = ref<SizeBy>('stars')

const { tip, satTip, coreTip, counter, mount, pulse, rebuild } = useRepoMapScene({
  repos,
  filt,
  flowLayer,
  langOff,
  sizeBy,
})

const canvas = ref<HTMLCanvasElement | null>(null)
const stage = ref<HTMLElement | null>(null)
const stageW = ref(0)
const stageH = ref(0)
let cleanup: (() => void) | null = null

const measure = (): void => {
  if (!stage.value) return
  stageW.value = stage.value.clientWidth
  stageH.value = stage.value.clientHeight
}

const setFilt = (v: 'all' | 'forked'): void => {
  filt.value = v
  pulse()
}
const toggleFlow = (): void => {
  flowLayer.value = !flowLayer.value
  pulse()
}
const setSize = (v: SizeBy): void => {
  if (v === 'commits') void loadCommits()
  if (sizeBy.value === v) return
  sizeBy.value = v
  pulse()
}

const toggleLang = (lang: string): void => {
  const next = new Set(langOff.value)
  if (next.has(lang)) next.delete(lang)
  else next.add(lang)
  langOff.value = next
}

const SIZE_HINT: Record<SizeBy, string> = {
  stars: 'радиус узла = число звёзд',
  forks: 'радиус узла = число форков',
  merged: 'радиус узла = принятых PR',
  size: 'радиус узла = вес репозитория',
  commits: 'радиус узла = число коммитов',
}

const sizeHint = computed(() => {
  if (sizeBy.value !== 'commits') return SIZE_HINT[sizeBy.value]
  if (commitsState.value === 'loading')
    return `считаю коммиты: ${commitsDone.value} / ${repos.value.length}`
  if (commitsState.value === 'partial') return 'коммиты частично: лимит GitHub, клик повторит'
  return SIZE_HINT.commits
})

const forkedCount = computed(() => repos.value.filter((r) => r.forks > 0).length)

const fmtSize = (kb: number): string => (kb >= 1024 ? `${(kb / 1024).toFixed(1)} МБ` : `${kb} КБ`)

const fmtDate = (iso: string): string =>
  iso
    ? new Date(iso)
        .toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
        .replace(' г.', '')
    : ''

const plural = (n: number, one: string, few: string, many: string): string => {
  const tail = n % 100
  if (tail > 10 && tail < 20) return many
  const last = n % 10
  if (last === 1) return one
  return last > 1 && last < 5 ? few : many
}

const fmtPr = (n: number): string => plural(n, 'принятый PR', 'принятых PR', 'принятых PR')

const booting = computed(() => loadStage.value === 'repos' || loadStage.value === 'pulls')

let scanTimer: number | undefined
watch(booting, (on) => {
  if (on) scanTimer = window.setInterval(pulse, 1100)
  else {
    window.clearInterval(scanTimer)
    scanTimer = undefined
  }
})

const tipStyle = computed(() => {
  const t = tip.value
  if (!t) return {}
  const flipX = t.x > stageW.value * 0.62
  const flipY = t.y > stageH.value * 0.62
  return {
    left: `${t.x + (flipX ? -16 : 16)}px`,
    top: `${t.y + (flipY ? -8 : 8)}px`,
    transform: `translate(${flipX ? '-100%' : '0'}, ${flipY ? '-100%' : '0'})`,
  }
})

const satTipStyle = computed(() => {
  const t = satTip.value
  if (!t) return {}
  const flipX = t.x > stageW.value * 0.7
  return {
    left: `${t.x + (flipX ? -14 : 14)}px`,
    top: `${t.y + 14}px`,
    transform: `translate(${flipX ? '-100%' : '0'}, 0)`,
  }
})

const coreTipStyle = computed(() => {
  const t = coreTip.value
  if (!t) return {}
  return { left: `${t.x}px`, top: `${t.y - 44}px`, transform: 'translate(-50%, -100%)' }
})

onMounted(() => {
  measure()
  window.addEventListener('resize', measure)
  if (canvas.value) cleanup = mount(canvas.value)
  load()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', measure)
  window.clearInterval(scanTimer)
  cleanup?.()
})
</script>

<template>
  <div ref="stage" class="stage">
    <canvas ref="canvas" class="map-canvas"></canvas>

    <Transition name="boot">
      <div v-if="booting" class="boot">
        <div class="boot-ttl">сбор данных с github<i class="boot-cur"></i></div>
        <div class="boot-row" :class="{ ok: foundRepos > 0 }">
          <span>репозитории</span><b>{{ foundRepos || '···' }}</b>
        </div>
        <div class="boot-row" :class="{ ok: foundPulls > 0 }">
          <span>принятые PR</span><b>{{ foundPulls || '···' }}</b>
        </div>
      </div>
    </Transition>

    <div class="ov tl">
      <CmdLine @run="rebuild">build --map --from-scratch</CmdLine>
      <h1>Карта репозиториев</h1>
      <div class="chips">
        <button class="chip" :class="{ on: filt === 'all' }" @click="setFilt('all')">
          все {{ stats.total }}
        </button>
        <button class="chip" :class="{ on: filt === 'forked' }" @click="setFilt('forked')">
          форкнутые {{ forkedCount }}
        </button>
        <button
          class="chip"
          :class="{ on: flowLayer }"
          title="Жёлтые импульсы: принятые PR соавторов в основной репозиторий"
          @click="toggleFlow"
        >
          поток PR
        </button>
      </div>
      <div class="chips size">
        <span class="chips-lbl">размер:</span>
        <button
          v-for="o in SIZE_OPTIONS"
          :key="o.key"
          class="chip sm"
          :class="{ on: sizeBy === o.key }"
          @click="setSize(o.key)"
        >
          {{ o.label }}
        </button>
      </div>
      <div class="note">{{ sizeHint }}</div>
      <div v-if="error" class="note err">{{ error }}</div>
      <div v-if="flowLayer" class="note flow">
        жёлтые импульсы – принятые PR соавторов в оригинал
      </div>
    </div>

    <div class="ov tr">
      <div class="cnt">{{ counter }}</div>
      <div class="cnt-lbl">{{ plural(counter, 'репозиторий', 'репозитория', 'репозиториев') }}</div>
      <div class="meta">
        {{ stats.languages }} {{ plural(stats.languages, 'язык', 'языка', 'языков') }} ·
        {{ stats.stars }}★ · {{ stats.forked }}
        {{ plural(stats.forked, 'форк', 'форка', 'форков') }} · {{ stats.merged }} PR ·
        {{ stats.contributors }}
        {{ plural(stats.contributors, 'человек', 'человека', 'человек') }}
      </div>
    </div>

    <div class="ov bl">
      <div class="langs">
        <button
          v-for="l in langCounts"
          :key="l.lang"
          class="lang"
          :class="{ off: langOff.has(l.lang) }"
          @click="toggleLang(l.lang)"
        >
          <span class="dot" :style="{ background: langColor(l.lang) }"></span>
          {{ LANG_SHORT[l.lang] ?? l.lang }} <b>{{ l.count }}</b>
        </button>
      </div>
      <div class="legrow">
        <span class="lk"
          ><span class="sat"></span>соавтор с принятыми PR, размер = вклад (клик → профиль)</span
        >
      </div>
    </div>

    <div class="ov br">scroll – зум · drag – пан · клик по узлу – фокус · клик по ядру – обзор</div>

    <div v-if="tip" class="tip" :class="{ pin: tip.pinned }" :style="tipStyle">
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
      <a v-if="tip.pinned" class="go" :href="tip.repo.url" target="_blank" rel="noopener noreferrer"
        >Открыть на GitHub →</a
      >
    </div>

    <div v-if="satTip && !tip" class="sattip" :style="satTipStyle">
      <div class="sattip-head">
        <span class="sattip-dot"></span>
        <b>{{ satTip.login }}</b>
        <span class="sattip-role">в {{ satTip.repo }}</span>
      </div>
      <div class="sattip-stats">
        <b class="sattip-num">{{ satTip.merged }}</b> {{ fmtPr(satTip.merged) }}
        <template v-if="satTip.people > 1"> · {{ satTip.share }} % вклада</template>
        <template v-else> · единственный соавтор</template>
      </div>
      <div v-if="satTip.last" class="sattip-last">последний {{ fmtDate(satTip.last) }}</div>
      <div class="sattip-hint">клик → профиль на github</div>
    </div>

    <div v-if="coreTip && !tip && !satTip" class="coretip" :style="coreTipStyle">
      <div class="coretip-nm">@MaxNagibator</div>
      <div class="coretip-meta">
        {{ stats.total }} {{ plural(stats.total, 'репозиторий', 'репозитория', 'репозиториев') }} ·
        {{ stats.stars }}★ · {{ stats.languages }}
        {{ plural(stats.languages, 'язык', 'языка', 'языков') }}
      </div>
      <div class="coretip-meta">
        {{ stats.forked }} форкнуто · {{ stats.contributors }}
        {{ plural(stats.contributors, 'соавтор', 'соавтора', 'соавторов') }} · {{ stats.merged }} PR
      </div>
      <div class="coretip-hint">клик — вернуться к обзору</div>
    </div>
  </div>
</template>

<style scoped>
.stage {
  position: relative;
  width: 100%;
  height: calc(100dvh - var(--nav-height));
  overflow: hidden;
  background: var(--color-bg-primary);
}

.map-canvas {
  position: absolute;
  inset: 0;
  display: block;
  cursor: grab;
}

.map-canvas.grabbing {
  cursor: grabbing;
}

.map-canvas.pointing {
  cursor: pointer;
}

.ov {
  position: absolute;
  z-index: 5;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

.tl {
  top: var(--spacing-lg);
  left: var(--spacing-lg);
  max-width: 62%;
}

.tl h1 {
  margin: 0;
  justify-content: flex-start;
  text-align: left;
  font-family: var(--font-family-heading);
  font-weight: 600;
  font-size: var(--font-size-3xl);
  letter-spacing: -0.01em;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
  margin-top: var(--spacing-md);
}

.chips.size {
  margin-top: 8px;
  gap: 6px;
}

.chips-lbl {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.chip {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  padding: 4px 11px;
  border-radius: var(--radius-full);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-bg-tertiary);
  color: var(--color-text-muted);
  cursor: pointer;
  transition:
    color var(--transition-base),
    border-color var(--transition-base),
    background var(--transition-base);
}

.chip.sm {
  padding: 3px 9px;
}

.chip:hover {
  color: var(--color-text-secondary);
  border-color: var(--color-text-muted);
}

.chip.on {
  color: var(--color-link);
  border-color: var(--color-link);
  background: var(--color-bg-secondary);
}

.note {
  font-family: var(--font-family-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 7px;
}

.note.flow {
  color: var(--color-accent);
  opacity: 0.85;
}

.boot {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 6;
  transform: translate(-50%, 62px);
  padding: 9px 13px;
  border: 1px solid var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  background: var(--color-bg-elevated);
  box-shadow: var(--shadow-md);
  font-family: var(--font-family-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  pointer-events: none;
}

.boot-ttl {
  color: var(--color-accent);
  letter-spacing: 0.04em;
  text-align: center;
}

.boot-cur {
  display: inline-block;
  width: 6px;
  height: 11px;
  margin-left: 5px;
  vertical-align: -1px;
  background: var(--color-accent);
  animation: bootBlink 1s steps(1) infinite;
}

.boot-row {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  min-width: 186px;
  margin-top: 6px;
  opacity: 0.45;
  transition: opacity var(--transition-base);
}

.boot-row.ok {
  opacity: 1;
}

.boot-row b {
  color: var(--color-text-secondary);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.boot-enter-active,
.boot-leave-active {
  transition: opacity var(--transition-base);
}

.boot-enter-from,
.boot-leave-to {
  opacity: 0;
}

@keyframes bootBlink {
  50% {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .boot-cur {
    animation: none;
  }
}

.note.err {
  color: var(--color-error, #e5534b);
}

.tr {
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  text-align: right;
}

.cnt {
  font-family: var(--font-family-mono);
  font-weight: 700;
  font-size: 34px;
  color: var(--color-accent);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.cnt-lbl {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-top: 2px;
}

.meta {
  font-family: var(--font-family-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: var(--spacing-sm);
}

.bl {
  bottom: var(--spacing-md);
  left: var(--spacing-lg);
  max-width: 64%;
}

.langs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 13px;
  align-items: center;
}

.lang {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-family: var(--font-family-mono);
  font-size: 11px;
  color: var(--color-text-secondary);
  background: none;
  border: none;
  padding: 0;
  transition: opacity var(--transition-fast);
}

.lang.off {
  opacity: 0.3;
}

.lang b {
  color: var(--color-text-muted);
  font-weight: 400;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex: none;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.4);
}

.legrow {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  margin-top: 9px;
  font-family: var(--font-family-mono);
  font-size: 11px;
  color: var(--color-text-muted);
}

.lk {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.sat {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-accent);
  flex: none;
}

.br {
  bottom: var(--spacing-md);
  right: var(--spacing-lg);
  font-family: var(--font-family-mono);
  font-size: 11px;
  color: #666;
  text-align: right;
  max-width: 46%;
}

.tip {
  position: absolute;
  z-index: var(--z-tooltip);
  pointer-events: none;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  max-width: 300px;
  box-shadow: var(--shadow-md);
}

.tip.pin {
  pointer-events: auto;
  border-color: var(--color-accent);
}

.tip .nm {
  font-family: var(--font-family-heading);
  font-weight: 600;
  font-size: 14px;
  color: var(--color-text-primary);
}

.tip .ds {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 3px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tip .dm,
.tip .st {
  font-family: var(--font-family-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 3px;
  font-variant-numeric: tabular-nums;
}

.tip .st {
  margin-top: 6px;
}

.tip .fk {
  font-family: var(--font-family-mono);
  font-size: 11px;
  color: var(--color-link);
  margin-top: 5px;
  line-height: 1.5;
  word-break: break-word;
}

.tip .go {
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

.tip .go:hover {
  border-color: var(--color-link);
}

.sattip {
  position: absolute;
  z-index: var(--z-tooltip);
  pointer-events: none;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  padding: 8px 11px;
  font-family: var(--font-family-mono);
  font-size: 11px;
  color: var(--color-text-secondary);
  box-shadow: var(--shadow-md);
  max-width: 240px;
}

.sattip-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 7px;
}

.sattip b {
  color: var(--color-text-primary);
  font-weight: 600;
}

.sattip-role {
  color: var(--color-text-muted);
}

.sattip-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-accent);
  box-shadow: 0 0 6px var(--color-accent);
  flex: none;
}

.sattip-stats {
  color: var(--color-text-muted);
  margin-top: 5px;
  font-variant-numeric: tabular-nums;
}

.sattip-num {
  color: var(--color-accent);
  font-weight: 600;
}

.sattip-last {
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.sattip-hint {
  color: var(--color-text-muted);
  opacity: 0.7;
  margin-top: 6px;
}

.coretip {
  position: absolute;
  z-index: var(--z-tooltip);
  pointer-events: none;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-md);
  padding: 9px 13px;
  text-align: center;
  box-shadow: var(--shadow-md);
  white-space: nowrap;
}

.coretip-nm {
  font-family: var(--font-family-heading);
  font-weight: 600;
  font-size: 13px;
  color: var(--color-accent);
}

.coretip-meta {
  font-family: var(--font-family-mono);
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-top: 3px;
  font-variant-numeric: tabular-nums;
}

.coretip-hint {
  font-family: var(--font-family-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  margin-top: 5px;
}

@media (max-width: 720px) {
  .tl {
    max-width: 78%;
  }

  .tl h1 {
    font-size: var(--font-size-2xl);
  }

  .bl {
    display: none;
  }

  .br {
    font-size: 10px;
    max-width: 60%;
  }
}
</style>
