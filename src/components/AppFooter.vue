<script lang="ts" setup>
import {
  MessageCircle,
  Youtube,
  Twitch,
  Github,
  MonitorPlay,
  Video,
  PiggyBank,
  type LucideIcon,
} from 'lucide-vue-next'

interface SocialLink {
  url: string
  label: string
  icon: LucideIcon
}

const currentYear = new Date().getFullYear()

const navLinks = [
  { to: '/', label: 'Главная' },
  { to: '/donate', label: 'Донат' },
  { to: '/resume', label: 'Резюме' },
  { to: '/about', label: 'О нас' },
  { to: '/pulls', label: 'PR' },
  { to: '/tarkov', label: 'Тарков' },
] as const

const socialLinks: SocialLink[] = [
  { url: 'https://t.me/bobito217', label: 'Telegram', icon: MessageCircle },
  { url: 'https://www.youtube.com/@bobito217', label: 'YouTube', icon: Youtube },
  { url: 'https://www.twitch.tv/bobito217', label: 'Twitch', icon: Twitch },
  { url: 'https://rutube.ru/channel/38477324/', label: 'Rutube', icon: MonitorPlay },
  { url: 'https://vkvideo.ru/@bobito217', label: 'VK Видео', icon: Video },
  { url: 'https://github.com/MaxNagibator', label: 'GitHub', icon: Github },
]
</script>

<template>
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-section">
        <p class="brand-path"><span class="brand-tilde">~</span>/bob217.ru</p>
        <p class="footer-description">
          Дот нет помойка, лучик света, игровая дрисня и другие проекты
        </p>
      </div>

      <div class="footer-section">
        <p class="footer-title">ссылки</p>
        <nav class="footer-nav">
          <RouterLink v-for="item in navLinks" :key="item.to" :to="item.to" class="footer-link">
            {{ item.label }}
          </RouterLink>
        </nav>
      </div>

      <div class="footer-section">
        <p class="footer-title">соцсети</p>
        <div class="social-links">
          <a
            v-for="social in socialLinks"
            :key="social.url"
            :href="social.url"
            :aria-label="social.label"
            target="_blank"
            rel="noopener noreferrer"
            class="social-link"
          >
            <component :is="social.icon" class="social-icon" :size="16" />
            <span class="social-label">{{ social.label }}</span>
          </a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p class="signoff">
        Signed-off-by: bob217.ru © {{ currentYear }}
        <PiggyBank class="signoff-icon" :size="16" />
      </p>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  margin-top: auto;
  background: var(--color-bg-secondary);
  border-top: 1px solid var(--color-bg-tertiary);
}

.footer-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-xl);
  max-width: var(--max-width-content);
  margin: 0 auto;
  padding: var(--spacing-2xl) var(--spacing-lg) var(--spacing-xl);
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.brand-path {
  margin: 0;
  font-family: var(--font-family-mono);
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-accent);
}

.brand-tilde {
  color: var(--color-text-muted);
}

.footer-description {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

.footer-title {
  margin: 0;
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.footer-nav {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.footer-link {
  position: relative;
  padding-left: 1.2em;
  width: fit-content;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.footer-link::before {
  content: '-';
  position: absolute;
  left: 0;
  font-family: var(--font-family-mono);
  color: var(--color-text-muted);
}

.footer-link:hover {
  color: var(--color-accent);
}

.social-links {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.social-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: fit-content;
  color: var(--color-text-secondary);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.social-link:hover {
  color: var(--color-link);
  transform: translateX(4px);
}

.social-icon {
  flex-shrink: 0;
}

.footer-bottom {
  border-top: 1px solid var(--color-bg-tertiary);
  padding: var(--spacing-md) var(--spacing-lg);
  text-align: center;
}

.signoff {
  margin: 0;
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.signoff-icon {
  display: inline-block;
  vertical-align: middle;
  margin-left: var(--spacing-xs);
  color: var(--color-accent);
}

@media (max-width: 768px) {
  .footer-container {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .footer-nav,
  .social-links {
    align-items: center;
  }

  .footer-link,
  .social-link {
    width: auto;
  }
}
</style>
