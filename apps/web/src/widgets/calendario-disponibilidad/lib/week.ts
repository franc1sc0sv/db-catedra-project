export interface WeekRange {
  iso:      string
  dateFrom: string
  dateTo:   string
  days:     string[]
}

const DAY_MS = 24 * 60 * 60 * 1000

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

function toIsoDate(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
}

function getMondayOfWeek(year: number, week: number): Date {
  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7))
  const day = simple.getUTCDay()
  const monday = new Date(simple)
  if (day <= 4) {
    monday.setUTCDate(simple.getUTCDate() - simple.getUTCDay() + 1)
  } else {
    monday.setUTCDate(simple.getUTCDate() + 8 - simple.getUTCDay())
  }
  return monday
}

function getIsoWeek(date: Date): { year: number; week: number } {
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const dayNumber = (target.getUTCDay() + 6) % 7
  target.setUTCDate(target.getUTCDate() - dayNumber + 3)
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4))
  const diff = target.getTime() - firstThursday.getTime()
  const week = 1 + Math.round(diff / (7 * DAY_MS))
  return { year: target.getUTCFullYear(), week }
}

export function parseWeekParam(input: string | undefined): WeekRange {
  let year: number
  let week: number
  const match = input?.match(/^(\d{4})-W?(\d{1,2})$/)
  if (match) {
    year = Number(match[1])
    week = Number(match[2])
  } else {
    const today = new Date()
    const { year: y, week: w } = getIsoWeek(today)
    year = y
    week = w
  }

  const monday = getMondayOfWeek(year, week)
  const days: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday.getTime() + i * DAY_MS)
    days.push(toIsoDate(d))
  }
  const dateFrom = days[0]!
  const sunday = new Date(monday.getTime() + 7 * DAY_MS)
  const dateTo = toIsoDate(sunday)

  return {
    iso: `${year}-W${pad(week)}`,
    dateFrom,
    dateTo,
    days,
  }
}

export function shiftWeek(iso: string, delta: number): string {
  const match = iso.match(/^(\d{4})-W(\d{2})$/)
  if (!match) return iso
  const year = Number(match[1])
  const week = Number(match[2])
  const monday = getMondayOfWeek(year, week)
  const shifted = new Date(monday.getTime() + delta * 7 * DAY_MS)
  const { year: ny, week: nw } = getIsoWeek(shifted)
  return `${ny}-W${pad(nw)}`
}

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export function dayLabel(index: number): string {
  return DAY_LABELS[index] ?? ''
}

export function formatDateLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return `${pad(d)}/${pad(m)}`
}

export function formatTime(value: string): string {
  return value.slice(0, 5)
}
