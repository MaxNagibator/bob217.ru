<script lang="ts" setup>
import WeeklySchedule from './WeeklySchedule.vue'
</script>

<template>
  <div class="info-content">
    <h2>
      Чем мы тут занимаемся, примерно в 18:00МСК начинаем.
      <br />
      <a class="telegram-link" href="https://t.me/@druzhok_kruzhok_bot">
        Уведомления тут в телеге
      </a>
    </h2>
    <ul>
      <li class="main-task">
        <b>Основная задача</b>: Дать вомзожность ютуб бакуперу заливать видосы на рутуб/вквидео
      </li>
    </ul>

    <WeeklySchedule />

    <ul>
      <li>
        Планы:<br />
        Продолжить сапёра на vieJs / Авторизация будет через
        https://auth.bob217.ru (который нужно тоже сделать)
      </li>
      <li>Поддержка ранее написанных решений. Список ниже.</li>
    </ul>
  </div>
</template>

<style scoped>
.info-content {
  margin-bottom: var(--spacing-xl);
}

.info-content h2 {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin: 0 0 var(--spacing-md) 0;
  color: var(--color-text-primary);
}

.info-content ul {
  margin: 0;
  padding: 0;
  list-style-type: none;
}

.info-content ul li {
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  transition: background-color var(--transition-base);
  color: var(--color-text-secondary);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-secondary);
}

.info-content ul li:hover {
  background-color: var(--color-bg-tertiary);
}

.info-content ul li b {
  color: var(--color-accent);
}

.info-content ul li a {
  transition: color var(--transition-base);
  text-decoration: none;
  color: var(--color-link);
}

.info-content ul li a:hover {
  color: var(--color-accent);
}

.main-task {
  border-left: 4px solid var(--color-accent);
}

.telegram-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: linear-gradient(135deg, #0088cc 0%, #00a8e8 100%);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  font-weight: 500;
  transition: all var(--transition-base);
}

.telegram-link:hover {
  color: var(--color-text-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 136, 204, 0.4);
}
</style>
