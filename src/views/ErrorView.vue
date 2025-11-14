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
  color: #ff6699;
}

.error-message {
  font-size: 1.125rem;
  margin-bottom: 1rem;
  text-align: center;
}

.error-details {
  font-size: 1rem;
  margin-bottom: 2rem;
  text-align: center;
  color: #ccc;
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
  color: #fff;
  background-color: #ff6699;
}
</style>
