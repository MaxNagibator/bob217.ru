<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useTarkovTime } from '@/composables/useTarkovTime'
import { Sun, Moon, Info, Terminal } from 'lucide-vue-next'
import TarkovBoot from '@/components/tarkov/TarkovBoot.vue'
import TarkovCard from '@/components/tarkov/TarkovCard.vue'

const { leftZone, rightZone } = useTarkovTime(100)
const isBooting = ref(localStorage.getItem('tarkov_skip_boot') !== 'true')

const skipBootSetting = ref(localStorage.getItem('tarkov_skip_boot') === 'true')

const toggleBootSequence = () => {
  localStorage.setItem('tarkov_skip_boot', String(skipBootSetting.value))
}

const onBootComplete = () => {
  isBooting.value = false
}

const isLeftNearest = computed(() => {
  const left = leftZone.value.terminal
  const right = rightZone.value.terminal

  if (left.isOpen && !right.isOpen) return true
  if (!left.isOpen && right.isOpen) return false

  return left.minutesToEvent <= right.minutesToEvent
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

            <div class="cards-row">
              <TarkovCard
                title="ДОСТУПНО (ЗОНА 1)"
                :variant="leftZone.terminal.isOpen ? 'success' : 'danger'"
                :active="isLeftNearest"
                :subtext="'РЕЖИМ: 22:00 - 04:00'"
              >
                <template #icon>
                  <Terminal :size="20" />
                </template>

                <div class="terminal-hero">
                  <div class="hero-label">{{ leftZone.terminal.nextEventText }}</div>
                  <div class="hero-time">{{ leftZone.terminal.realEventTime }}</div>
                  <div class="hero-countdown">
                    ЧЕРЕЗ
                    <span class="countdown-value">{{ leftZone.terminal.formattedCountdown }}</span>
                  </div>
                </div>

                <template #footer>
                  <div v-if="isLeftNearest" class="badge">БЛИЖАЙШЕЕ ОКНО</div>
                  <div
                    class="status-indicator-mini"
                    :class="{ 'is-open': leftZone.terminal.isOpen }"
                  >
                    {{ leftZone.terminal.statusText }}
                  </div>
                </template>
              </TarkovCard>

              <TarkovCard
                title="ДОСТУПНО (ЗОНА 2)"
                :variant="rightZone.terminal.isOpen ? 'success' : 'danger'"
                :active="!isLeftNearest"
                :subtext="'РЕЖИМ: 22:00 - 04:00'"
              >
                <template #icon>
                  <Terminal :size="20" />
                </template>

                <div class="terminal-hero">
                  <div class="hero-label">{{ rightZone.terminal.nextEventText }}</div>
                  <div class="hero-time">{{ rightZone.terminal.realEventTime }}</div>
                  <div class="hero-countdown">
                    ЧЕРЕЗ
                    <span class="countdown-value">{{ rightZone.terminal.formattedCountdown }}</span>
                  </div>
                </div>

                <template #footer>
                  <div v-if="!isLeftNearest" class="badge">БЛИЖАЙШЕЕ ОКНО</div>
                  <div
                    class="status-indicator-mini"
                    :class="{ 'is-open': rightZone.terminal.isOpen }"
                  >
                    {{ rightZone.terminal.statusText }}
                  </div>
                </template>
              </TarkovCard>
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

            <label class="qol-setting">
              <input type="checkbox" v-model="skipBootSetting" @change="toggleBootSequence" />
              <span class="setting-label">ПРОПУСК ЗАГРУЗКИ (BOOT SEQUENCE)</span>
            </label>
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem 0;
  text-align: center;
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
  margin-bottom: 0.5rem;
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
  gap: 10px;
  cursor: pointer;
  width: fit-content;
  user-select: none;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 600;
  font-size: 0.8rem;
  color: var(--tk-olive);
  transition: color 0.2s;
}

.qol-setting:hover {
  color: var(--tk-orange);
}

.setting-label {
  letter-spacing: 1px;
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
</style>
