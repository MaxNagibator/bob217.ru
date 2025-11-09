<script lang="ts" setup>
import { useCards } from '@/composables/useCards'
import InfoBlock from '@/components/InfoBlock.vue'
import CardSection from '@/components/CardSection.vue'
import ErrorBoundary from '@/components/ErrorBoundary.vue'

const { cardsData, loading, error } = useCards()
</script>

<template>
  <ErrorBoundary>
    <div class="home">
      <h1>Привет, сладенький ^_^</h1>

      <InfoBlock />

      <div v-if="loading" class="loading">Загрузка...</div>
      <div v-else-if="error" class="error">Ошибка: {{ error.message }}</div>
      <div v-else-if="cardsData">
        <CardSection
          v-for="(cards, section) in cardsData"
          :key="section"
          :cards="cards"
          :title="String(section)"
        />
      </div>
    </div>
  </ErrorBoundary>
</template>

<style scoped>
.home {
  width: 100%;
}

.loading,
.error {
  padding: 2rem;
  text-align: center;
  color: #ccc;
}

.error {
  color: #ff6699;
}
</style>
