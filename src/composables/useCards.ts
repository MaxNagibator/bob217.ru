import { readonly, ref, type DeepReadonly, type Ref } from 'vue'
import type { CardsData } from '@/types/card'
import cardsJson from '@/assets/data/cards.json'

export function useCards(): { cardsData: DeepReadonly<Ref<CardsData>> } {
  const cardsData = ref<CardsData>(cardsJson)

  return { cardsData: readonly(cardsData) }
}
