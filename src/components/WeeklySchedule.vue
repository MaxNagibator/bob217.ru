<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

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
  STREAM: { url: 'https://www.twitch.tv/bobito217', text: 'Стрим' },
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

const getCurrentDayOfWeek = (): DayOfWeek => new Date().getDay() as DayOfWeek

const getWeekOrderValue = (day: DayOfWeek): number => (day + 6) % 7

const today = ref(getCurrentDayOfWeek())
let intervalId: number | undefined

onMounted(() => {
  intervalId = window.setInterval(() => {
    today.value = getCurrentDayOfWeek()
  }, 60_000)
})

onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})

const scheduleWithStatus = computed(() => {
  const currentDayOrder = getWeekOrderValue(today.value)

  return schedule.map((item) => {
    const itemDayOrder = getWeekOrderValue(item.day)

    return {
      ...item,
      label: DAY_LABELS[item.day],
      isCurrent: item.day === today.value,
      isPast: itemDayOrder < currentDayOrder,
    }
  })
})
</script>

<template>
  <ul class="schedule-list">
    <li
      v-for="item in scheduleWithStatus"
      :key="item.day"
      :class="['schedule-item', { 'current-day': item.isCurrent, past: item.isPast }]"
      :aria-current="item.isCurrent ? 'date' : undefined"
    >
      <span class="day-label">
        {{ item.label }}
        <span v-if="item.isCurrent" class="badge-today">Сегодня</span>
      </span>
      —
      <strong class="day-content">
        <a
          v-if="item.link"
          :href="item.link.url"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="`${item.link.text} — откроется в новой вкладке`"
        >
          {{ item.link.text }}
        </a>
        <template v-if="item.link">. </template>
        {{ item.description }}
      </strong>
    </li>
  </ul>
</template>

<style scoped>
.schedule-list {
  --schedule-text: #ccc;
  --schedule-bg: #333;
  --schedule-bg-hover: #444;
  --schedule-accent: #4caf50;
  --schedule-accent-bg: #2a4a2a;
  --schedule-link: #00bcd4;
  --schedule-emphasis: #ffcc00;
  --schedule-badge-bg: #4caf50;
  --schedule-badge-text: #111;

  margin: 0;
  padding: 0;
  list-style-type: none;
}

.schedule-item {
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  padding: clamp(8px, 1.5vw, 12px);
  transition:
    background-color 0.3s ease,
    border-left 0.3s ease,
    opacity 0.3s ease;
  color: var(--schedule-text);
  border-radius: 5px;
  background-color: var(--schedule-bg);
  border-left: 4px solid transparent;
}

.schedule-item:hover {
  background-color: var(--schedule-bg-hover);
}

.schedule-item.current-day {
  background-color: var(--schedule-accent-bg);
  border-left-color: var(--schedule-accent);
  box-shadow: 0 0 10px color-mix(in srgb, var(--schedule-accent) 30%, transparent);
  animation: highlightDay 1s ease-out;
}

.schedule-item.past {
  opacity: 0.6;
}

@keyframes highlightDay {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 color-mix(in srgb, var(--schedule-accent) 0%, transparent);
  }
  50% {
    transform: scale(1.03);
    box-shadow: 0 0 25px color-mix(in srgb, var(--schedule-accent) 60%, transparent);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 10px color-mix(in srgb, var(--schedule-accent) 30%, transparent);
  }
}

.day-label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.badge-today {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--schedule-badge-bg);
  color: var(--schedule-badge-text);
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.2;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.day-content {
  color: var(--schedule-emphasis);
}

.schedule-item a {
  transition: color 0.3s ease;
  text-decoration: none;
  color: var(--schedule-link);
}

.schedule-item a:hover {
  color: var(--schedule-emphasis);
  text-decoration: underline;
}

.schedule-item a:focus-visible {
  outline: 2px solid var(--schedule-emphasis);
  outline-offset: 2px;
  border-radius: 2px;
}
</style>
