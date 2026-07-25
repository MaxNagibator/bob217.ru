<script lang="ts" setup>
import { computed } from 'vue'
import { langColor, LANG_SHORT, type Repo } from '@/composables/useForkMap'
import { fmtDate } from '@/utils/format'

const props = defineProps<{
  repo?: Repo
  href: string
  fallback: string
}>()

const accent = computed(() => (props.repo ? langColor(props.repo.lang) : ''))
</script>

<template>
  <div v-if="repo" class="meta live">
    <span class="dot" :style="{ background: accent }" aria-hidden="true"></span>
    <span class="lang">{{ LANG_SHORT[repo.lang] ?? repo.lang }}</span>
    <span v-if="repo.stars" class="stars">{{ repo.stars }}★</span>
    <i class="fill" aria-hidden="true"></i>
    <span class="pushed">{{ fmtDate(repo.pushed) }}</span>
    <a
      class="repo"
      :href="repo.url"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="`Репозиторий ${repo.name} на GitHub`"
    >
      github ↗
    </a>
  </div>
  <a v-else class="meta link" :href="href" target="_blank" rel="noopener noreferrer">
    {{ fallback }}
  </a>
</template>

<style scoped>
.meta {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-sm);
  min-width: 0;
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  line-height: 1.6;
  color: var(--color-text-muted);
}

.live {
  animation: meta-in 0.4s ease both;
}

.dot {
  align-self: center;
  flex: none;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.lang {
  min-width: 0;
  color: var(--color-text-secondary);
  letter-spacing: 0.04em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stars {
  color: var(--color-accent);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.fill {
  flex: 1;
  min-width: var(--spacing-md);
  height: 0;
  border-bottom: 1px dotted currentcolor;
  opacity: 0.4;
  transform: translateY(-3px);
}

.pushed {
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.repo {
  white-space: nowrap;
  color: var(--color-link);
  text-decoration: none;
}

.repo:hover,
.repo:focus-visible {
  color: var(--color-link-hover);
  text-decoration: underline;
}

.link {
  display: block;
  color: var(--color-link);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link:hover {
  color: var(--color-link-hover);
  text-decoration: underline;
}

@keyframes meta-in {
  from {
    opacity: 0;
    transform: translateY(3px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .live {
    animation: none;
  }
}
</style>
