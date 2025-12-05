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
      <div class="error-code">500</div>
      <div class="error-message">Внутренняя ошибка сервера</div>
      <div class="error-details">
        Произошла внутренняя ошибка сервера. Мы уже работаем над решением этой проблемы.
      </div>
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
  max-width: 450px;
  padding: var(--spacing-2xl);
  border-radius: var(--radius-lg);
  background-color: var(--color-bg-secondary);
  box-shadow: var(--shadow-md);
  text-align: center;
  border: 1px solid var(--color-danger-bg);
}

.error-code {
  font-family: var(--font-family-heading);
  font-size: 6rem;
  font-weight: bold;
  line-height: 1;
  margin-bottom: var(--spacing-md);
  color: var(--color-danger);
  text-shadow: 0 0 20px rgba(255, 102, 153, 0.3);
}

.error-message {
  font-size: var(--font-size-xl);
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  color: var(--color-text-primary);
}

.error-details {
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
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
  background-color: var(--color-danger);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 102, 153, 0.4);
}

.error-button:first-child {
  background: var(--gradient-button);
}

.error-button:first-child:hover {
  background: var(--gradient-button-hover);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
</style>
