import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import { bareSkill, draftOf, problems } from './rules'

const skills = atom({ plugin: 'copy-gate', key: 'skills' } as const, [], { shape: 'skills-1' })
const paused = atom({ plugin: 'copy-gate', key: 'paused' } as const, false, { shape: 'paused-1' })

const remember = ($: EngineInterface, name: string) =>
  update($, skills, list => (list.includes(bareSkill(name)) ? list : [...list, bareSkill(name)]))

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'copy-gate',
      description: 'Customer-copy gate: /copy-gate off, on, or status',
      argumentHint: '[off|on|status]',
    })
    return next(e)
  })

  // Only the person can switch the gate off: a command the model or another
  // plugin raises is refused.
  on('command.run', { command: 'copy-gate' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    const byPerson = e.origin?.kind === 'composer' || e.origin?.kind === 'bridge'
    if ((arg === 'off' || arg === 'on') && !byPerson)
      return { text: 'copy-gate: only Noah can switch the gate from the prompt.' }

    if (arg === 'off') {
      await update($, paused, () => true)
      $.ui.status('copy-gate OFF')
      return { text: 'Copy gate is off for this session. /copy-gate on turns it back on.' }
    }
    if (arg === 'on') {
      await update($, paused, () => false)
      $.ui.status(undefined)
      return { text: 'Copy gate is on.' }
    }
    const isOff = await read($, paused)
    const list = await read($, skills)
    return {
      text: `Copy gate is ${isOff ? 'OFF' : 'on'}. Skills loaded this session: ${list.length ? list.join(', ') : 'none'}.`,
    }
  })

  // Note which skills have loaded, both when a skill's prompt is computed and
  // when the Skill tool succeeds.
  on('skill.prompt', async ($, e, next) => {
    const out = await next(e)
    await remember($, e.skill)
    return out
  })

  on('tool.call', async ($, e, next) => {
    if (e.tool === 'Skill') {
      const ran = await next(e)
      const name = (e as { skill?: unknown }).skill
      if (typeof name === 'string' && ran.deny === undefined && ran.isError !== true)
        await remember($, name)
      return ran
    }

    const draft = draftOf(e.tool, e as Record<string, unknown>)
    if (!draft || (await read($, paused))) return next(e)

    const found = problems(draft, await read($, skills))
    if (found.length === 0) return next(e)

    $.ui.toast(`Copy gate stopped a draft: ${found.length} problem${found.length > 1 ? 's' : ''}`)
    return {
      deny:
        `copy-gate refused this draft. Fix every point, then try again:\n- ${found.join('\n- ')}\n` +
        'If this is not customer mail (a supplier or a coworker), ask Noah to type /copy-gate off.',
    }
  }).catch(($, e, next) =>
    next.called ? next(e) : { deny: 'copy-gate: its check failed, so the draft was held. Ask Noah to type /copy-gate off if this repeats.' },
  )
}
