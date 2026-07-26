export interface ResumeLink {
  url: string
  label: string
}

export interface ResumeEntry {
  id: number
  title: string
  tags: readonly string[]
  description: readonly string[]
  links?: readonly ResumeLink[]
}
