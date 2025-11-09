import { onMounted, readonly, ref } from 'vue'
import type { CardsData } from '@/types/card'

export function useCards() {
  const cardsData = ref<CardsData | null>(null)
  const loading = ref(true)
  const error = ref<Error | null>(null)

  const loadCards = async () => {
    try {
      loading.value = true
      error.value = null

      const response = await fetch('/src/assets/data/cards.json')
      if (!response.ok) {
        throw new Error(`Failed to load cards: ${response.statusText}`)
      }

      cardsData.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Unknown error occurred')
      console.error('Error loading cards:', err)
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadCards()
  })

  return {
    cardsData: readonly(cardsData),
    loading: readonly(loading),
    error: readonly(error),
    loadCards,
  }
}
