import { onUnmounted, ref } from 'vue'

const SAFETY_MS = 2600

export function useCmdRun() {
  const runKey = ref(0)
  const running = ref(false)
  let timer: number | undefined

  const finish = (): void => {
    window.clearTimeout(timer)
    running.value = false
    runKey.value += 1
  }

  const begin = (): void => {
    window.clearTimeout(timer)
    running.value = true
    timer = window.setTimeout(finish, SAFETY_MS)
  }

  onUnmounted(() => window.clearTimeout(timer))

  return { runKey, running, begin, finish }
}
