import { computed, onMounted, onUnmounted, ref, type ComputedRef } from 'vue'

export function useCmdCycle(
  commands: () => readonly string[],
  intervalMs = 5400,
): { current: ComputedRef<string> } {
  const index = ref(0)

  const current = computed(() => {
    const list = commands()
    return list.length ? (list[index.value % list.length] ?? '') : ''
  })

  let timer: number | undefined

  onMounted(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    timer = window.setInterval(() => {
      const list = commands()
      if (document.hidden || list.length < 2) return
      index.value = (index.value + 1) % list.length
    }, intervalMs)
  })

  onUnmounted(() => window.clearInterval(timer))

  return { current }
}
