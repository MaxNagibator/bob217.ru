<script lang="ts" setup>
import WeeklySchedule from './WeeklySchedule.vue'
</script>

<template>
  <div class="info-content">
    <section class="md-section">
      <h2 class="md-head"><span class="hash">##</span> Основная задача</h2>
      <p class="task">
        Дать возможность ютуб бакуперу заливать видосы на рутуб. Делаем оркестратор медия. В нём
        будут настраиваться правила из какого хранилища в какое перекачивать данные (например с
        ютуба на жёсткий, с жёсткого на рутуб и вк видео). Хранилища реализуем в ввиде плагинов для
        удобства расширения (шутка, просто по приколу и для развития). Первичный вид на винформах,
        потом мб сделаем консоль (шутка).
      </p>
    </section>

    <section class="md-section">
      <h2 class="md-head"><span class="hash">##</span> Расписание недели</h2>
      <WeeklySchedule />
    </section>

    <section class="md-section">
      <h2 class="md-head"><span class="hash">##</span> Планы</h2>
      <ul class="md-list">
        <li>
          Продолжить сапёра на vieJs / Авторизация будет через https://auth.bob217.ru (который нужно
          тоже сделать)
        </li>
        <li>Поддержка ранее написанных решений. Список ниже.</li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.info-content {
  margin-bottom: var(--spacing-2xl);
}

.md-section + .md-section {
  margin-top: var(--spacing-xl);
}

.md-head {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-sm);
  margin: 0 0 var(--spacing-md) 0;
}

.md-head .hash {
  font-family: var(--font-family-mono);
  font-size: 0.8em;
  color: var(--color-accent);
}

.task {
  margin: 0;
  padding: var(--spacing-xs) 0 var(--spacing-xs) var(--spacing-md);
  border-left: 3px solid var(--color-accent);
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
}

.md-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.md-list li {
  position: relative;
  padding-left: 1.2em;
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
}

.md-list li + li {
  margin-top: var(--spacing-sm);
}

.md-list li::before {
  content: '-';
  position: absolute;
  left: 0;
  font-family: var(--font-family-mono);
  color: var(--color-text-muted);
}
</style>
