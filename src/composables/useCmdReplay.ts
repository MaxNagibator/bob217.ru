import { computed, onUnmounted, ref } from 'vue'

type ReplayPhase = 'idle' | 'clearing' | 'printing'

export function useCmdReplay(totalDelayMs: () => number) {
  const phase = ref<ReplayPhase>('idle')
  const phaseClass = computed(() => (phase.value === 'idle' ? '' : `cmd-${phase.value}`))
  let timer: number | undefined

  const start = (): void => {
    window.clearTimeout(timer)
    phase.value = 'clearing'
  }

  const print = (): void => {
    phase.value = 'printing'
    timer = window.setTimeout(() => {
      phase.value = 'idle'
    }, totalDelayMs() + 450)
  }

  onUnmounted(() => window.clearTimeout(timer))

  return { phaseClass, start, print }
}
