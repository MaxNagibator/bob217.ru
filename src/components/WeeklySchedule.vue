<script lang="ts" setup>
import { computed } from 'vue'

const enum DayOfWeek {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}

const DAY_LABELS: Record<DayOfWeek, string> = {
  [DayOfWeek.Monday]: 'Понедельник',
  [DayOfWeek.Tuesday]: 'Вторник',
  [DayOfWeek.Wednesday]: 'Среда',
  [DayOfWeek.Thursday]: 'Четверг',
  [DayOfWeek.Friday]: 'Пятница',
  [DayOfWeek.Saturday]: 'Суббота',
  [DayOfWeek.Sunday]: 'Воскресенье',
} as const

interface LinkInfo {
  url: string
  text: string
}

interface ScheduleDay {
  day: DayOfWeek
  description: string
  link?: LinkInfo
}

const LINKS = {
  STREAM: { url: 'https://www.twitch.tv/bobito217', text: 'Стрим. ' },
  YOUTUBE: { url: 'https://www.youtube.com/@bobito217', text: 'Ютубчик' },
} as const

const schedule: readonly ScheduleDay[] = [
  {
    day: DayOfWeek.Monday,
    description: 'Работы по основной задаче.',
    link: LINKS.STREAM,
  },
  {
    day: DayOfWeek.Tuesday,
    description: 'Оффлайн видосик. Переезд на linux.',
    link: LINKS.YOUTUBE,
  },
  {
    day: DayOfWeek.Wednesday,
    description: 'Работы по основной задаче.',
    link: LINKS.STREAM,
  },
  {
    day: DayOfWeek.Thursday,
    description: 'Вопросы/Задачки для собеседования',
    link: LINKS.STREAM,
  },
  {
    day: DayOfWeek.Friday,
    description: 'Обзор творений, присланных на ревью',
    link: LINKS.STREAM,
  },
  {
    day: DayOfWeek.Saturday,
    description: 'отдыхаем. Но мб чего и будем делать.',
  },
  {
    day: DayOfWeek.Sunday,
    description: 'отдыхаем. Но мб чего и будем делать.',
  },
] as const

const scheduleWithStatus = computed(() => {
  const today = new Date().getDay() as DayOfWeek

  return schedule.map((item) => ({
    ...item,
    label: DAY_LABELS[item.day],
    isCurrent: item.day === today,
  }))
})
</script>

<template>
  <ul class="schedule-list">
    <li
      v-for="item in scheduleWithStatus"
      :key="item.day"
      :class="{ 'current-day': item.isCurrent }"
      :aria-current="item.isCurrent || undefined"
      class="schedule-item"
    >
      {{ item.label }} —
      <b>
        <a v-if="item.link" :href="item.link.url" target="_blank" rel="noopener noreferrer">
          {{ item.link.text }}
        </a>
        {{ item.description }}
      </b>
    </li>
  </ul>
</template>

<style scoped>
.schedule-list {
  margin: 0;
  padding: 0;
  list-style-type: none;
}

.schedule-item {
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  padding: 10px;
  transition:
    background-color 0.3s ease,
    border-left 0.3s ease;
  color: #ccc;
  border-radius: 5px;
  background-color: #333;
  border-left: 4px solid transparent;
}

.schedule-item:hover {
  background-color: #444;
}

.schedule-item.current-day {
  background-color: #2a4a2a;
  border-left-color: #4caf50;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
  animation: highlightDay 1s ease-out;
}

@keyframes highlightDay {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 rgba(76, 175, 80, 0);
  }
  50% {
    transform: scale(1.03);
    box-shadow: 0 0 25px rgba(76, 175, 80, 0.6);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
  }
}

.schedule-item b {
  color: #ffcc00;
}

.schedule-item a {
  transition: color 0.3s ease;
  text-decoration: none;
  color: #00bcd4;
}

.schedule-item a:hover {
  color: #ffcc00;
}
</style>
