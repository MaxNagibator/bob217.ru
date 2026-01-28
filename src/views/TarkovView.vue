<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useTarkovTime, getTarkovStatus } from '@/composables/useTarkovTime'
import {
  Sun,
  Moon,
  Info,
  Terminal,
  Timer,
  Play,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  AlertTriangle,
  HelpCircle,
} from 'lucide-vue-next'
import TarkovBoot from '@/components/tarkov/TarkovBoot.vue'
import TarkovCard from '@/components/tarkov/TarkovCard.vue'
import { useTarkovCraft } from '@/composables/useTarkovCraft'

const { leftZone, rightZone } = useTarkovTime(100)
const isBooting = ref(localStorage.getItem('tarkov_skip_boot') !== 'true')

const skipBootSetting = ref(localStorage.getItem('tarkov_skip_boot') === 'true')
const usePostCraftTimings = ref(localStorage.getItem('tarkov_use_post_craft') === 'true')
const planningOffset = ref(0)
const showPlanningHelp = ref(false)

const toggleBootSequence = () => {
  localStorage.setItem('tarkov_skip_boot', String(skipBootSetting.value))
}

const togglePostCraftMode = () => {
  localStorage.setItem('tarkov_use_post_craft', String(usePostCraftTimings.value))
  planningOffset.value = 0
}

const onBootComplete = () => {
  isBooting.value = false
}

const adjustDuration = (field: 'hours' | 'minutes' | 'seconds', delta: number) => {
  const max = field === 'hours' ? 999 : 59
  const current = duration.value[field] || 0
  duration.value[field] = Math.max(0, Math.min(max, current + delta))
}

const {
  duration,
  isCrafting,
  isReady,
  progress,
  formattedRemaining,
  completionTime,
  startCraft,
  resetCraft,
} = useTarkovCraft()

watch(isCrafting, (newVal) => {
  if (!newVal) {
    usePostCraftTimings.value = false
    localStorage.setItem('tarkov_use_post_craft', 'false')
    planningOffset.value = 0
  }
})

const effectiveTerminalStatus = computed(() => {
  void leftZone.value.time

  let baseTime = Date.now()
  let isPlanned = false

  if (usePostCraftTimings.value && isCrafting.value && completionTime.value) {
    baseTime = completionTime.value.getTime()
    isPlanned = true
  }

  if (planningOffset.value !== 0) {
    const msPerCycle = (24 * 60 * 60 * 1000) / 7
    baseTime += planningOffset.value * msPerCycle
    isPlanned = true
  }

  const leftStatus = getTarkovStatus(true, baseTime).terminal
  const rightStatus = getTarkovStatus(false, baseTime).terminal

  return {
    left: {
      ...leftStatus,
      isTight: isPlanned && leftStatus.isOpen && leftStatus.minutesToEvent < 10,
    },
    right: {
      ...rightStatus,
      isTight: isPlanned && rightStatus.isOpen && rightStatus.minutesToEvent < 10,
    },
    isPlanned: isPlanned,
    planningLabel: usePostCraftTimings.value ? 'ПОСЛЕ КРАФТА' : 'ПРОГНОЗ',
    offset: planningOffset.value,
  }
})

const isLeftNearest = computed(() => {
  const left = effectiveTerminalStatus.value.left
  const right = effectiveTerminalStatus.value.right

  if (left.isOpen && !right.isOpen) return true
  if (!left.isOpen && right.isOpen) return false

  return left.minutesToEvent <= right.minutesToEvent
})

const nextExposureAfterCraft = computed(() => {
  if (!completionTime.value) return null

  const msInDay = 24 * 60 * 60 * 1000
  const russiaOffset = 3 * 60 * 60 * 1000
  const readyTime = completionTime.value.getTime()
  const nowTime = Date.now()

  const targetTime = Math.max(readyTime, nowTime)

  const findNextWindow = (offset: number) => {
    const tarkovMs = (targetTime * 7 + russiaOffset + offset) % msInDay
    const tarkovHours = tarkovMs / (60 * 60 * 1000)

    if (tarkovHours >= 22 || tarkovHours < 4) {
      return targetTime
    }

    const targetOpeningMs = 22 * 60 * 60 * 1000
    const tarkovMsToWait = (targetOpeningMs - tarkovMs + msInDay) % msInDay
    const realMsToWait = tarkovMsToWait / 7

    return targetTime + realMsToWait
  }

  const zone1Next = findNextWindow(0)
  const zone2Next = findNextWindow(12 * 60 * 60 * 1000)

  const soonest = Math.min(zone1Next, zone2Next)

  if (soonest === targetTime) {
    return 'ДОСТУПНО СРАЗУ'
  }

  const soonestDate = new Date(soonest)
  const zoneName = zone1Next <= zone2Next ? 'ЛЕВАЯ' : 'ПРАВАЯ'

  const formattedDate = soonestDate.toLocaleString([], {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

  return `${formattedDate} (${zoneName})`
})

const formattedCompletionTime = computed(() => {
  if (!completionTime.value) return ''
  return completionTime.value.toLocaleString([], {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
})
</script>

<template>
  <div class="tarkov-view">
    <TarkovBoot v-if="isBooting" @ready="onBootComplete" />

    <div class="noise-overlay"></div>
    <div class="scanlines"></div>
    <div class="vignette"></div>

    <transition name="fade-content">
      <div v-show="!isBooting" class="container">
        <header class="tarkov-header">
          <div class="header-top">
            <h1 class="tarkov-title">ВРЕМЯ ТАРКОВА</h1>
            <div class="live-indicator"><span class="dot"></span> LIVE FEED</div>
          </div>
          <div class="industrial-divider"></div>
        </header>

        <div class="main-grid">
          <section class="grid-section">
            <h2 class="section-title">СИНХРОНИЗАЦИЯ ВРЕМЕНИ</h2>

            <div class="cards-row">
              <TarkovCard
                title="ЗОНА 1 (ЛЕВАЯ)"
                :subtext="leftZone.isDay ? 'ДНЕВНАЯ ФАЗА' : 'НОЧНАЯ ФАЗА'"
                :variant="leftZone.isDay ? 'warning' : 'default'"
              >
                <template #icon>
                  <component :is="leftZone.isDay ? Sun : Moon" :size="20" />
                </template>

                <div class="time-display">
                  {{ leftZone.time }}
                </div>
              </TarkovCard>

              <TarkovCard
                title="ЗОНА 2 (ПРАВАЯ)"
                :subtext="rightZone.isDay ? 'ДНЕВНАЯ ФАЗА' : 'НОЧНАЯ ФАЗА'"
                :variant="rightZone.isDay ? 'warning' : 'default'"
              >
                <template #icon>
                  <component :is="rightZone.isDay ? Sun : Moon" :size="20" />
                </template>

                <div class="time-display">
                  {{ rightZone.time }}
                </div>
              </TarkovCard>
            </div>
          </section>

          <section class="grid-section">
            <h2 class="section-title">ЛОКАЦИЯ: ТЕРМИНАЛ</h2>

            <div class="section-controls">
              <div class="window-navigation">
                <button
                  class="nav-btn"
                  @click="planningOffset--"
                  title="Предыдущее окно"
                  :disabled="planningOffset <= 0"
                >
                  <ChevronLeft :size="16" />
                </button>
                <div class="nav-status">
                  <span class="nav-label" :class="{ 'is-active': planningOffset > 0 }">
                    {{ planningOffset > 0 ? `ЦИКЛ +${planningOffset}` : 'ТЕКУЩИЕ ОКНА' }}
                  </span>
                  <button v-if="planningOffset > 0" class="nav-reset" @click="planningOffset = 0">
                    СБРОС
                  </button>
                </div>
                <button class="nav-btn" @click="planningOffset++" title="Следующее окно">
                  <ChevronRight :size="16" />
                </button>
              </div>

              <div v-if="isCrafting" class="planning-controls-group">
                <div class="planning-toggle-container">
                  <label class="qol-setting planning-toggle">
                    <input
                      type="checkbox"
                      v-model="usePostCraftTimings"
                      @change="togglePostCraftMode"
                    />
                    <span class="checkbox-custom"></span>
                    <span class="setting-label">ПЛАНИРОВАТЬ ПОД КРАФТ</span>
                  </label>
                </div>
                <button
                  class="help-toggle-btn"
                  @click="showPlanningHelp = !showPlanningHelp"
                  :class="{ 'is-active': showPlanningHelp }"
                  title="Как это работает?"
                >
                  <HelpCircle :size="16" />
                </button>
              </div>
            </div>

            <div v-if="effectiveTerminalStatus.isPlanned" class="planning-target-badge">
              <span class="badge-label">ПРОГНОЗ НА МОМЕНТ ГОТОВНОСТИ КРАФТА:</span>
              <span class="badge-value">{{ formattedCompletionTime }}</span>
            </div>

            <transition name="slide-fade">
              <div v-if="showPlanningHelp" class="planning-help-panel industrial-panel">
                <div class="help-header">
                  <HelpCircle :size="18" class="help-icon" />
                  <h3>СПРАВКА ПО ПЛАНИРОВАНИЮ</h3>
                </div>
                <ul class="help-list">
                  <li>
                    <strong>Обычный режим:</strong> Таймеры показывают, сколько реально осталось до
                    открытия или закрытия.
                  </li>
                  <li>
                    <strong>Планирование под крафт:</strong> Мы переносимся в будущее — на момент,
                    когда ваш текущий крафт будет завершен.
                  </li>
                  <li>
                    <strong>Таймер в планировании:</strong> Показывает «запас времени», который у
                    вас будет <strong>сразу после</strong> готовности крафта.
                  </li>
                  <li>
                    <AlertTriangle :size="14" class="inline-icon color-danger" />
                    <strong>Предупреждение:</strong> Если на карточке написано «МАЛО ВРЕМЕНИ»,
                    значит у вас будет менее 10 минут, чтобы забрать предмет и зайти в рейд.
                  </li>
                </ul>
              </div>
            </transition>

            <div class="cards-row">
              <TarkovCard
                title="ДОСТУПНО (ЗОНА 1)"
                :variant="
                  effectiveTerminalStatus.isPlanned &&
                  isLeftNearest &&
                  !effectiveTerminalStatus.left.isOpen
                    ? 'warning'
                    : effectiveTerminalStatus.left.isOpen
                      ? 'success'
                      : 'danger'
                "
                :active="isLeftNearest"
                :subtext="'РЕЖИМ: 22:00 - 04:00'"
              >
                <template #icon>
                  <Terminal :size="20" />
                </template>

                <div
                  class="terminal-hero"
                  :class="{ 'is-planned': effectiveTerminalStatus.isPlanned }"
                >
                  <div
                    v-if="effectiveTerminalStatus.isPlanned"
                    class="planned-badge"
                    :class="{ 'is-tight': effectiveTerminalStatus.left.isTight }"
                  >
                    {{ effectiveTerminalStatus.planningLabel }}
                  </div>
                  <div v-if="effectiveTerminalStatus.left.isTight" class="tight-warning">
                    <AlertTriangle :size="14" /> МАЛО ВРЕМЕНИ
                  </div>
                  <div class="hero-range">{{ effectiveTerminalStatus.left.windowRange }}</div>
                  <div
                    class="hero-event"
                    :class="effectiveTerminalStatus.left.isOpen ? 'is-closing' : 'is-opening'"
                  >
                    {{ effectiveTerminalStatus.left.nextEventText }}
                    <span class="countdown-value">
                      {{ effectiveTerminalStatus.left.formattedCountdown }}
                    </span>
                  </div>
                </div>

                <template #footer>
                  <div v-if="isLeftNearest" class="badge">БЛИЖАЙШЕЕ ОКНО</div>
                  <div
                    class="status-indicator-mini"
                    :class="{ 'is-open': effectiveTerminalStatus.left.isOpen }"
                  >
                    {{ effectiveTerminalStatus.left.statusText }}
                  </div>
                </template>
              </TarkovCard>

              <TarkovCard
                title="ДОСТУПНО (ЗОНА 2)"
                :variant="
                  effectiveTerminalStatus.isPlanned &&
                  !isLeftNearest &&
                  !effectiveTerminalStatus.right.isOpen
                    ? 'warning'
                    : effectiveTerminalStatus.right.isOpen
                      ? 'success'
                      : 'danger'
                "
                :active="!isLeftNearest"
                :subtext="'РЕЖИМ: 22:00 - 04:00'"
              >
                <template #icon>
                  <Terminal :size="20" />
                </template>

                <div
                  class="terminal-hero"
                  :class="{ 'is-planned': effectiveTerminalStatus.isPlanned }"
                >
                  <div
                    v-if="effectiveTerminalStatus.isPlanned"
                    class="planned-badge"
                    :class="{ 'is-tight': effectiveTerminalStatus.right.isTight }"
                  >
                    {{ effectiveTerminalStatus.planningLabel }}
                  </div>
                  <div v-if="effectiveTerminalStatus.right.isTight" class="tight-warning">
                    <AlertTriangle :size="14" /> МАЛО ВРЕМЕНИ
                  </div>
                  <div class="hero-range">{{ effectiveTerminalStatus.right.windowRange }}</div>
                  <div
                    class="hero-event"
                    :class="effectiveTerminalStatus.right.isOpen ? 'is-closing' : 'is-opening'"
                  >
                    {{ effectiveTerminalStatus.right.nextEventText }}
                    <span class="countdown-value">
                      {{ effectiveTerminalStatus.right.formattedCountdown }}
                    </span>
                  </div>
                </div>

                <template #footer>
                  <div v-if="!isLeftNearest" class="badge">БЛИЖАЙШЕЕ ОКНО</div>
                  <div
                    class="status-indicator-mini"
                    :class="{ 'is-open': effectiveTerminalStatus.right.isOpen }"
                  >
                    {{ effectiveTerminalStatus.right.statusText }}
                  </div>
                </template>
              </TarkovCard>
            </div>
          </section>

          <section class="grid-section">
            <h2 class="section-title">РАЗВЕДЦЕНТР: КРАФТ КАРТЫ</h2>

            <div class="crafting-container industrial-panel">
              <div class="crafting-header">
                <div class="crafting-info">
                  <Timer :size="24" class="craft-icon" />
                  <div class="craft-details">
                    <span class="craft-label">СТАТУС КРАФТА:</span>
                    <span class="craft-status" :class="{ 'is-ready': isReady }">
                      {{ isReady ? 'ГОТОВО' : isCrafting ? 'В ПРОЦЕССЕ' : 'ОЖИДАНИЕ' }}
                    </span>
                  </div>
                </div>

                <div v-if="!isCrafting" class="crafting-settings">
                  <div class="duration-inputs">
                    <div class="input-group">
                      <button class="step-btn" @click="adjustDuration('hours', -1)">
                        <Minus :size="12" />
                      </button>
                      <input type="number" v-model.number="duration.hours" min="0" max="999" />
                      <button class="step-btn" @click="adjustDuration('hours', 1)">
                        <Plus :size="12" />
                      </button>
                      <span>Ч</span>
                    </div>
                    <div class="input-group">
                      <button class="step-btn" @click="adjustDuration('minutes', -1)">
                        <Minus :size="12" />
                      </button>
                      <input type="number" v-model.number="duration.minutes" min="0" max="59" />
                      <button class="step-btn" @click="adjustDuration('minutes', 1)">
                        <Plus :size="12" />
                      </button>
                      <span>М</span>
                    </div>
                    <div class="input-group">
                      <button class="step-btn" @click="adjustDuration('seconds', -1)">
                        <Minus :size="12" />
                      </button>
                      <input type="number" v-model.number="duration.seconds" min="0" max="59" />
                      <button class="step-btn" @click="adjustDuration('seconds', 1)">
                        <Plus :size="12" />
                      </button>
                      <span>С</span>
                    </div>
                  </div>
                  <button class="tarkov-btn primary" @click="startCraft">
                    <Play :size="16" /> НАЧАТЬ КРАФТ
                  </button>
                </div>

                <div v-else class="crafting-actions">
                  <button class="tarkov-btn danger mini" @click="resetCraft">
                    <RotateCcw :size="14" /> СБРОСИТЬ
                  </button>
                </div>
              </div>

              <div v-if="isCrafting" class="crafting-body">
                <div class="completion-hero">
                  <span class="completion-label">КАРТА БУДЕТ ГОТОВА:</span>
                  <span class="completion-time">{{ formattedCompletionTime }}</span>
                </div>

                <div class="progress-section">
                  <div class="progress-stats">
                    <span class="time-remaining">{{ formattedRemaining }}</span>
                    <span class="percentage">{{ Math.floor(progress) }}%</span>
                  </div>
                  <div class="progress-bar-container">
                    <div
                      class="progress-bar"
                      :style="{ width: `${progress}%` }"
                      :class="{ 'is-done': isReady }"
                    ></div>
                    <div class="progress-shimmer"></div>
                  </div>
                </div>

                <div class="craft-meta-grid">
                  <div class="meta-item">
                    <span class="meta-label">ЗАВЕРШЕНИЕ:</span>
                    <span class="meta-value">
                      {{
                        completionTime?.toLocaleString([], {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      }}
                    </span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">ДОСТУП В ТЕРМИНАЛ:</span>
                    <span class="meta-value">{{ nextExposureAfterCraft }}</span>
                  </div>
                  <div class="meta-item" v-if="isReady">
                    <CheckCircle2 :size="16" class="ready-icon" />
                    <span class="meta-value highlight">КАРТА ГОТОВА К ВЫДАЧЕ</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div class="info-footer">
          <div class="footer-controls">
            <div class="requirement-box">
              <Info :size="18" class="info-icon" />
              <p>
                ВНИМАНИЕ: Для доступа к терминалу требуется активная ключ-карта доступа (TerraGroup
                Labs).
              </p>
            </div>

            <div class="settings-row">
              <label class="qol-setting">
                <input type="checkbox" v-model="skipBootSetting" @change="toggleBootSequence" />
                <span class="checkbox-custom"></span>
                <span class="setting-label">ПРОПУСК ЗАГРУЗКИ (BOOT SEQUENCE)</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&family=Rajdhani:wght@400;500;600;700&display=swap');

.tarkov-view {
  --tk-bg: #0a0a0a;
  --tk-olive: #5a633a;
  --tk-olive-dark: #3a4225;
  --tk-orange: #d9a334;
  --tk-danger: #8b0000;
  --tk-border: #222222;
  --tk-text: #cccccc;
  --tk-highlight: #ffffff;

  min-height: calc(100vh - var(--nav-height));
  background: var(--tk-bg);
  color: var(--tk-text);
  font-family: 'Rajdhani', sans-serif;
  position: relative;
  overflow: hidden;
  padding: var(--spacing-2xl) 0;
}

.noise-overlay {
  position: absolute;
  inset: 0;
  opacity: 0.04;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  z-index: 1;
}

.scanlines {
  position: absolute;
  inset: 0;
  background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%);
  background-size: 100% 4px;
  pointer-events: none;
  z-index: 2;
}

.vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.8) 100%);
  pointer-events: none;
  z-index: 3;
}

.container {
  max-width: var(--max-width-content);
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  position: relative;
  z-index: 10;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.tarkov-title {
  font-family: 'Oswald', sans-serif;
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 700;
  color: var(--tk-highlight);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin: 0;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
}

.live-indicator {
  font-family: 'Oswald', sans-serif;
  color: var(--tk-danger);
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  background: var(--tk-danger);
  border-radius: 50%;
  box-shadow: 0 0 10px var(--tk-danger);
  animation: blink 2s infinite;
}

.industrial-divider {
  height: 2px;
  background: var(--tk-border);
  position: relative;
  margin: var(--spacing-md) 0 var(--spacing-2xl);
}

.industrial-divider::before {
  content: '';
  position: absolute;
  top: -2px;
  left: 0;
  width: 40px;
  height: 6px;
  background: var(--tk-orange);
  animation: scan 4s infinite linear;
}

@keyframes scan {
  0% {
    left: 0;
    width: 40px;
  }
  50% {
    width: 100px;
  }
  100% {
    left: 100%;
    width: 40px;
  }
}

.main-grid {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.section-title {
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem;
  color: var(--tk-olive);
  margin-bottom: 1rem;
  padding-left: 1rem;
  border-left: 4px solid var(--tk-olive);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.cards-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
}

.time-display {
  font-family: 'Oswald', sans-serif;
  font-size: 3.5rem;
  color: var(--tk-highlight);
  text-align: center;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.15);
}

.terminal-hero {
  position: relative;
}

.hero-label {
  font-family: 'Oswald', sans-serif;
  font-size: 0.9rem;
  color: var(--tk-olive);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 0.5rem;
}

.hero-time {
  font-family: 'Oswald', sans-serif;
  font-size: 5rem;
  color: var(--tk-orange);
  line-height: 1;
  text-shadow: 0 0 30px rgba(217, 163, 52, 0.4);
  font-weight: 700;
  margin-bottom: 0.2rem;
}

.hero-range {
  font-family: 'Oswald', sans-serif;
  font-size: 3rem;
  color: var(--tk-orange);
  line-height: 1;
  text-shadow: 0 0 20px rgba(217, 163, 52, 0.3);
  font-weight: 700;
  margin-bottom: 0.5rem;
  letter-spacing: 2px;
}

.hero-event {
  font-family: 'Rajdhani', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.4rem;
  white-space: nowrap;
}

.hero-event .countdown-value {
  font-family: 'Oswald', sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--tk-highlight);
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.hero-event.is-opening {
  color: var(--tk-olive);
}

.hero-event.is-closing {
  color: var(--tk-danger);
}

.hero-closing {
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--tk-olive);
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  letter-spacing: 1px;
}

.hero-closing .highlight {
  color: var(--tk-highlight);
}

.hero-countdown {
  font-family: 'Rajdhani', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--tk-text);
  letter-spacing: 1px;
}

.countdown-value {
  color: var(--tk-highlight);
  font-variant-numeric: tabular-nums;
}

.variant-success .terminal-hero {
  background: radial-gradient(circle at center, rgba(90, 99, 58, 0.1) 0%, transparent 70%);
}

.variant-danger .terminal-hero {
  background: radial-gradient(circle at center, rgba(139, 0, 0, 0.05) 0%, transparent 70%);
}

.tarkov-card.is-active.variant-success {
  animation: pulse-border-success 3s infinite;
}

.tarkov-card.is-active.variant-danger {
  animation: pulse-border-danger 3s infinite;
}

.tarkov-card.is-active.variant-warning {
  animation: pulse-border-warning 3s infinite;
}

@keyframes pulse-border-success {
  0%,
  100% {
    border-color: #5a633a;
    box-shadow: 0 0 15px rgba(90, 99, 58, 0.2);
  }
  50% {
    border-color: #8fa35a;
    box-shadow: 0 0 25px rgba(90, 99, 58, 0.4);
  }
}

@keyframes pulse-border-danger {
  0%,
  100% {
    border-color: #8b0000;
    box-shadow: 0 0 15px rgba(139, 0, 0, 0.2);
  }
  50% {
    border-color: #c90000;
    box-shadow: 0 0 25px rgba(139, 0, 0, 0.4);
  }
}

@keyframes pulse-border-warning {
  0%,
  100% {
    border-color: #4a3f28;
    box-shadow: 0 0 15px rgba(217, 163, 52, 0.2);
  }
  50% {
    border-color: var(--tk-orange);
    box-shadow: 0 0 25px rgba(217, 163, 52, 0.4);
  }
}

.status-indicator-mini {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--tk-danger);
  padding: 2px 6px;
  border: 1px solid var(--tk-danger);
  border-radius: 2px;
}

.status-indicator-mini.is-open {
  color: var(--tk-olive);
  border-color: var(--tk-olive);
}

.badge {
  background: var(--tk-orange);
  color: #000;
  font-family: 'Oswald', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 2px;
}

.info-footer {
  margin-top: 4rem;
  opacity: 0.8;
}

.footer-controls {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.qol-setting {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  width: fit-content;
  user-select: none;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--tk-olive);
  transition: all 0.2s;
  padding: 4px 8px;
  border: 1px solid transparent;
}

.qol-setting:hover {
  color: var(--tk-orange);
  background: rgba(217, 163, 52, 0.05);
  border-color: rgba(217, 163, 52, 0.2);
}

.qol-setting input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkbox-custom {
  position: relative;
  height: 18px;
  width: 18px;
  background-color: rgba(0, 0, 0, 0.5);
  border: 2px solid var(--tk-olive);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qol-setting:hover .checkbox-custom {
  border-color: var(--tk-orange);
  box-shadow: 0 0 10px rgba(217, 163, 52, 0.2);
}

.qol-setting input:checked ~ .checkbox-custom {
  background-color: rgba(217, 163, 52, 0.1);
  border-color: var(--tk-orange);
  box-shadow: 0 0 15px rgba(217, 163, 52, 0.15);
}

.checkbox-custom::after {
  content: '';
  position: absolute;
  display: none;
  width: 8px;
  height: 8px;
  background: var(--tk-orange);
  box-shadow: 0 0 8px var(--tk-orange);
  animation: check-pop 0.2s ease-out;
}

@keyframes check-pop {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.qol-setting input:checked ~ .checkbox-custom::after {
  display: block;
}

.setting-label {
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.requirement-box {
  background: rgba(90, 99, 58, 0.1);
  border: 1px dashed var(--tk-olive);
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
}

.info-icon {
  color: var(--tk-olive);
  flex-shrink: 0;
}

.fade-content-enter-active {
  transition: opacity 1s ease 0.2s;
}
.fade-content-enter-from {
  opacity: 0;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

@keyframes pulse-glow {
  0% {
    opacity: 1;
    text-shadow: 0 0 10px rgba(90, 99, 58, 0.5);
  }
  50% {
    opacity: 0.6;
    text-shadow: 0 0 20px rgba(90, 99, 58, 0.8);
  }
  100% {
    opacity: 1;
    text-shadow: 0 0 10px rgba(90, 99, 58, 0.5);
  }
}

.planning-controls-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.help-toggle-btn {
  background: rgba(90, 99, 58, 0.1);
  border: 1px solid var(--tk-olive-dark);
  color: var(--tk-olive);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 2px;
}

.help-toggle-btn:hover,
.help-toggle-btn.is-active {
  background: var(--tk-olive-dark);
  color: var(--tk-highlight);
  border-color: var(--tk-olive);
}

.planning-help-panel {
  margin-top: -1rem;
  margin-bottom: 2rem;
  border-left: 4px solid var(--tk-orange);
}

.help-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.help-header h3 {
  font-family: 'Oswald', sans-serif;
  font-size: 1rem;
  margin: 0;
  color: var(--tk-orange);
  letter-spacing: 1px;
}

.help-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.help-list li {
  font-size: 0.9rem;
  line-height: 1.4;
  color: var(--tk-text);
  padding-left: 1.5rem;
  position: relative;
}

.help-list li::before {
  content: '>';
  position: absolute;
  left: 0;
  color: var(--tk-olive);
  font-weight: 700;
}

.help-list strong {
  color: var(--tk-highlight);
}

.tight-warning {
  position: absolute;
  bottom: 0px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--tk-danger);
  color: #fff;
  padding: 2px 10px;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  border-radius: 2px;
  box-shadow: 0 0 15px rgba(139, 0, 0, 0.4);
  animation: pulse-danger 2s infinite;
  white-space: nowrap;
  z-index: 5;
}

.planned-badge.is-tight {
  background: var(--tk-danger);
  color: #fff;
}

.color-danger {
  color: var(--tk-danger);
}

.inline-icon {
  vertical-align: middle;
  margin-top: -2px;
}

@keyframes pulse-danger {
  0%,
  100% {
    transform: translateX(-50%) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateX(-50%) scale(1.05);
    opacity: 0.8;
  }
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

@media (max-width: 768px) {
  .cards-row {
    grid-template-columns: 1fr;
  }

  .time-display {
    font-size: 3rem;
  }

  .status-content {
    flex-direction: row;
    text-align: left;
  }
}

.section-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1.5rem;
  flex-wrap: wrap;
  padding: 0 0.5rem;
}

.window-navigation {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.nav-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 100px;
}

.nav-label {
  font-family: 'Oswald', sans-serif;
  font-size: 0.75rem;
  color: var(--tk-olive-dark);
  text-transform: uppercase;
  letter-spacing: 1px;
  line-height: 1;
  text-align: center;
}

.nav-label.is-active {
  color: var(--tk-orange);
}

.nav-reset {
  background: transparent;
  border: none;
  color: var(--tk-danger);
  font-size: 0.65rem;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  margin-top: 2px;
  text-decoration: underline;
}

.nav-btn {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid var(--tk-olive-dark);
  color: var(--tk-olive);
  width: 28px;
  height: 28px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.nav-btn:hover:not(:disabled) {
  background: var(--tk-olive-dark);
  color: var(--tk-highlight);
  border-color: var(--tk-olive);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  border-color: #222;
}

.planning-toggle {
  background: rgba(217, 163, 52, 0.05);
  padding: 4px 12px;
  border: 1px solid rgba(217, 163, 52, 0.2);
}

.terminal-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem 0;
  text-align: center;
  min-height: 180px;
  border: 1px solid transparent;
  transition: all 0.3s ease;
}

.terminal-hero.is-planned {
  border: 1px solid rgba(217, 163, 52, 0.4);
  background:
    linear-gradient(rgba(217, 163, 52, 0.03), rgba(217, 163, 52, 0.03)),
    repeating-linear-gradient(
      45deg,
      rgba(217, 163, 52, 0.02),
      rgba(217, 163, 52, 0.02) 10px,
      transparent 10px,
      transparent 20px
    );
}

.planning-target-badge {
  background: rgba(217, 163, 52, 0.1);
  border: 1px dashed var(--tk-orange);
  padding: 8px 16px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-family: 'Rajdhani', sans-serif;
  animation: fade-in-pulse 4s infinite;
}

.badge-label {
  font-weight: 700;
  color: var(--tk-olive);
  font-size: 0.8rem;
  letter-spacing: 1px;
}

.badge-value {
  color: var(--tk-orange);
  font-weight: 700;
  font-family: 'Oswald', sans-serif;
  font-size: 1rem;
}

.completion-hero {
  background: linear-gradient(90deg, rgba(217, 163, 52, 0.05), transparent);
  border-left: 4px solid var(--tk-orange);
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.completion-label {
  font-size: 0.75rem;
  color: var(--tk-olive);
  font-weight: 700;
  letter-spacing: 2px;
}

.completion-time {
  font-family: 'Oswald', sans-serif;
  font-size: 2rem;
  color: var(--tk-orange);
  font-weight: 700;
  text-shadow: 0 0 15px rgba(217, 163, 52, 0.3);
}

@keyframes fade-in-pulse {
  0%,
  100% {
    opacity: 0.8;
    border-color: rgba(217, 163, 52, 0.4);
  }
  50% {
    opacity: 1;
    border-color: var(--tk-orange);
  }
}

.planned-badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--tk-orange);
  color: #000;
  padding: 1px 12px;
  font-size: 0.7rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
  z-index: 5;
}

.planned-badge::before,
.planned-badge::after {
  content: '';
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--tk-bg);
  top: 50%;
  transform: translateY(-50%);
}

.planned-badge::before {
  left: -2px;
}
.planned-badge::after {
  right: -2px;
}

.industrial-panel {
  background: rgba(20, 20, 20, 0.6);
  border: 1px solid var(--tk-border);
  padding: var(--spacing-xl);
  position: relative;
  overflow: hidden;
}

.industrial-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--tk-border);
}

.crafting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.crafting-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.craft-icon {
  color: var(--tk-olive);
}

.craft-details {
  display: flex;
  flex-direction: column;
}

.craft-label {
  font-size: 0.75rem;
  color: var(--tk-olive);
  font-weight: 700;
  letter-spacing: 1px;
}

.craft-status {
  font-family: 'Oswald', sans-serif;
  font-size: 1.2rem;
  color: var(--tk-text);
}

.craft-status.is-ready {
  color: var(--tk-orange);
  text-shadow: 0 0 10px rgba(217, 163, 52, 0.5);
}

.crafting-settings {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.duration-inputs {
  display: flex;
  gap: var(--spacing-xs);
}

.input-group {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid var(--tk-olive-dark);
  padding: 4px 10px;
  gap: 6px;
  transition: all 0.2s;
  position: relative;
}

.input-group:hover {
  border-color: var(--tk-olive);
  background: rgba(90, 99, 58, 0.05);
}

.input-group:focus-within {
  border-color: var(--tk-orange);
  background: rgba(217, 163, 52, 0.05);
  box-shadow: 0 0 10px rgba(217, 163, 52, 0.1);
}

.input-group input {
  background: transparent;
  border: none;
  color: var(--tk-highlight);
  width: 40px;
  font-family: 'Oswald', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  text-align: center;
  outline: none;
  padding: 0;
  appearance: textfield;
  -moz-appearance: textfield;
}

.input-group input::-webkit-outer-spin-button,
.input-group input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.input-group span {
  font-size: 0.75rem;
  color: var(--tk-olive);
  font-weight: 700;
  text-transform: uppercase;
  user-select: none;
  margin-left: 4px;
}

.step-btn {
  background: transparent;
  border: 1px solid var(--tk-olive-dark);
  color: var(--tk-olive);
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
}

.step-btn:hover {
  background: var(--tk-olive-dark);
  color: var(--tk-highlight);
  border-color: var(--tk-olive);
}

.step-btn:active {
  background: var(--tk-orange);
  color: #000;
  border-color: var(--tk-orange);
}

.input-group:focus-within span {
  color: var(--tk-orange);
}

.tarkov-btn {
  font-family: 'Oswald', sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  padding: 8px 16px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  letter-spacing: 1px;
}

.tarkov-btn.primary {
  background: var(--tk-olive);
  color: #000;
}

.tarkov-btn.primary:hover {
  background: var(--tk-orange);
}

.tarkov-btn.danger {
  background: transparent;
  border: 1px solid var(--tk-danger);
  color: var(--tk-danger);
}

.tarkov-btn.danger:hover {
  background: var(--tk-danger);
  color: #fff;
}

.tarkov-btn.mini {
  padding: 4px 8px;
  font-size: 0.75rem;
}

.progress-section {
  margin-bottom: var(--spacing-xl);
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 8px;
}

.time-remaining {
  font-family: 'Oswald', sans-serif;
  font-size: 2.5rem;
  color: var(--tk-highlight);
  line-height: 1;
}

.percentage {
  font-family: 'Oswald', sans-serif;
  font-size: 1.2rem;
  color: var(--tk-olive);
}

.progress-bar-container {
  height: 12px;
  background: #111;
  border: 1px solid var(--tk-border);
  position: relative;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--tk-olive);
  transition: width 0.3s ease-out;
}

.progress-bar.is-done {
  background: var(--tk-orange);
  box-shadow: 0 0 15px rgba(217, 163, 52, 0.5);
}

.progress-shimmer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.05) 50%,
    transparent 100%
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.craft-meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px dashed var(--tk-border);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.meta-label {
  font-size: 0.75rem;
  color: var(--tk-olive);
  font-weight: 700;
}

.meta-value {
  font-size: 0.9rem;
  color: var(--tk-text);
  font-weight: 600;
}

.meta-value.highlight {
  color: var(--tk-orange);
}

.ready-icon {
  color: var(--tk-orange);
  animation: pulse-glow 2s infinite;
}

.settings-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xl);
}
</style>
