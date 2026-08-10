<script lang="ts" setup>
const STEP_MS = 420

defineProps<{
  lines: string[]
}>()
</script>

<template>
  <ul class="term">
    <li
      v-for="(line, i) in lines"
      :key="line"
      class="line typed"
      :style="{ '--trail': `${i * STEP_MS}ms` }"
    >
      <span class="text">{{ line }}</span
      ><i v-if="i === lines.length - 1" class="caret" aria-hidden="true"></i>
    </li>
  </ul>
</template>

<style scoped>
.term {
  margin: 0;
  padding: 0;
  list-style: none;
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.line {
  padding: 2px 0;
  white-space: nowrap;
}

.caret {
  opacity: 0.7;
}
</style>
