import { ref, onMounted, onBeforeUnmount } from 'vue'

export interface TarkovStatus {
  time: string
  hours: number
  minutes: number
  seconds: number
  isDay: boolean
  terminal: {
    isOpen: boolean
    statusText: string
    nextEventText: string
    minutesToEvent: number
    formattedCountdown: string
    realEventTime: string
    realClosingTime: string
    windowRange: string
  }
}

export function formatTime(h: number, m: number, s: number): string {
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function getTarkovStatus(leftSide: boolean, baseTime: number = Date.now()): TarkovStatus {
  const msInDay = 24 * 60 * 60 * 1000
  const russiaOffset = 3 * 60 * 60 * 1000
  const secondZoneOffset = leftSide ? 0 : 12 * 60 * 60 * 1000

  const tarkovMs = (baseTime * 7 + russiaOffset + secondZoneOffset) % msInDay

  const hours = Math.floor(tarkovMs / (60 * 60 * 1000))
  const minutes = Math.floor((tarkovMs % (60 * 60 * 1000)) / (60 * 1000))
  const seconds = Math.floor((tarkovMs % (60 * 1000)) / 1000)

  const time = formatTime(hours, minutes, seconds)
  const isDay = hours >= 5 && hours < 22

  const isOpen = hours >= 22 || hours < 4
  const statusText = isOpen ? 'ОТКРЫТО' : 'ЗАКРЫТО'

  let minutesToEvent = 0
  let nextEventText = ''

  if (!isOpen) {
    let hoursToWait = 22 - hours
    if (hoursToWait < 0) hoursToWait += 24

    const totalGameMinutesLeft = hoursToWait * 60 - minutes
    minutesToEvent = Math.round(totalGameMinutesLeft / 7)

    nextEventText = `Открытие через`
  } else {
    let hoursLeft = 4 - hours
    if (hoursLeft < 0) hoursLeft += 24

    const totalGameMinutesLeft = hoursLeft * 60 - minutes
    minutesToEvent = Math.round(totalGameMinutesLeft / 7)

    nextEventText = `Закрытие через`
  }

  const eventAbsoluteTime = baseTime + minutesToEvent * 60 * 1000
  const realMinutesToNow = Math.round((eventAbsoluteTime - Date.now()) / 60000)

  const isPlanning = Math.abs(baseTime - Date.now()) > 10000

  const displayMins = isPlanning ? minutesToEvent : Math.max(0, realMinutesToNow)
  const cdHoursFull = Math.floor(displayMins / 60)
  const cdMinsFull = displayMins % 60
  const realFormattedCountdown = `${cdHoursFull.toString().padStart(2, '0')}:${cdMinsFull.toString().padStart(2, '0')}`

  let minutesToClosingFromBase = 0
  if (isOpen) {
    let hoursLeft = 4 - hours
    if (hoursLeft <= 0) hoursLeft += 24
    const totalGameMinutesLeft = hoursLeft * 60 - minutes
    minutesToClosingFromBase = Math.max(0, Math.round(totalGameMinutesLeft / 7))
  } else {
    minutesToClosingFromBase = minutesToEvent + Math.round((6 * 60) / 7)
  }

  return {
    time,
    hours,
    minutes,
    seconds,
    isDay,
    terminal: {
      isOpen,
      statusText,
      nextEventText,
      minutesToEvent,
      formattedCountdown: realFormattedCountdown,
      realEventTime: new Date(eventAbsoluteTime).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      realClosingTime: new Date(baseTime + minutesToClosingFromBase * 60 * 1000).toLocaleTimeString(
        [],
        {
          hour: '2-digit',
          minute: '2-digit',
        },
      ),
      windowRange: (() => {
        const closingTime = baseTime + minutesToClosingFromBase * 60 * 1000
        const openingTime = isOpen
          ? eventAbsoluteTime - Math.round((6 * 60) / 7) * 60 * 1000
          : eventAbsoluteTime
        const fmt = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        return `${fmt(new Date(openingTime))} - ${fmt(new Date(closingTime))}`
      })(),
    },
  }
}

export function useTarkovTime(updateInterval = 1000) {
  const leftZone = ref<TarkovStatus>(getTarkovStatus(true))
  const rightZone = ref<TarkovStatus>(getTarkovStatus(false))

  let timer: ReturnType<typeof setInterval>

  onMounted(() => {
    leftZone.value = getTarkovStatus(true)
    rightZone.value = getTarkovStatus(false)

    timer = setInterval(() => {
      leftZone.value = getTarkovStatus(true)
      rightZone.value = getTarkovStatus(false)
    }, updateInterval)
  })

  onBeforeUnmount(() => {
    clearInterval(timer)
  })

  return {
    leftZone,
    rightZone,
  }
}
