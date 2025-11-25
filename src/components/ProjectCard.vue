<script lang="ts" setup>
import { ref } from 'vue'
import type { Card } from '@/types/card'
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-vue-next'

interface Props {
  card: Card
  index?: number
}

const props = withDefaults(defineProps<Props>(), {
  index: 0,
})

const isExpanded = ref(false)
const isHovered = ref(false)

const toggleDescription = (): void => {
  isExpanded.value = !isExpanded.value
}

const animationDelay = `${props.index * 0.1}s`
</script>

<template>
  <article
    :class="['card', { expanded: isExpanded, hovered: isHovered }]"
    :style="{ '--animation-delay': animationDelay }"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <a :href="card.link" class="card-image-link" target="_blank" rel="noopener noreferrer">
      <div class="image-wrapper">
        <img :alt="card.title" :src="card.icon" class="card-image" />
        <div class="image-overlay">
          <ExternalLink :size="24" />
        </div>
      </div>
    </a>

    <div class="card-content">
      <header class="card-header">
        <h3 class="card-title">{{ card.title }}</h3>
        <a
          :href="card.link"
          class="external-link"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Открыть проект"
        >
          <ExternalLink :size="18" />
        </a>
      </header>

      <p class="card-description">{{ card.short_description }}</p>

      <button
        class="expand-button"
        :class="{ active: isExpanded }"
        @click="toggleDescription"
        :aria-expanded="isExpanded"
        aria-label="Показать подробности"
      >
        <span class="expand-text">{{ isExpanded ? 'Скрыть' : 'Подробнее' }}</span>
        <ChevronUp v-if="isExpanded" :size="18" class="expand-icon" />
        <ChevronDown v-else :size="18" class="expand-icon" />
      </button>

      <Transition name="slide-fade">
        <div v-if="isExpanded" class="details">
          <p v-for="(paragraph, idx) in card.description" :key="idx" class="details-text">
            {{ paragraph }}
          </p>
        </div>
      </Transition>
    </div>

    <div class="card-glow"></div>
  </article>
</template>

<style scoped>
.card {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  background-color: var(--color-bg-secondary);
  border: 1px solid transparent;
  overflow: hidden;
  break-inside: avoid;
  animation: cardEntrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  animation-delay: var(--animation-delay, 0s);
}

@keyframes cardEntrance {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.card-glow {
  position: absolute;
  inset: -1px;
  border-radius: var(--radius-lg);
  background: linear-gradient(
    135deg,
    transparent 0%,
    transparent 40%,
    var(--color-accent) 50%,
    transparent 60%,
    transparent 100%
  );
  background-size: 300% 300%;
  opacity: 0;
  z-index: -1;
  transition: opacity 0.4s ease;
}

.card.hovered .card-glow {
  opacity: 1;
  animation: glowMove 2s linear infinite;
}

@keyframes glowMove {
  0% {
    background-position: 0% 0%;
  }
  50% {
    background-position: 100% 100%;
  }
  100% {
    background-position: 0% 0%;
  }
}

.card.hovered {
  border-color: rgba(255, 204, 0, 0.3);
  box-shadow:
    0 10px 40px -10px rgba(0, 0, 0, 0.5),
    0 0 20px -5px rgba(255, 204, 0, 0.15);
  transform: translateY(-4px);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card.expanded {
  border-color: var(--color-accent);
}

.card-image-link {
  flex-shrink: 0;
}

.image-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.image-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  color: var(--color-text-primary);
  opacity: 0;
  transform: scale(1.2);
  transition: all 0.3s ease;
}

.card.hovered .card-image {
  transform: scale(1.1);
}

.card.hovered .image-overlay {
  opacity: 1;
  transform: scale(1);
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  min-width: 0;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.card-title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  transition: color 0.3s ease;
}

.card.hovered .card-title {
  color: var(--color-accent);
}

.external-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: var(--color-text-muted);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-sm);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.external-link:hover {
  color: var(--color-accent);
  background: rgba(255, 204, 0, 0.15);
  transform: rotate(-12deg) scale(1.1);
}

.card-description {
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
  margin: 0;
}

.expand-button {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs);
  font-weight: 500;
  color: var(--color-link);
  background: transparent;
  border: 1px solid var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: flex-start;
  margin-top: var(--spacing-xs);
}

.expand-button:hover {
  background: rgba(0, 188, 212, 0.1);
  border-color: var(--color-link);
}

.expand-button.active {
  color: var(--color-accent);
  border-color: var(--color-accent);
  background: rgba(255, 204, 0, 0.1);
}

.expand-icon {
  transition: transform 0.3s ease;
}

.expand-button:hover .expand-icon {
  animation: bounceY 0.5s ease infinite;
}

@keyframes bounceY {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(2px);
  }
}

.details {
  padding-top: var(--spacing-md);
  margin-top: var(--spacing-sm);
  border-top: 1px solid var(--color-bg-tertiary);
}

.details-text {
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-sm) 0;
}

.details-text:last-child {
  margin-bottom: 0;
}

.slide-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-fade-leave-active {
  transition: all 0.25s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .image-wrapper {
    width: 80px;
    height: 80px;
  }

  .card-header {
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .external-link {
    display: none;
  }

  .expand-button {
    align-self: center;
  }

  .card-content {
    align-items: center;
  }
}
</style>
