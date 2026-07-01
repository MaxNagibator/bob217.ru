<script lang="ts" setup>
import { Copy, Check, Heart } from 'lucide-vue-next'
import { useClipboard } from '@/composables/useClipboard'

const { copied, copy } = useClipboard()

const CRYPTO_ADDRESS = '0x09daec7735270c3dc16c3fcfae159f38352b606d'

const copyAddress = (): void => {
  copy(CRYPTO_ADDRESS)
}
</script>

<template>
  <div class="donate">
    <div class="donate-container">
      <header class="donate-header">
        <p class="cmd">
          <span class="cmd-prompt">$</span> git remote -v
          <span class="cmd-note"># куда пушить поддержку &lt;3</span>
        </p>
        <Heart class="donate-heart" :size="44" :stroke-width="1.5" aria-hidden="true" />
        <h1>Поддержка проектов</h1>
        <p class="donate-subtitle">
          "дот нет помойка", "лучик света", "игровая дрисня", "фильмы с максимчиком"
        </p>
      </header>

      <section class="remote">
        <header class="remote-head">
          <span class="remote-name">telegram</span>
          <a
            href="https://t.me/bobito217"
            target="_blank"
            rel="noopener noreferrer"
            class="remote-target"
          >
            @bobito217
          </a>
          <span class="remote-kind">(chat)</span>
        </header>
      </section>

      <section class="remote">
        <header class="remote-head">
          <span class="remote-name">donate.stream</span>
          <a
            href="https://donate.stream/bob217"
            target="_blank"
            rel="noopener noreferrer"
            class="remote-target"
          >
            donate.stream/bob217
          </a>
          <span class="remote-kind">(push)</span>
        </header>
        <p class="remote-description">Пожертвования можно кидать сюды</p>
        <img alt="QR код для доната" class="qr-image" src="/img/qr.png" />
      </section>

      <section class="remote">
        <header class="remote-head">
          <span class="remote-name">usdt-bep20</span>
          <span class="remote-kind">(push)</span>
        </header>
        <p class="remote-description">Криптой сюда</p>
        <div class="crypto-address-wrapper">
          <code class="crypto-address">{{ CRYPTO_ADDRESS }}</code>
          <button
            class="copy-button"
            :class="{ copied }"
            :aria-label="copied ? 'Скопировано!' : 'Скопировать адрес'"
            @click="copyAddress"
          >
            <Check v-if="copied" :size="16" />
            <Copy v-else :size="16" />
            <span>{{ copied ? 'Скопировано!' : 'Копировать' }}</span>
          </button>
        </div>
        <img alt="USDT QR код" class="qr-image" src="/img/usdc.png" />
      </section>
    </div>
  </div>
</template>

<style scoped>
.donate {
  min-height: 100vh;
  padding: var(--spacing-xl);
}

.donate-container {
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
}

.donate-header {
  margin-bottom: var(--spacing-lg);
}

.donate-header h1 {
  margin: 0;
}

.donate-heart {
  display: block;
  margin: var(--spacing-md) auto 0;
  color: var(--color-danger);
  animation: heartbeat 1.5s ease-in-out infinite;
}

@keyframes heartbeat {
  0%,
  28%,
  70%,
  100% {
    transform: scale(1);
  }
  14%,
  42% {
    transform: scale(1.15);
  }
}

.cmd {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  letter-spacing: 0.03em;
  margin: 0 0 var(--spacing-sm) 0;
}

.cmd-prompt {
  color: var(--color-accent);
}

.cmd-note {
  padding-left: var(--spacing-sm);
}

.donate-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  text-align: center;
  margin: 0;
}

.remote {
  padding: var(--spacing-lg) 0;
}

.remote + .remote {
  border-top: 1px solid var(--color-bg-tertiary);
}

.remote-head {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
}

.remote-name {
  font-weight: 700;
  color: var(--color-link);
}

.remote-target {
  color: var(--color-text-primary);
  text-decoration: none;
}

a.remote-target:hover {
  color: var(--color-link-hover);
  text-decoration: underline;
}

.remote-kind {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}

.remote-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: var(--spacing-sm) 0 0 0;
}

.qr-image {
  display: block;
  width: 217px;
  height: auto;
  margin: var(--spacing-md) auto 0;
  border-radius: var(--radius-lg);
  border: 3px solid var(--color-bg-tertiary);
}

.crypto-address-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.crypto-address {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  padding: var(--spacing-md);
  word-break: break-all;
  color: var(--color-accent);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-secondary);
}

.copy-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  background: transparent;
  border: 1px solid var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.copy-button:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.copy-button.copied {
  color: var(--color-success);
  border-color: var(--color-success);
}

@media (max-width: 768px) {
  .donate {
    padding: var(--spacing-lg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .donate-heart {
    animation: none;
  }
}
</style>
