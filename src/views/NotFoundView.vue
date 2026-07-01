<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const goBack = () => router.back()
const goHome = () => router.push('/')
</script>

<template>
  <div class="err">
    <main class="term term--accent">
      <p class="eyebrow"><span class="h">##</span> error</p>
      <p class="cmd"><span class="p">$</span> git checkout {{ route.fullPath }}</p>
      <div class="code">404</div>
      <p class="fatal"><span class="kw">fatal:</span> страница не найдена</p>
      <p class="hint">такого пути в этом репозитории нет.</p>
      <div class="actions">
        <button class="cmd-btn" @click="goBack"><span class="p">$</span> cd -</button>
        <button class="cmd-btn" @click="goHome"><span class="p">$</span> cd ~/</button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.err {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: var(--spacing-xl);
}

.term {
  position: relative;
  width: 100%;
  max-width: 560px;
  overflow: hidden;
  padding: var(--spacing-xl);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-bg-tertiary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  font-family: var(--font-family-mono);
}

.term::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  background: var(--color-accent);
}

.term--accent {
  --code-color: var(--color-accent);
  --code-glow: rgba(255, 204, 0, 0.35);
}

.eyebrow {
  margin: 0 0 var(--spacing-md);
  font-size: var(--font-size-xs);
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.eyebrow .h {
  color: var(--color-accent);
}

.cmd {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  word-break: break-all;
}

.cmd .p {
  color: var(--color-accent);
}

.code {
  margin: var(--spacing-sm) 0 var(--spacing-xs);
  font-size: 5rem;
  font-weight: 700;
  line-height: 1;
  color: var(--code-color);
  text-shadow: 0 0 24px var(--code-glow);
}

.fatal {
  margin: var(--spacing-xs) 0 var(--spacing-sm);
  font-size: var(--font-size-lg);
  color: var(--color-danger);
}

.fatal .kw {
  font-weight: 700;
}

.hint {
  margin: 0 0 var(--spacing-xl);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.cmd-btn {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  cursor: pointer;
  color: var(--color-text-secondary);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.cmd-btn .p {
  color: var(--color-accent);
}

.cmd-btn:hover {
  color: var(--color-text-primary);
  border-color: var(--color-accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow);
}
</style>
