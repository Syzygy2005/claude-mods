import type { Register } from 'claude-code'

import { parseTime, statusLine } from './calendar'

export const register: Register = (on, options) => {
  const opensAt = parseTime(String(options.opensAt ?? ''))
  const closesAt = parseTime(String(options.closesAt ?? ''))

  on('session.start', async ($, e, next) => {
    const out = await next(e)
    const paint = async () => $.ui.status(statusLine(await $.clock.now(), opensAt, closesAt))
    await paint()
    $.clock.every(60_000, () => void paint())
    return out
  })
}
