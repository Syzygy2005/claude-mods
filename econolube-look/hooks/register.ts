import type { Register } from 'claude-code'

import { LOOK, PLAIN, problems } from './look'

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const out = await next(e)
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))
    if (unpainted !== undefined) $.ui.log(`econolube-look: ${unpainted}`)

    try {
      const set = await $.theme.set(LOOK)
      if (!set.isDrawn) $.ui.log(`econolube-look: ${set.reason}`)
    } catch (error) {
      // An older app that does not take `style` still gets the colours.
      $.ui.log(`econolube-look: ${String(error)}`)
      await $.theme.set(PLAIN)
    }
    return out
  })
}
