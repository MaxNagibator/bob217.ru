<script lang="ts" setup>
import { MessageCircle, Youtube, Twitch, Github, PiggyBank, type LucideIcon } from 'lucide-vue-next'

interface SocialLink {
  url: string
  label: string
  icon: LucideIcon
}

const currentYear = new Date().getFullYear()

const socialLinks: SocialLink[] = [
  { url: 'https://t.me/bobito217', label: 'Telegram', icon: MessageCircle },
  { url: 'https://www.youtube.com/@bobito217', label: 'YouTube', icon: Youtube },
  { url: 'https://www.twitch.tv/bobito217', label: 'Twitch', icon: Twitch },
  { url: 'https://github.com/MaxNagibator', label: 'GitHub', icon: Github },
]
</script>

<template>
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-section">
        <h4 class="footer-title">bob217.ru</h4>
        <p class="footer-description">
          Дот нет помойка, лучик света, игровая дрисня и другие проекты
        </p>
      </div>

      <div class="footer-section">
        <h4 class="footer-title">Ссылки</h4>
        <nav class="footer-nav">
          <RouterLink to="/" class="footer-link">Главная</RouterLink>
          <RouterLink to="/resume" class="footer-link">Резюме</RouterLink>
          <RouterLink to="/about" class="footer-link">О нас</RouterLink>
          <RouterLink to="/donate" class="footer-link">Поддержать</RouterLink>
        </nav>
      </div>

      <div class="footer-section">
        <h4 class="footer-title">Социальные сети</h4>
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
            <component :is="social.icon" class="social-icon" :size="18" />
            <span class="social-label">{{ social.label }}</span>
          </a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p class="copyright">
        © {{ currentYear }} bob217.ru — Все права защищены
        <PiggyBank class="copyright-icon" :size="16" />
      </p>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  margin-top: auto;
  padding-top: var(--spacing-2xl);
  background: var(--color-bg-secondary);
  border-top: 1px solid var(--color-bg-tertiary);
}

.footer-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-xl);
  max-width: var(--max-width-content);
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-lg);
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.footer-title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-accent);
  margin: 0;
}

.footer-description {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

.footer-nav {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.footer-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: color var(--transition-fast);
  width: fit-content;
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
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
  width: fit-content;
}

.social-link:hover {
  color: var(--color-link);
  transform: translateX(4px);
}

.social-icon {
  flex-shrink: 0;
}

.copyright-icon {
  display: inline-block;
  vertical-align: middle;
  margin-left: var(--spacing-xs);
  color: var(--color-accent);
}

.footer-bottom {
  border-top: 1px solid var(--color-bg-tertiary);
  padding: var(--spacing-lg);
  text-align: center;
}

.copyright {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  margin: 0;
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
