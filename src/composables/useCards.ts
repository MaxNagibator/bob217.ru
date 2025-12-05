import { onMounted, readonly, ref } from 'vue'
import type { CardsData } from '@/types/card'
import cardsJson from '@/assets/data/cards.json'

export function useCards() {
  const cardsData = ref<CardsData | null>(null)
  const loading = ref(true)
  const error = ref<Error | null>(null)

  const loadCards = async () => {
    loading.value = true
    cardsData.value = cardsJson
    loading.value = false
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
