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
  }
}

export function useTarkovTime(updateInterval = 1000) {
  const leftZone = ref<TarkovStatus>(getTarkovStatus(true))
  const rightZone = ref<TarkovStatus>(getTarkovStatus(false))

  function formatTime(h: number, m: number, s: number): string {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  function getTarkovStatus(leftSide: boolean): TarkovStatus {
    const msInDay = 24 * 60 * 60 * 1000
    const russiaOffset = 3 * 60 * 60 * 1000
    const secondZoneOffset = leftSide ? 0 : 12 * 60 * 60 * 1000

    const now = Date.now()
    const tarkovMs = (now * 7 + russiaOffset + secondZoneOffset) % msInDay

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

      const totalGameMinutesLeft = hoursToWait * 60 + (60 - minutes)
      minutesToEvent = Math.round(totalGameMinutesLeft / 7)

      nextEventText = `Открытие в`
    } else {
      let hoursLeft = 4 - hours
      if (hoursLeft < 0) hoursLeft += 24

      const totalGameMinutesLeft = hoursLeft * 60 + (60 - minutes)
      minutesToEvent = Math.round(totalGameMinutesLeft / 7)

      nextEventText = `Закрытие в`
    }

    const cdHours = Math.floor(minutesToEvent / 60)
    const cdMins = minutesToEvent % 60
    const formattedCountdown = `${cdHours.toString().padStart(2, '0')}:${cdMins.toString().padStart(2, '0')}`

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
        formattedCountdown,
        realEventTime: new Date(Date.now() + minutesToEvent * 60 * 1000).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    }
  }

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
