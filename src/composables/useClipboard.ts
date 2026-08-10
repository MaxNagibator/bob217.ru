import { ref, type Ref } from 'vue'

interface UseClipboardReturn {
  copied: Ref<boolean>
  failed: Ref<boolean>
  copy: (text: string) => Promise<void>
}

export function useClipboard(timeout = 2000): UseClipboardReturn {
  const copied = ref(false)
  const failed = ref(false)
  let timeoutId: number | undefined

  const copy = async (text: string): Promise<void> => {
    window.clearTimeout(timeoutId)
    try {
      await navigator.clipboard.writeText(text)
      copied.value = true
      failed.value = false
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      copied.value = false
      failed.value = true
    }

    timeoutId = window.setTimeout(() => {
      copied.value = false
      failed.value = false
    }, timeout)
  }

  return {
    copied,
    failed,
    copy,
  }
}
