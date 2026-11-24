import { expect, test } from 'claude-code/testing'

import { problems } from '../hooks/look'

test('Desktop will paint the look', () => {
  expect(problems.filter(line => line.startsWith("Desktop won't paint"))).toEqual([])
})

test('the look is set at session start', async ($, on) => {
  let sent: any
  on('session.start', (_: unknown, e: { cwd: string }) => ({ cwd: e.cwd }))
  on('theme.set', (_: unknown, e: any) => { sent = e; return { value: { isDrawn: true as const, requestId: 'r' } } })
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  expect(sent?.style?.UserMessage?.backgroundColor).toBe('#FFDD00')
})
