import { expect, test } from 'claude-code/testing'

import { holidays, local, statusLine } from '../hooks/calendar'

const at = (iso: string) => Date.parse(iso)
const names = (y: number) => holidays(y).map(h => `${h.m}-${h.d} ${h.name}`)

test('2026 Alberta holidays fall on the right dates', () => {
  expect(names(2026)).toEqual([
    "1-1 New Year's Day", '2-16 Family Day', '4-3 Good Friday', '5-18 Victoria Day',
    '7-1 Canada Day', '9-7 Labour Day', '10-12 Thanksgiving', '11-11 Remembrance Day', '12-25 Christmas Day',
  ])
})

test('2027 moving holidays', () => {
  expect(names(2027)).toContain('3-26 Good Friday')
  expect(names(2027)).toContain('5-24 Victoria Day')
  expect(names(2027)).toContain('2-15 Family Day')
})

test('Truth and Reconciliation Day is an open day', () => {
  // Wed Sept 30 2026, noon MDT
  expect(statusLine(at('2026-09-30T18:00:00Z'), 480, 1080)).toBe('Mechanical: open, closes 6:00 pm · closed Mon Oct 12 (Thanksgiving)')
})

test('Edmonton time follows daylight saving', () => {
  expect(local(at('2026-07-01T06:30:00Z')).d).toBe(1) // 00:30 MDT Jul 1
  expect(local(at('2026-01-01T06:30:00Z')).d).toBe(31) // 23:30 MST Dec 31
})

test('a stat holiday shows closed and when it reopens', () => {
  // Wed Nov 11 2026, 10:00 MST
  expect(statusLine(at('2026-11-11T17:00:00Z'), 480, 1080)).toBe('Mechanical: closed (Remembrance Day), back Thu Nov 12 8:00 am')
})

test('an upcoming weekday holiday is flagged', () => {
  // Fri Dec 18 2026, 10:00 MST; Christmas is Fri Dec 25
  expect(statusLine(at('2026-12-18T17:00:00Z'), 480, 1080)).toBe(
    'Mechanical: open, closes 6:00 pm · closed Fri Dec 25 (Christmas Day)',
  )
})

test('after close on Friday points to Monday', () => {
  // Fri Nov 27 2026, 19:00 MST
  expect(statusLine(at('2026-11-28T02:00:00Z'), 480, 1080)).toBe('Mechanical: closed for the day, opens Mon Nov 30 8:00 am')
})

test('with no hours set it says so', () => {
  expect(statusLine(at('2026-11-24T17:00:00Z'))).toBe('Mechanical: open today · set hours in /config')
})
