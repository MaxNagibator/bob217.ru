import { ref } from 'vue'

interface UseClipboardReturn {
  copied: ReturnType<typeof ref<boolean>>
  copy: (text: string) => Promise<void>
}

export function useClipboard(timeout = 2000): UseClipboardReturn {
  const copied = ref(false)
  let timeoutId: number | undefined

  const copy = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text)
      copied.value = true

      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = window.setTimeout(() => {
        copied.value = false
      }, timeout)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      copied.value = false
    }
  }

  return {
    copied,
    copy,
  }
}
