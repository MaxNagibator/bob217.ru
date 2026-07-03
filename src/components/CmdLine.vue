<script lang="ts" setup>
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'run'): void
  (e: 'done'): void
}>()

const textEl = ref<HTMLElement | null>(null)
const running = ref(false)
const settling = ref(false)

const rerun = (event: MouseEvent): void => {
  const el = textEl.value
  if (!el || running.value) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (event.target instanceof Element && event.target.closest('a')) return
  if (window.getSelection()?.toString()) return

  const chars = el.textContent?.trim().length ?? 0
  if (chars === 0) return

  el.style.setProperty('--cmd-width', `${Math.ceil(el.getBoundingClientRect().width)}px`)
  el.style.setProperty('--cmd-steps', `steps(${chars})`)
  el.style.setProperty('--cmd-erase-ms', `${Math.min(100 + chars * 10, 400)}ms`)
  el.style.setProperty('--cmd-type-ms', `${Math.min(220 + chars * 30, 1250)}ms`)
  settling.value = false
  running.value = true
  emit('run')
}

const onTextAnimationEnd = (event: AnimationEvent): void => {
  if (event.animationName.startsWith('cmd-type')) {
    running.value = false
    settling.value = true
    emit('done')
  }
}
</script>

<template>
  <p class="cmd" :class="{ running, settling }" @click="rerun">
    <span class="cmd-prompt">$&nbsp;</span
    ><span ref="textEl" class="cmd-text" @animationend="onTextAnimationEnd"><slot /></span
    ><span class="cmd-cursor" aria-hidden="true" @animationend="settling = false"></span>
  </p>
</template>

<style scoped>
.cmd {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  letter-spacing: 0.03em;
  margin: 0 0 var(--spacing-sm) 0;
  cursor: pointer;
}

.cmd-prompt {
  color: var(--color-accent);
}

.cmd-cursor {
  display: inline-block;
  width: 1ch;
  height: 1.1em;
  margin-left: 1px;
  vertical-align: text-bottom;
  background: var(--color-accent);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.cmd:hover .cmd-cursor {
  opacity: 0.35;
}

.cmd.running .cmd-text {
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  vertical-align: bottom;
  animation:
    cmd-erase var(--cmd-erase-ms) var(--cmd-steps) forwards,
    cmd-type var(--cmd-type-ms) var(--cmd-steps) calc(var(--cmd-erase-ms) + 180ms) forwards;
}

.cmd.running .cmd-cursor {
  opacity: 1;
  transition: none;
}

.cmd.settling .cmd-cursor {
  animation: cmd-blink 1.06s steps(2, jump-none) 2 forwards;
}

@keyframes cmd-erase {
  from {
    max-width: var(--cmd-width);
  }
  to {
    max-width: 0;
  }
}

@keyframes cmd-type {
  from {
    max-width: 0;
  }
  to {
    max-width: var(--cmd-width);
  }
}

@keyframes cmd-blink {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>
