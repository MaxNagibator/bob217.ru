<script lang="ts" setup>
import { onErrorCaptured, ref } from 'vue'

const error = ref<Error | null>(null)

const retry = () => {
  error.value = null
  window.location.reload()
}

onErrorCaptured((err: Error) => {
  error.value = err
  console.error('Error boundary caught:', err)
  return false
})
</script>

<template>
  <div>
    <div v-if="error" class="error-boundary">
      <div class="error-content">
        <h2>Что-то пошло не так</h2>
        <p class="error-message">{{ error.message }}</p>
        <button class="retry-button" @click="retry">Попробовать снова</button>
      </div>
    </div>
    <slot v-else />
  </div>
</template>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 2rem;
}

.error-content {
  max-width: 500px;
  padding: 2.5rem;
  text-align: center;
  border-radius: 10px;
  background-color: #333;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
}

.error-content h2 {
  margin-bottom: 1.5rem;
  color: #ff6699;
}

.error-message {
  margin-bottom: 2rem;
  color: #ccc;
}

.retry-button {
  font-size: 1rem;
  padding: 1rem 2rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  color: #fff;
  border: none;
  border-radius: 10px;
  background-color: #444;
}

.retry-button:hover {
  color: #212121;
  background-color: #ffcc00;
}
</style>
