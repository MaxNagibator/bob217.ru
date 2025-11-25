<script lang="ts" setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="error-page">
    <div class="error-container">
      <div class="error-code">404</div>
      <div class="error-message">Страница не найдена</div>
      <div class="error-buttons">
        <button class="error-button" @click="goBack">Вернуться назад</button>
        <button class="error-button" @click="goHome">На главную</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-page {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
  padding: var(--spacing-xl);
}

.error-container {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  max-width: 400px;
  padding: var(--spacing-2xl);
  border-radius: var(--radius-lg);
  background-color: var(--color-bg-secondary);
  box-shadow: var(--shadow-md);
  text-align: center;
}

.error-code {
  font-family: var(--font-family-heading);
  font-size: 6rem;
  font-weight: bold;
  line-height: 1;
  margin-bottom: var(--spacing-md);
  background: var(--gradient-primary);
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient-shift 3s ease infinite;
}

@keyframes gradient-shift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.error-message {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-xl);
  color: var(--color-text-secondary);
}

.error-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--spacing-md);
}

.error-button {
  font-size: var(--font-size-base);
  font-weight: 500;
  padding: var(--spacing-md) var(--spacing-xl);
  cursor: pointer;
  transition: all var(--transition-base);
  color: var(--color-text-primary);
  border: none;
  border-radius: var(--radius-md);
  background-color: var(--color-bg-tertiary);
}

.error-button:hover {
  color: var(--color-bg-primary);
  background-color: var(--color-accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow);
}

.error-button:first-child {
  background: var(--gradient-button);
}

.error-button:first-child:hover {
  background: var(--gradient-button-hover);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
</style>
