export interface Card {
  title: string
  icon: string
  short_description: string
  description: readonly string[]
  link: string
}

export interface CardsData {
  [category: string]: readonly Card[]
}
