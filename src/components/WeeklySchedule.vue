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
    description: 'Работы по основной задаче.',
    link: LINKS.YOUTUBE,
  },
  {
    day: DayOfWeek.Wednesday,
    description: 'Работы по основной задаче.',
    link: LINKS.STREAM,
  },
  {
    day: DayOfWeek.Thursday,
    description: 'Работы по основной задаче. Вопросы/Задачки для собеседования временно отменено',
    link: LINKS.STREAM,
  },
  {
    day: DayOfWeek.Friday,
    description: 'Работы по основной задаче. Обзор творений, присланных на ревью временно отменён',
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
  <ul class="week">
    <li
      v-for="item in scheduleWithStatus"
      :key="item.day"
      :class="[
        'day',
        {
          'is-today': item.isCurrent,
          'is-past': item.isPast,
          'is-future': !item.isCurrent && !item.isPast,
        },
      ]"
      :aria-current="item.isCurrent ? 'date' : undefined"
    >
      <span class="rail" aria-hidden="true"></span>
      <div class="day-body">
        <p class="day-head">
          <span class="day-name">{{ item.label }}</span>
          <span v-if="item.isCurrent" class="head-ref">HEAD</span>
        </p>
        <p class="day-text">
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
        </p>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.week {
  --node-y: 12px;

  margin: 0;
  padding: 0;
  list-style: none;
}

.day {
  display: grid;
  grid-template-columns: 28px 1fr;
}

.rail {
  position: relative;
}

.rail::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  transform: translateX(-50%);
  background: var(--color-bg-tertiary);
}

.day:first-child .rail::before {
  top: var(--node-y);
}

.day:last-child .rail::before {
  bottom: calc(100% - var(--node-y));
}

.rail::after {
  content: '';
  position: absolute;
  left: 50%;
  top: var(--node-y);
  width: 11px;
  height: 11px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: var(--color-bg-tertiary);
  border: 2px solid var(--color-bg-tertiary);
}

.day.is-future .rail::after {
  background: var(--color-bg-primary);
}

.day.is-today .rail::after {
  background: var(--color-accent);
  border-color: var(--color-accent);
  box-shadow: var(--shadow-glow);
}

.day-body {
  min-width: 0;
  padding-bottom: var(--spacing-md);
}

.day:last-child .day-body {
  padding-bottom: 0;
}

.day.is-past .day-body {
  opacity: 0.55;
}

.day-head {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin: 0;
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.day.is-today .day-name {
  color: var(--color-accent);
  font-weight: 700;
}

.head-ref {
  font-size: var(--font-size-xs);
  line-height: 1.4;
  padding: 0 var(--spacing-sm);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-full);
  color: var(--color-accent);
}

.day-text {
  margin: var(--spacing-xs) 0 0 0;
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
}

.day-text a {
  color: var(--color-link);
}

.day-text a:hover {
  color: var(--color-link-hover);
  text-decoration: underline;
}
</style>
