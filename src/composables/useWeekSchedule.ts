import { computed, onBeforeUnmount, onMounted, ref, type ComputedRef } from 'vue'

const DAY = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
} as const

type DayOfWeek = (typeof DAY)[keyof typeof DAY]

export type Lane = 'main' | 'weekend'

export interface LinkInfo {
  url: string
  text: string
}

export interface WeekDay {
  day: DayOfWeek
  label: string
  date: string
  description: string
  link?: LinkInfo
  lane: Lane
  isCurrent: boolean
  isPast: boolean
  forks: boolean
  merges: boolean
  branchTip: boolean
}

const DAY_LABELS: Record<DayOfWeek, string> = {
  [DAY.Monday]: 'Понедельник',
  [DAY.Tuesday]: 'Вторник',
  [DAY.Wednesday]: 'Среда',
  [DAY.Thursday]: 'Четверг',
  [DAY.Friday]: 'Пятница',
  [DAY.Saturday]: 'Суббота',
  [DAY.Sunday]: 'Воскресенье',
} as const

const LINKS = {
  STREAM: { url: 'https://www.twitch.tv/bobito217', text: 'Стрим' },
  YOUTUBE: { url: 'https://www.youtube.com/@bobito217', text: 'Ютубчик' },
} as const

interface ScheduleItem {
  day: DayOfWeek
  lane: Lane
  description: string
  link?: LinkInfo
}

const SCHEDULE: readonly ScheduleItem[] = [
  { day: DAY.Monday, lane: 'main', description: 'Работы по основной задаче.', link: LINKS.STREAM },
  {
    day: DAY.Tuesday,
    lane: 'main',
    description: 'Работы по основной задаче.',
    link: LINKS.YOUTUBE,
  },
  {
    day: DAY.Wednesday,
    lane: 'main',
    description: 'Работы по основной задаче.',
    link: LINKS.STREAM,
  },
  {
    day: DAY.Thursday,
    lane: 'main',
    description: 'Работы по основной задаче. Вопросы/Задачки для собеседования временно отменено',
    link: LINKS.STREAM,
  },
  {
    day: DAY.Friday,
    lane: 'main',
    description: 'Работы по основной задаче. Обзор творений, присланных на ревью временно отменён',
    link: LINKS.STREAM,
  },
  { day: DAY.Saturday, lane: 'weekend', description: 'отдыхаем. Но мб чего и будем делать.' },
  { day: DAY.Sunday, lane: 'weekend', description: 'отдыхаем. Но мб чего и будем делать.' },
] as const

const weekOrder = (day: DayOfWeek): number => (day + 6) % 7

const fmtDay = (date: Date): string =>
  `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}`

const lastMainOrder = Math.max(
  ...SCHEDULE.filter((i) => i.lane === 'main').map((i) => weekOrder(i.day)),
)
const weekendOrders = SCHEDULE.filter((i) => i.lane === 'weekend').map((i) => weekOrder(i.day))
const firstWeekendOrder = Math.min(...weekendOrders)
const lastWeekendOrder = Math.max(...weekendOrders)

export function useWeekSchedule(): { days: ComputedRef<WeekDay[]> } {
  const now = ref(new Date())
  let timer: number | undefined

  onMounted(() => {
    timer = window.setInterval(() => (now.value = new Date()), 60_000)
  })

  onBeforeUnmount(() => window.clearInterval(timer))

  const days = computed<WeekDay[]>(() => {
    const today = now.value.getDay() as DayOfWeek
    const todayOrder = weekOrder(today)
    const monday = new Date(now.value)
    monday.setHours(0, 0, 0, 0)
    monday.setDate(monday.getDate() - todayOrder)

    return SCHEDULE.map((item) => {
      const order = weekOrder(item.day)
      const date = new Date(monday)
      date.setDate(monday.getDate() + order)

      return {
        ...item,
        label: DAY_LABELS[item.day],
        date: fmtDay(date),
        isCurrent: item.day === today,
        isPast: order < todayOrder,
        forks: order === lastMainOrder,
        merges: order === lastWeekendOrder,
        branchTip: order === firstWeekendOrder,
      }
    })
  })

  return { days }
}
