<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, type ComponentPublicInstance } from 'vue'
import type { Card } from '@/types/card'
import ProjectCard from './ProjectCard.vue'

interface Props {
  title: string
  cards: readonly Card[]
}

const props = defineProps<Props>()

const groupRef = ref<ComponentPublicInstance | null>(null)
const expandedIndex = ref<number | null>(null)
const cols = ref(1)

const updateCols = (): void => {
  const grid = groupRef.value?.$el as HTMLElement | undefined
  if (grid) {
    cols.value = getComputedStyle(grid).gridTemplateColumns.split(' ').length
  }
}

let observer: ResizeObserver | undefined

onMounted(() => {
  const grid = groupRef.value?.$el as HTMLElement | undefined
  if (grid) {
    observer = new ResizeObserver(updateCols)
    observer.observe(grid)
  }
  updateCols()
})

onBeforeUnmount(() => {
  observer?.disconnect()
})

const toggle = (index: number): void => {
  expandedIndex.value = expandedIndex.value === index ? null : index
}

const expandedCard = computed(() =>
  expandedIndex.value === null ? null : props.cards[expandedIndex.value],
)

const detailRow = computed(() =>
  expandedIndex.value === null ? 0 : Math.floor(expandedIndex.value / cols.value) + 2,
)
</script>

<template>
  <section class="card-section">
    <h2 class="section-title"><span class="hash">##</span> {{ title }}</h2>
    <TransitionGroup ref="groupRef" tag="div" name="cards" class="section-container">
      <ProjectCard
        v-for="(card, index) in cards"
        :key="card.title"
        :card="card"
        :index="index"
        :expanded="expandedIndex === index"
        @toggle="toggle(index)"
      />
      <div
        v-if="expandedCard"
        :key="`detail-${expandedCard.title}`"
        class="detail-row"
        :style="{ gridRow: detailRow }"
      >
        <div class="detail-inner">
          <p v-for="(paragraph, idx) in expandedCard.description" :key="idx">{{ paragraph }}</p>
        </div>
      </div>
    </TransitionGroup>
  </section>
</template>

<style scoped>
.section-title {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-sm);
}

.section-title .hash {
  font-family: var(--font-family-mono);
  font-size: 0.8em;
  color: var(--color-accent);
}

.section-container {
  position: relative;
  display: grid;
  margin-bottom: var(--spacing-xl);
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-md);
}

.detail-row {
  grid-column: 1 / -1;
}

.detail-inner {
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.detail-inner p {
  max-width: 70ch;
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
}

.detail-inner p:last-child {
  margin-bottom: 0;
}

.cards-move {
  transition: transform var(--transition-base);
}

.cards-enter-active {
  transition:
    opacity var(--transition-base),
    transform var(--transition-base);
}

.cards-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}

.cards-leave-active {
  position: absolute;
  transition: opacity var(--transition-fast);
}

.cards-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .section-container {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cards-move,
  .cards-enter-active,
  .cards-leave-active {
    transition: none;
  }
}
</style>
