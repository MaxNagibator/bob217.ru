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
        <b>Основная задача</b>: Сделать сапёра на vieJs / Авторизация будет через
        https://auth.bob217.ru (который нужно тоже сделать)
      </li>
    </ul>

    <WeeklySchedule />

    <ul>
      <li>
        Планы:<br />
        Отсутствуют
      </li>
      <li>Поддержка ранее написанных решений. Список ниже.</li>
    </ul>
  </div>
</template>

<style scoped>
.info-section h2 {
  font-family: 'Poppins', sans-serif;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  color: #fff;
  border-bottom: 2px solid #ffcc00;
}

.info-content ul {
  margin: 0;
  padding: 0;
  list-style-type: none;
}

.info-content ul li {
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  padding: 10px;
  transition: background-color 0.3s ease;
  color: #ccc;
  border-radius: 5px;
  background-color: #333;
}

.info-content ul li:hover {
  background-color: #444;
}

.info-content ul li b {
  color: #ffcc00;
}

.info-content ul li a {
  transition: color 0.3s ease;
  text-decoration: none;
  color: #00bcd4;
}

.info-content ul li a:hover {
  color: #ffcc00;
}

.telegram-link {
  color: white;
}
</style>
