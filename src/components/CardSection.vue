<script lang="ts" setup>
import type { Card } from '@/types/card'
import ProjectCard from './ProjectCard.vue'

interface Props {
  title: string
  cards: readonly Card[]
}

defineProps<Props>()
</script>

<template>
  <h2>{{ title }}</h2>
  <div class="section-container">
    <ProjectCard
      v-for="card in cards"
      :key="card.title"
      v-memo="[card.title, card.description]"
      :card="card"
    />
  </div>
</template>

<style scoped>
.section-container {
  display: grid;
  margin-bottom: 2rem;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  grid-auto-rows: minmax(100px, auto);
  gap: 1rem;
}

@media (max-width: 768px) {
  .section-container {
    grid-template-columns: 1fr;
  }
}
</style>
