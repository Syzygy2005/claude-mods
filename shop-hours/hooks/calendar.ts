// Alberta statutory (general) holidays and Edmonton local time, with no Intl:
// the mod runtime is not promised a time zone database.
//
// The nine Alberta general holidays under the Employment Standards Code.
// National Day for Truth and Reconciliation (Sept 30) is not one, and the
// mechanical side is open that day. Optional holidays (Easter Monday, Heritage
// Day, Boxing Day) are left out until the shop confirms it closes on them.

export type Holiday = { y: number; m: number; d: number; name: string }

const DAY = 86_400_000

function nthWeekday(y: number, m: number, weekday: number, n: number): number {
  const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay()
  return 1 + ((weekday - first + 7) % 7) + (n - 1) * 7
}

function easter(y: number): { m: number; d: number } {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  return { m: month, d: ((h + l - 7 * m + 114) % 31) + 1 }
}

export function holidays(y: number): Holiday[] {
  const e = easter(y)
  const gf = new Date(Date.UTC(y, e.m - 1, e.d) - 2 * DAY)
  // Victoria Day: the Monday before May 25, so May 18 to 24.
  const victoria = 24 - ((new Date(Date.UTC(y, 4, 24)).getUTCDay() + 6) % 7)
  return [
    { y, m: 1, d: 1, name: "New Year's Day" },
    { y, m: 2, d: nthWeekday(y, 2, 1, 3), name: 'Family Day' },
    { y, m: gf.getUTCMonth() + 1, d: gf.getUTCDate(), name: 'Good Friday' },
    { y, m: 5, d: victoria, name: 'Victoria Day' },
    { y, m: 7, d: 1, name: 'Canada Day' },
    { y, m: 9, d: nthWeekday(y, 9, 1, 1), name: 'Labour Day' },
    { y, m: 10, d: nthWeekday(y, 10, 1, 2), name: 'Thanksgiving' },
    { y, m: 11, d: 11, name: 'Remembrance Day' },
    { y, m: 12, d: 25, name: 'Christmas Day' },
  ]
}

// Mountain Time: UTC-6 from the 2nd Sunday of March 2:00 to the 1st Sunday of
// November 2:00 local, else UTC-7.
export function edmontonOffsetHours(utcMs: number): number {
  const y = new Date(utcMs).getUTCFullYear()
  const start = Date.UTC(y, 2, nthWeekday(y, 3, 0, 2), 9) // 2:00 MST = 09:00 UTC
  const end = Date.UTC(y, 10, nthWeekday(y, 11, 0, 1), 8) // 2:00 MDT = 08:00 UTC
  return utcMs >= start && utcMs < end ? -6 : -7
}

export type Local = { y: number; m: number; d: number; weekday: number; minutes: number }

export function local(utcMs: number): Local {
  const t = new Date(utcMs + edmontonOffsetHours(utcMs) * 3_600_000)
  return {
    y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate(),
    weekday: t.getUTCDay(), minutes: t.getUTCHours() * 60 + t.getUTCMinutes(),
  }
}

function addDays(l: Local, n: number): Local {
  const t = new Date(Date.UTC(l.y, l.m - 1, l.d) + n * DAY)
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate(), weekday: t.getUTCDay(), minutes: 0 }
}

export function holidayOn(l: Local): Holiday | undefined {
  return holidays(l.y).find(h => h.m === l.m && h.d === l.d)
}

function isOpenDay(l: Local): boolean {
  return l.weekday >= 1 && l.weekday <= 5 && !holidayOn(l)
}

const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const dayName = (l: Local) => `${WD[l.weekday]} ${MO[l.m - 1]} ${l.d}`

export function parseTime(s: string): number | undefined {
  const m = /^\s*(\d{1,2}):(\d{2})\s*$/.exec(s)
  if (!m) return undefined
  const h = Number(m[1]), min = Number(m[2])
  return h < 24 && min < 60 ? h * 60 + min : undefined
}

function clock12(minutes: number): string {
  const h = Math.floor(minutes / 60), m = minutes % 60
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`
}

function nextOpen(l: Local): Local {
  for (let i = 1; i <= 10; i++) {
    const n = addDays(l, i)
    if (isOpenDay(n)) return n
  }
  return addDays(l, 1)
}

export function statusLine(utcMs: number, opensAt?: number, closesAt?: number): string {
  const today = local(utcMs)
  const hasHours = opensAt !== undefined && closesAt !== undefined && opensAt < closesAt
  const hol = holidayOn(today)
  let main: string

  if (!isOpenDay(today)) {
    const why = hol ? hol.name : 'weekend'
    const back = nextOpen(today)
    main = `Mechanical: closed (${why}), back ${dayName(back)}${hasHours ? ` ${clock12(opensAt!)}` : ''}`
  } else if (!hasHours) {
    main = 'Mechanical: open today'
  } else if (today.minutes < opensAt!) {
    main = `Mechanical: opens ${clock12(opensAt!)}`
  } else if (today.minutes < closesAt!) {
    main = `Mechanical: open, closes ${clock12(closesAt!)}`
  } else {
    main = `Mechanical: closed for the day, opens ${dayName(nextOpen(today))} ${clock12(opensAt!)}`
  }

  // A weekday holiday in the next two weeks is worth seeing before you book.
  for (let i = 1; i <= 14; i++) {
    const n = addDays(today, i)
    const h = holidayOn(n)
    if (h && n.weekday >= 1 && n.weekday <= 5) {
      main += ` · closed ${dayName(n)} (${h.name})`
      break
    }
  }
  return hasHours ? main : `${main} · set hours in /config`
}
