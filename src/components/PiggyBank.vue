<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const JUMP_ANIMATION_DURATION = 1000
const MESSAGE_DISPLAY_DURATION = 2000
const MIN_JUMP_INTERVAL = 3000
const MAX_JUMP_INTERVAL = 5000
const INITIAL_JUMP_DELAY = 3000
const GUILT_MESSAGE_DURATION = 2000
const SHAKE_DURATION = 800

type PiggyState = 'idle' | 'jumping' | 'hovered' | 'guilt'

const router = useRouter()
const state = ref<PiggyState>('idle')
const currentMessage = ref('')
let jumpInterval: number | undefined
let guiltTimeout: number | undefined
let shakeTimeout: number | undefined
let jumpAnimationTimeout: number | undefined

const messages = [
  '🥺 Покорми меня!',
  '💰 Хрю-хрю, донат!',
  '🪙 Дай монетку!',
  '❤️ Поддержи создателя!',
  '🍕 Накорми "дот нет помойку"!',
  '✨ Брось денежку в "лучик света"!',
  '🎮 Игровая дрисня требует жертв!',
  '🎬 Фильмы с максимчиком не снимутся сами!',
  '🥀 Без доната я засохну!',
  '🪙 Кинь бобкоинов в копилку!',
  '💀 Помоги каналу не сдохнуть!',
  '₿ Крипта тоже прокатит!',
]

const guiltMessages = [
  '😢 Ты серьезно не нажал?',
  '💔 Так вот ты какой, жмот!',
  '👀 Я запомнила тебя...',
  '😔 Совесть не мучает?',
  '💀 Каналы умирают из-за таких!',
  '😤 Ладно, я не обижаюсь... (обижаюсь)',
  '⚖️ Твоя карма уже в минусе!',
  '😭 Максимчик плачет по ночам...',
  '🗑️ Дот нет помойка стала еще помойнее!',
  '🥺 Хотя бы пожалей... нет?',
  '💢 Ну ты и жестокий человек!',
  '📉 Криптокошелек пустеет...',
  '🎮 Игровая дрисня осталась без патчей!',
  '🕯️ Лучик света погас навсегда...',
  '📊 Бобкоины стоили дешевле...',
  '🐷💨 Я тебя не забуду, скупердяй!',
]

const isJumping = ref(false)
const isShaking = ref(false)

const pickRandomMessage = (source: readonly string[]): string => {
  if (source.length === 0) {
    return ''
  }

  const index = Math.floor(Math.random() * source.length)
  return source[index] ?? ''
}

const showMessage = computed(() => {
  return state.value === 'jumping' || state.value === 'hovered' || state.value === 'guilt'
})

const clearAllTimeouts = (): void => {
  if (guiltTimeout) clearTimeout(guiltTimeout)
  if (shakeTimeout) clearTimeout(shakeTimeout)
  if (jumpAnimationTimeout) clearTimeout(jumpAnimationTimeout)
}

const startJumping = (): void => {
  if (state.value === 'hovered' || state.value === 'guilt') return

  state.value = 'jumping'
  isJumping.value = true
  currentMessage.value = pickRandomMessage(messages)

  jumpAnimationTimeout = window.setTimeout(() => {
    isJumping.value = false
    jumpAnimationTimeout = window.setTimeout(() => {
      if (state.value === 'jumping') {
        state.value = 'idle'
      }
    }, MESSAGE_DISPLAY_DURATION)
  }, JUMP_ANIMATION_DURATION)
}

const handlePiggyMouseEnter = (): void => {
  clearAllTimeouts()
  if (state.value != 'jumping') currentMessage.value = pickRandomMessage(messages)

  state.value = 'hovered'
  isJumping.value = false
  isShaking.value = false
}

const handlePiggyMouseLeave = (): void => {
  clearAllTimeouts()
  state.value = 'guilt'
  isShaking.value = true
  currentMessage.value = pickRandomMessage(guiltMessages)

  shakeTimeout = window.setTimeout(() => {
    isShaking.value = false
  }, SHAKE_DURATION)

  guiltTimeout = window.setTimeout(() => {
    if (state.value === 'guilt') state.value = 'idle'
  }, GUILT_MESSAGE_DURATION)
}

const handleClick = (): void => {
  router.push('/donate')
}

onMounted(() => {
  const scheduleNextJump = (): void => {
    const delay = Math.random() * (MAX_JUMP_INTERVAL - MIN_JUMP_INTERVAL) + MIN_JUMP_INTERVAL
    jumpInterval = window.setTimeout(() => {
      startJumping()
      scheduleNextJump()
    }, delay)
  }

  setTimeout(() => {
    startJumping()
    scheduleNextJump()
  }, INITIAL_JUMP_DELAY)
})

onBeforeUnmount(() => {
  if (jumpInterval) clearTimeout(jumpInterval)
  clearAllTimeouts()
})
</script>

<template>
  <div class="piggy-bank-container">
    <div class="piggy-bank">
      <div
        :class="['piggy', { jumping: isJumping, shaking: isShaking }]"
        @click="handleClick"
        @mouseenter="handlePiggyMouseEnter"
        @mouseleave="handlePiggyMouseLeave"
        role="button"
        tabindex="0"
        @keydown.enter="handleClick"
        @keydown.space="handleClick"
      >
        🐷
      </div>
      <Transition name="message">
        <div v-if="showMessage" class="message">
          {{ currentMessage }}
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.piggy-bank-container {
  position: fixed;
  bottom: var(--spacing-lg);
  right: var(--spacing-lg);
  z-index: var(--z-fixed);
}

.piggy-bank {
  position: relative;
}

.piggy {
  font-size: 64px;
  user-select: none;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  cursor: pointer;
  transition: transform var(--transition-fast);
  display: inline-block;
}

.piggy:hover:not(.jumping):not(.shaking) {
  transform: scale(1.1);
}

.piggy:active:not(.jumping):not(.shaking) {
  transform: scale(0.95);
}

.message {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: var(--spacing-sm);
  background: rgba(0, 0, 0, 0.9);
  color: var(--color-text-primary);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  white-space: nowrap;
  font-size: var(--font-size-sm);
  font-weight: 500;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-bg-tertiary);
}

.message::after {
  content: '';
  position: absolute;
  top: 100%;
  right: 20px;
  border: 6px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.9);
}

.jumping {
  animation: jump 1s ease-in-out;
  transition: none;
}

.shaking {
  animation: shake 0.8s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  transition: none;
}

@keyframes jump {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  10% {
    transform: translateY(-30px) rotate(-5deg);
  }
  20% {
    transform: translateY(0) rotate(0deg);
  }
  30% {
    transform: translateY(-40px) rotate(5deg);
  }
  40% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-35px) rotate(-3deg);
  }
  60% {
    transform: translateY(0) rotate(0deg);
  }
  70% {
    transform: translateY(-20px) rotate(3deg);
  }
  80% {
    transform: translateY(0) rotate(0deg);
  }
  90% {
    transform: translateY(-10px) rotate(-2deg);
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0) rotate(0deg);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-10px) rotate(-8deg);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(10px) rotate(8deg);
  }
  95% {
    transform: translateX(-5px) rotate(-4deg);
  }
}

.message-enter-active,
.message-leave-active {
  transition: all var(--transition-base);
}

.message-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.message-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .piggy-bank-container {
    bottom: var(--spacing-md);
    right: var(--spacing-md);
  }

  .piggy {
    font-size: 48px;
  }

  .message {
    font-size: var(--font-size-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
  }
}
</style>
