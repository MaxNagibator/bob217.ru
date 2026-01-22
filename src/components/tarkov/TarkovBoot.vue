<script setup lang="ts">
import { ref, onMounted } from 'vue'

const emit = defineEmits<{
  (e: 'ready'): void
}>()

const lines = ref<string[]>([])
const isComplete = ref(false)

const bootText = [
  'INITIALIZING TERRAGROUP SECURE CONNECTION...',
  'VERIFYING ENCRYPTION KEYS... [OK]',
  'ESTABLISHING SATELLITE UPLINK... [OK]',
  'SYNCING WITH NORVINSK REGION SERVERS... [OK]',
  'LOADING TEMPORAL DATA STREAMS... [OK]',
  'DECODING SIGNAL... 100%',
  'SYSTEM READY.',
]

onMounted(async () => {
  for (const line of bootText) {
    await new Promise((r) => setTimeout(r, Math.random() * 300 + 100))
    lines.value.push(line)
  }
  await new Promise((r) => setTimeout(r, 800))
  isComplete.value = true
  emit('ready')
})
</script>

<template>
  <div v-if="!isComplete" class="boot-screen">
    <div class="boot-container">
      <div v-for="(line, index) in lines" :key="index" class="boot-line">
        <span class="prefix">&gt;</span> {{ line }}
      </div>
      <div class="cursor-line">
        <span class="prefix">&gt;</span> <span class="typing-cursor">_</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.boot-screen {
  position: absolute;
  inset: 0;
  background-color: #000;
  z-index: 100;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 40px;
  font-family: 'Consolas', 'Monaco', monospace;
  color: var(--tk-olive, #5a633a);
  overflow: hidden;
}

.boot-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
  max-width: 800px;
}

.boot-line {
  font-size: 1.2rem;
  letter-spacing: 1px;
  animation: fadeIn 0.1s ease-out;
}

.prefix {
  color: var(--tk-orange, #d9a334);
  margin-right: 10px;
}

.typing-cursor {
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
