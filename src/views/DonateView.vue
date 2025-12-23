<script lang="ts" setup>
import { useClipboard } from '@/composables/useClipboard'
import { Heart, MessageCircle, Gift, Bitcoin, Copy, Check, ArrowRight } from 'lucide-vue-next'

const { copied, copy } = useClipboard()

const CRYPTO_ADDRESS = '0x288debec7c0b441b69b0e25fc7d6c8ec02883055'

const copyAddress = (): void => {
  copy(CRYPTO_ADDRESS)
}
</script>

<template>
  <div class="donate">
    <div class="donate-container">
      <div class="donate-header">
        <Heart class="donate-icon" :size="64" :stroke-width="1.5" />
        <h2>Поддержка проектов</h2>
        <p class="donate-subtitle">
          "дот нет помойка", "лучик света", "игровая дрисня", "фильмы с максимчиком"
        </p>
      </div>

      <div class="telegram-banner">
        <MessageCircle class="telegram-icon" :size="32" />
        <div class="telegram-content">
          <span class="telegram-label">Telegram</span>
          <a href="https://t.me/bobito217"
             target="_blank"
             rel="noopener noreferrer"
             class="telegram-link">
            @bobito217
          </a>
        </div>
      </div>

      <div class="donate-section">
        <div class="section-header">
          <Gift class="section-icon" :size="28" />
          <h3>Донаты через DonateStream</h3>
        </div>
        <p class="section-description">Пожертвования можно кидать сюды</p>
        <a class="donate-link"
           href="https://donate.stream/bob217"
           target="_blank"
           rel="noopener noreferrer">
          donate.stream/bob217
          <ArrowRight class="link-arrow" :size="18" />
        </a>
        <img alt="QR код для доната" class="qr-image" src="/img/qr.png" />
      </div>

      <div class="donate-section crypto">
        <div class="section-header">
          <Bitcoin class="section-icon" :size="28" />
          <h3>Криптовалюта USDC/USDT/BTC/ETH BEP20</h3>
        </div>
        <p class="section-description">Криптой сюда</p>
        <div class="crypto-address-wrapper">
          <code class="crypto-address">{{ CRYPTO_ADDRESS }}</code>
          <button class="copy-button"
                  :class="{ copied }"
                  @click="copyAddress"
                  :aria-label="copied ? 'Скопировано!' : 'Скопировать адрес'">
            <Check v-if="copied" class="copy-icon" :size="18" />
            <Copy v-else class="copy-icon" :size="18" />
            <span class="copy-text">{{ copied ? 'Скопировано!' : 'Копировать' }}</span>
          </button>
        </div>
        <img alt="USDC QR код" class="qr-image" src="/img/usdc.png" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.donate {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: var(--spacing-xl);
  padding-top: calc(var(--nav-height) + var(--spacing-xl));
}

.donate-container {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.donate-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.donate-icon {
  display: block;
  margin: 0 auto var(--spacing-md);
  color: var(--color-danger);
  animation: heartbeat 1.5s ease-in-out infinite;
}

@keyframes heartbeat {
  0%,
  100% {
    transform: scale(1);
  }
  14% {
    transform: scale(1.15);
  }
  28% {
    transform: scale(1);
  }
  42% {
    transform: scale(1.15);
  }
  70% {
    transform: scale(1);
  }
}

.donate-header h2 {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-2xl);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.donate-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin: 0;
}

.telegram-banner {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, #0088cc 0%, #00a8e8 100%);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-xl);
}

.telegram-icon {
  flex-shrink: 0;
  color: var(--color-text-primary);
}

.telegram-content {
  display: flex;
  flex-direction: column;
}

.telegram-label {
  font-size: var(--font-size-sm);
  color: rgba(255, 255, 255, 0.8);
}

.telegram-link {
  color: var(--color-text-primary);
  font-weight: 600;
  font-size: var(--font-size-lg);
  text-decoration: none;
  transition: opacity var(--transition-fast);
}

.telegram-link:hover {
  opacity: 0.9;
}

.donate-section {
  padding: var(--spacing-xl);
  text-align: center;
  border-radius: var(--radius-lg);
  background-color: var(--color-bg-secondary);
  margin-bottom: var(--spacing-lg);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.section-icon {
  color: var(--color-accent);
  flex-shrink: 0;
}

.section-header h3 {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-lg);
  color: var(--color-accent);
  margin: 0;
}

.section-description {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-md) 0;
}

.donate-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-base);
  font-weight: 600;
  text-decoration: none;
  color: var(--color-text-primary);
  background: var(--gradient-button);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.donate-link:hover {
  background: var(--gradient-button-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.link-arrow {
  transition: transform var(--transition-fast);
}

.donate-link:hover .link-arrow {
  transform: translateX(4px);
}

.qr-image {
  display: block;
  width: 217px;
  height: auto;
  margin: var(--spacing-lg) auto 0;
  border-radius: var(--radius-lg);
  border: 3px solid var(--color-bg-tertiary);
}

.crypto-address-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin: var(--spacing-md) 0;
}

.crypto-address {
  font-family: 'Roboto Mono', monospace;
  font-size: var(--font-size-xs);
  padding: var(--spacing-md);
  word-break: break-all;
  color: var(--color-accent);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-bg-elevated);
}

.copy-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-primary);
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-bg-elevated);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.copy-button:hover {
  background: var(--color-bg-elevated);
  border-color: var(--color-accent);
}

.copy-button.copied {
  background: var(--color-success-bg);
  border-color: var(--color-success);
  color: var(--color-success);
}

.copy-icon {
  font-size: var(--font-size-base);
}

@media (max-width: 768px) {
  .donate {
    padding: var(--spacing-lg);
    padding-top: calc(var(--nav-height) + var(--spacing-lg));
  }

  .donate-container {
    max-width: 100%;
  }

  .donate-header h2 {
    font-size: var(--font-size-xl);
  }

  .donate-icon {
    width: 48px;
    height: 48px;
  }

  .telegram-banner {
    padding: var(--spacing-md);
  }

  .donate-section {
    padding: var(--spacing-lg);
  }

  .copy-button {
    width: 100%;
  }
}
</style>
