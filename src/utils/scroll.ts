import type { RouterScrollBehavior } from 'vue-router'

const PAGE_TRANSITION_MS = 300
const HEIGHT_WAIT_MS = 2000

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

const waitForHeight = (top: number): Promise<void> =>
  new Promise((resolve) => {
    const fits = (): boolean =>
      document.documentElement.scrollHeight - window.innerHeight >= Math.floor(top)

    if (fits()) {
      resolve()
      return
    }

    const stop = (): void => {
      observer.disconnect()
      clearTimeout(timer)
      resolve()
    }

    const observer = new ResizeObserver(() => {
      if (fits()) stop()
    })
    const timer = setTimeout(stop, HEIGHT_WAIT_MS)

    observer.observe(document.body)
  })

export const pageScroll: RouterScrollBehavior = async (to, from, saved) => {
  await delay(PAGE_TRANSITION_MS)
  if (!saved) return { top: 0, behavior: 'instant' }
  await waitForHeight(saved.top)
  return { ...saved, behavior: 'instant' }
}
