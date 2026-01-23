import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

export interface CraftDuration {
  hours: number
  minutes: number
  seconds: number
}

export function useTarkovCraft() {
  const STORAGE_KEY_START = 'tarkov_craft_start_time'
  const STORAGE_KEY_DURATION = 'tarkov_craft_duration'

  const duration = ref<CraftDuration>(
    JSON.parse(
      localStorage.getItem(STORAGE_KEY_DURATION) || '{"hours": 39, "minutes": 0, "seconds": 0}',
    ),
  )

  watch(
    duration,
    (newVal) => {
      localStorage.setItem(STORAGE_KEY_DURATION, JSON.stringify(newVal))
    },
    { deep: true },
  )

  const startTime = ref<number | null>(Number(localStorage.getItem(STORAGE_KEY_START)) || null)
  const now = ref(Date.now())

  const totalDurationMs = computed(() => {
    return (
      ((duration.value.hours || 0) * 3600 +
        (duration.value.minutes || 0) * 60 +
        (duration.value.seconds || 0)) *
      1000
    )
  })

  const isCrafting = computed(() => startTime.value !== null)

  const timeElapsed = computed(() => {
    if (!startTime.value) return 0
    return Math.max(0, now.value - startTime.value)
  })

  const timeRemainingMs = computed(() => {
    if (!startTime.value) return 0
    return Math.max(0, totalDurationMs.value - timeElapsed.value)
  })

  const progress = computed(() => {
    if (!startTime.value) return 0
    if (totalDurationMs.value === 0) return 100
    return Math.min(100, (timeElapsed.value / totalDurationMs.value) * 100)
  })

  const isReady = computed(() => {
    return isCrafting.value && timeRemainingMs.value === 0
  })

  const completionTime = computed(() => {
    if (!startTime.value) return null
    return new Date(startTime.value + totalDurationMs.value)
  })

  function startCraft() {
    startTime.value = Date.now()
    localStorage.setItem(STORAGE_KEY_START, String(startTime.value))
    localStorage.setItem(STORAGE_KEY_DURATION, JSON.stringify(duration.value))
  }

  function resetCraft() {
    startTime.value = null
    localStorage.removeItem(STORAGE_KEY_START)
  }

  function updateDuration(newDuration: CraftDuration) {
    duration.value = { ...newDuration }
  }

  const formattedRemaining = computed(() => {
    const ms = timeRemainingMs.value
    const h = Math.floor(ms / (1000 * 60 * 60))
    const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const s = Math.floor((ms % (1000 * 60)) / 1000)
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  })

  let interval: ReturnType<typeof setInterval>

  onMounted(() => {
    interval = setInterval(() => {
      now.value = Date.now()
    }, 1000)
  })

  onBeforeUnmount(() => {
    clearInterval(interval)
  })

  return {
    duration,
    startTime,
    isCrafting,
    isReady,
    progress,
    timeRemainingMs,
    formattedRemaining,
    completionTime,
    startCraft,
    resetCraft,
    updateDuration,
  }
}
