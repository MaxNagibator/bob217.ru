<script lang="ts" setup>
interface Props {
  count?: number
  variant?: 'card' | 'text' | 'schedule'
}

withDefaults(defineProps<Props>(), {
  count: 3,
  variant: 'card',
})
</script>

<template>
  <div class="skeleton-container">
    <template v-if="variant === 'card'">
      <div v-for="i in count" :key="i" class="skeleton-card">
        <div class="skeleton-image"></div>
        <div class="skeleton-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-text short"></div>
        </div>
      </div>
    </template>

    <template v-else-if="variant === 'text'">
      <div v-for="i in count" :key="i" class="skeleton-line">
        <div class="skeleton-text" :style="{ width: `${60 + Math.random() * 40}%` }"></div>
      </div>
    </template>

    <template v-else-if="variant === 'schedule'">
      <div v-for="i in count" :key="i" class="skeleton-schedule-item">
        <div class="skeleton-day"></div>
        <div class="skeleton-description"></div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.skeleton-container {
  width: 100%;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton-card {
  display: flex;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
}

.skeleton-image {
  flex-shrink: 0;
  width: 100px;
  height: 100px;
  border-radius: var(--radius-lg);
  background: linear-gradient(
    90deg,
    var(--color-bg-tertiary) 25%,
    var(--color-bg-elevated) 50%,
    var(--color-bg-tertiary) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.skeleton-title {
  width: 60%;
  height: 24px;
  border-radius: var(--radius-sm);
  background: linear-gradient(
    90deg,
    var(--color-bg-tertiary) 25%,
    var(--color-bg-elevated) 50%,
    var(--color-bg-tertiary) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-text {
  width: 100%;
  height: 16px;
  border-radius: var(--radius-sm);
  background: linear-gradient(
    90deg,
    var(--color-bg-tertiary) 25%,
    var(--color-bg-elevated) 50%,
    var(--color-bg-tertiary) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-text.short {
  width: 40%;
}

.skeleton-line {
  margin-bottom: var(--spacing-md);
}

.skeleton-schedule-item {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
}

.skeleton-day {
  width: 120px;
  height: 20px;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  background: linear-gradient(
    90deg,
    var(--color-bg-tertiary) 25%,
    var(--color-bg-elevated) 50%,
    var(--color-bg-tertiary) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-description {
  flex: 1;
  height: 20px;
  border-radius: var(--radius-sm);
  background: linear-gradient(
    90deg,
    var(--color-bg-tertiary) 25%,
    var(--color-bg-elevated) 50%,
    var(--color-bg-tertiary) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@media (max-width: 768px) {
  .skeleton-card {
    flex-direction: column;
    align-items: center;
  }

  .skeleton-content {
    width: 100%;
    align-items: center;
  }

  .skeleton-title,
  .skeleton-text {
    width: 80%;
  }

  .skeleton-text.short {
    width: 50%;
  }
}
</style>
