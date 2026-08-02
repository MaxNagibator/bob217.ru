export const plural = (n: number, one: string, few: string, many: string): string => {
  const tail = n % 100
  if (tail > 10 && tail < 20) return many
  const last = n % 10
  if (last === 1) return one
  return last > 1 && last < 5 ? few : many
}

export const fmtSize = (kb: number): string =>
  kb >= 1024 ? `${(kb / 1024).toFixed(1)} МБ` : `${kb} КБ`

const DAY_MS = 86_400_000

export const ago = (iso: string): string => {
  if (!iso) return 'когда-то'
  const days = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / DAY_MS))
  if (days === 0) return 'сегодня'
  if (days === 1) return 'вчера'
  return `${days} ${plural(days, 'день', 'дня', 'дней')} назад`
}

export const fmtDate = (iso: string): string =>
  iso
    ? new Date(iso)
        .toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
        .replace(' г.', '')
    : ''
