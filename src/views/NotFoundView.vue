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
  padding: 2rem;
}

.error-container {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  max-width: 400px;
  padding: 2rem;
  border-radius: 10px;
  background-color: #333;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
}

.error-code {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #ffcc00;
}

.error-message {
  font-size: 1.125rem;
  margin-bottom: 2rem;
  text-align: center;
}

.error-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.error-button {
  font-size: 1rem;
  padding: 1rem 2rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  color: #fff;
  border: none;
  border-radius: 10px;
  background-color: #444;
}

.error-button:hover {
  color: #212121;
  background-color: #ffcc00;
}
</style>
