<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ArrowUp } from 'lucide-vue-next'

const SCROLL_THRESHOLD = 300

const isVisible = ref(false)

const handleScroll = (): void => {
  isVisible.value = window.scrollY > SCROLL_THRESHOLD
}

const scrollToTop = (): void => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <Transition name="fade-slide">
    <button
      v-if="isVisible"
      class="scroll-to-top"
      @click="scrollToTop"
      aria-label="Прокрутить наверх"
    >
      <ArrowUp class="arrow" :size="24" />
    </button>
  </Transition>
</template>

<style scoped>
.scroll-to-top {
  position: fixed;
  bottom: 30px;
  left: 5%;
  z-index: var(--z-fixed);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  padding: 0;
  background: var(--color-bg-secondary);
  border: 2px solid var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-md);
  transform: translateX(-50%);
}

.scroll-to-top:hover {
  background: var(--color-accent);
  border-color: var(--color-accent);
  transform: translate(-50%, -4px);
  box-shadow: var(--shadow-lg), var(--shadow-glow);
}

.scroll-to-top:active {
  transform: translate(-50%, -2px);
}

.arrow {
  color: var(--color-text-primary);
  transition: color var(--transition-fast);
}

.scroll-to-top:hover .arrow {
  color: var(--color-bg-primary);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all var(--transition-base);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}

@media (max-width: 768px) {
  .scroll-to-top {
    bottom: 20px;
    left: 8%;
    width: 40px;
    height: 40px;
  }
}
</style>
