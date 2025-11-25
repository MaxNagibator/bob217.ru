<script lang="ts" setup>
import { useCards } from '@/composables/useCards'
import InfoBlock from '@/components/InfoBlock.vue'
import CardSection from '@/components/CardSection.vue'
import ErrorBoundary from '@/components/ErrorBoundary.vue'
import PiggyBank from '@/components/PiggyBank.vue'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'

const { cardsData, loading, error } = useCards()

const retry = (): void => {
  window.location.reload()
}
</script>

<template>
  <ErrorBoundary>
    <div class="home">
      <h1>Привет, сладенький ^_^</h1>

      <InfoBlock />

      <div v-if="loading" class="loading-container">
        <LoadingSkeleton :count="4" variant="card" />
      </div>

      <div v-else-if="error" class="error-container">
        <span class="error-icon">⚠️</span>
        <p class="error-message">{{ error.message }}</p>
        <button class="retry-button" @click="retry">Попробовать снова</button>
      </div>

      <div v-else-if="cardsData" class="cards-container">
        <CardSection
          v-for="(cards, section) in cardsData"
          :key="section"
          :cards="cards"
          :title="String(section)"
        />
      </div>
    </div>

    <PiggyBank />
  </ErrorBoundary>
</template>

<style scoped>
.home {
  width: 100%;
  max-width: var(--max-width-content);
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.loading-container {
  padding: var(--spacing-xl);
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-2xl);
  margin: var(--spacing-xl) 0;
  background: var(--color-danger-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-danger);
  text-align: center;
}

.error-icon {
  font-size: 3rem;
}

.error-message {
  color: var(--color-danger);
  font-size: var(--font-size-base);
  margin: 0;
}

.retry-button {
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
  background: var(--color-danger);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.retry-button:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.cards-container {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .home {
    padding: 0 var(--spacing-md);
  }
}
</style>
