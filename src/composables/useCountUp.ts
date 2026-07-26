import { onUnmounted, ref, watch, type Ref } from 'vue'

export function useCountUp(
  source: () => number | null,
  delayMs = 0,
  durationMs = 700,
): Ref<number | null> {
  const shown = ref<number | null>(null)
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  let raf = 0
  let timer = 0

  const stop = (): void => {
    window.clearTimeout(timer)
    cancelAnimationFrame(raf)
  }

  const run = (to: number): void => {
    stop()
    if (reduced) {
      shown.value = to
      return
    }
    shown.value = 0
    timer = window.setTimeout(() => {
      const started = performance.now()
      const tick = (now: number): void => {
        const progress = Math.min(1, (now - started) / durationMs)
        shown.value = Math.round(to * (1 - Math.pow(1 - progress, 3)))
        if (progress < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }, delayMs)
  }

  watch(
    source,
    (value) => {
      if (value === null) {
        stop()
        shown.value = null
      } else {
        run(value)
      }
    },
    { immediate: true },
  )

  onUnmounted(stop)

  return shown
}
