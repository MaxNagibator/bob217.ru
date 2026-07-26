import { onMounted, onUnmounted, ref, type Ref } from 'vue'

const HEX = '0123456789abcdef'

const randomHex = (length: number): string =>
  Array.from({ length }, () => HEX[Math.floor(Math.random() * HEX.length)]).join('')

export function useScramble(target: string, delayMs = 0, durationMs = 320): Ref<string> {
  const text = ref(target)

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return text
  }

  let raf = 0
  let timer = 0

  onMounted(() => {
    text.value = randomHex(target.length)
    timer = window.setTimeout(() => {
      const started = performance.now()
      const tick = (now: number): void => {
        const progress = Math.min(1, (now - started) / durationMs)
        const locked = Math.floor(progress * target.length)
        text.value = target.slice(0, locked) + randomHex(target.length - locked)
        if (progress < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }, delayMs)
  })

  onUnmounted(() => {
    window.clearTimeout(timer)
    cancelAnimationFrame(raf)
  })

  return text
}
