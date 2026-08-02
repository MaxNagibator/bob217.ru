<script lang="ts" setup>
import { computed } from 'vue'
import type { ShortlogRow } from '@/composables/useShortlog'

const TOP_REPOS = 3

const props = defineProps<{
  row: ShortlogRow
  index: number
}>()

const shown = computed(() => props.row.author.repos.slice(0, TOP_REPOS))
const rest = computed(() => props.row.author.repos.length - shown.value.length)
</script>

<template>
  <li class="row" :style="{ '--i': index }">
    <img class="face" :src="row.author.avatar" :alt="`Аватар ${row.author.login}`" loading="lazy" />

    <div class="body">
      <p class="who">
        <a class="login" :href="row.author.url" target="_blank" rel="noopener noreferrer">{{
          row.author.login
        }}</a>
        <span v-if="row.author.owner" class="tag">owner</span>
      </p>

      <p class="repos">
        <span v-for="(repo, i) in shown" :key="repo" class="repo"
          >{{ repo }}<template v-if="i < shown.length - 1">,</template></span
        >
        <span v-if="rest > 0" class="more">+{{ rest }}</span>
      </p>
    </div>

    <div class="tail">
      <p class="when">{{ row.age }}</p>
      <p class="count">{{ row.author.merged }} PR</p>
    </div>
  </li>
</template>

<style scoped>
.row {
  --trail: calc(200ms + min(calc(var(--i) * 40ms), 500ms));
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) auto;
  gap: var(--spacing-sm) var(--spacing-md);
  align-items: start;
  padding: var(--spacing-sm) 0;
  animation: row-in 0.45s cubic-bezier(0.16, 1, 0.3, 1) backwards;
  animation-delay: var(--trail);
}

@keyframes row-in {
  from {
    opacity: 0;
    transform: translateX(-14px);
  }
}

.row + .row {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.face {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--color-bg-tertiary);
  filter: grayscale(1);
  transition:
    filter var(--transition-fast),
    transform var(--transition-fast);
}

.row:hover .face {
  filter: grayscale(0);
  transform: scale(1.08);
}

.body {
  min-width: 0;
}

.who {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-sm);
  margin: 0;
  line-height: 1.5;
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
}

.login {
  color: var(--color-link);
  text-decoration: underline dotted;
  text-underline-offset: 4px;
  text-decoration-color: rgba(0, 188, 212, 0.4);
}

.login:hover {
  color: var(--color-link-hover);
  text-decoration-color: currentcolor;
}

.tag {
  padding: 0 var(--spacing-sm);
  font-size: var(--font-size-xs);
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  border: 1px solid var(--color-bg-tertiary);
  border-radius: var(--radius-full);
}

.repos {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs) var(--spacing-sm);
  margin: var(--spacing-xs) 0 0;
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.repo {
  color: var(--color-text-secondary);
}

.tail {
  text-align: right;
  font-family: var(--font-family-mono);
  font-variant-numeric: tabular-nums;
}

.when {
  margin: 0;
  line-height: 1.5;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.count {
  margin: var(--spacing-xs) 0 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

@media (max-width: 720px) {
  .row {
    gap: var(--spacing-xs) var(--spacing-sm);
  }

  .when {
    font-size: var(--font-size-xs);
  }
}

@media (prefers-reduced-motion: reduce) {
  .row {
    animation: none;
  }
}
</style>
