<script lang="ts" setup>
import { computed } from 'vue'
import type { Card } from '@/types/card'
import { ExternalLink } from 'lucide-vue-next'

interface Props {
  card: Card
  index?: number
  expanded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  index: 0,
  expanded: false,
})

const emit = defineEmits<{
  toggle: []
}>()

const iconSrc = computed(() => import.meta.env.BASE_URL + props.card.icon.replace(/^\//, ''))

const linkLabel = computed(() => {
  try {
    const url = new URL(props.card.link)
    return url.hostname.replace(/^www\./, '') + url.pathname.replace(/\/$/, '')
  } catch {
    return props.card.link
  }
})
</script>

<template>
  <article :class="['card', { expanded }]" :style="{ '--i': index }">
    <header class="card-head">
      <img :src="iconSrc" alt="" class="card-icon" />
      <h3 class="card-title">
        <a :href="card.link" target="_blank" rel="noopener noreferrer">{{ card.title }}</a>
      </h3>
      <ExternalLink class="card-ext" :size="16" aria-hidden="true" />
    </header>

    <p class="card-desc">{{ card.short_description }}</p>

    <a :href="card.link" class="card-link" target="_blank" rel="noopener noreferrer">
      {{ linkLabel }}
    </a>

    <button
      class="card-more"
      :aria-expanded="expanded"
      aria-label="Показать подробности"
      @click="emit('toggle')"
    >
      {{ expanded ? '- скрыть' : '+ подробнее' }}
    </button>
  </article>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  transition:
    border-color var(--transition-fast),
    transform var(--transition-fast);
  animation: card-in 0.35s ease backwards;
  animation-delay: min(calc(var(--i) * 45ms), 600ms);
}

.card:hover {
  border-color: rgba(255, 204, 0, 0.4);
  transform: translateY(-2px);
}

.card.expanded {
  border-color: rgba(255, 204, 0, 0.4);
}

@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}

.card-head {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 0;
}

.card-icon {
  width: 36px;
  height: 36px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.card-title {
  margin: 0;
  font-family: var(--font-family-heading);
  font-size: var(--font-size-base);
  font-weight: 600;
  min-width: 0;
}

.card-title a {
  color: var(--color-text-primary);
  transition: color var(--transition-fast);
}

.card:hover .card-title a {
  color: var(--color-accent);
}

.card-ext {
  margin-left: auto;
  flex-shrink: 0;
  color: var(--color-text-muted);
  transition: color var(--transition-fast);
}

.card:hover .card-ext {
  color: var(--color-accent);
}

.card-desc {
  margin: 0;
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
}

.card-link {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  color: var(--color-link);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-link:hover {
  color: var(--color-link-hover);
  text-decoration: underline;
}

.card-more {
  margin-top: auto;
  align-self: flex-start;
  padding: 0;
  background: none;
  border: none;
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.card-more:hover {
  color: var(--color-accent);
}

@media (prefers-reduced-motion: reduce) {
  .card {
    animation: none;
  }

  .card:hover {
    transform: none;
  }
}
</style>
