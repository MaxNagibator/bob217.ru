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
      <header class="home-header">
        <p class="cmd"><span class="cmd-prompt">$</span> cat README.md</p>
        <h1>Привет, сладенький ^_^</h1>
        <p class="home-subtitle">
          Чем мы тут занимаемся, примерно в 18:00 МСК начинаем.
          <a href="https://t.me/@druzhok_kruzhok_bot" target="_blank" rel="noopener noreferrer">
            Уведомления тут в телеге
          </a>
        </p>
      </header>

      <InfoBlock />

      <div v-if="loading" class="loading-container">
        <LoadingSkeleton :count="4" variant="card" />
      </div>

      <div v-else-if="error" class="error-container" role="alert">
        <p class="error-line"><span class="error-fatal">fatal:</span> {{ error.message }}</p>
        <button class="retry-button" @click="retry">
          <span class="cmd-prompt">$</span> повторить
        </button>
      </div>

      <div v-else-if="cardsData">
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

.home-header {
  padding-top: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
}

.home-header h1 {
  margin: 0;
}

.cmd {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  letter-spacing: 0.03em;
  margin: 0 0 var(--spacing-sm) 0;
}

.cmd-prompt {
  color: var(--color-accent);
}

.home-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  text-align: center;
  margin: 0;
}

.loading-container {
  padding: var(--spacing-xl);
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  margin: var(--spacing-xl) 0;
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-md);
  font-family: var(--font-family-mono);
}

.error-line {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  word-break: break-word;
}

.error-fatal {
  color: var(--color-danger);
  font-weight: 700;
}

.retry-button {
  padding: var(--spacing-sm) var(--spacing-md);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  background: transparent;
  border: 1px solid var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.retry-button:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
}

@media (max-width: 768px) {
  .home {
    padding: 0 var(--spacing-md);
  }
}
</style>
