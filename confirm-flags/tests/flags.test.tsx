import { expect, test } from 'claude-code/testing'

const BAND = { plugin: 'confirm-flags', component: 'AbovePrompt', props: { hasSurvey: false } } as const

async function start($: any, on: any) {
  on('command.register', () => ({ value: { command: 'flags' } }))
  on('session.start', (_: unknown, e: { cwd: string }) => ({ cwd: e.cwd }))
  on('turn.complete', (_: unknown, e: { answer: string }) => ({ text: e.answer }))
  on('prompt.fill', () => ({ isFilled: true }))
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
}

function reply(answer: string) {
  return { answer, durationMs: 10, isAborted: false, turnId: 't', reason: 'answer' as const }
}

test('a reply with flags shows them in the band', async ($, on) => {
  await start($, on)
  await $.turn.complete(reply('Pads [CONFIRM: rear pad price] and [CONFIRM: labour time]. Again [CONFIRM: labour time].'))
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...BAND, surface } as any)
    expect((await ui.find({ type: 'Text', text: /open/ }))?.text).toBe('2 open [CONFIRM] flags:')
    expect(await ui.find({ type: 'Button', key: 'flag-1' })).toBeDefined()
    await ui.unmount()
  }
})

test('a clean reply clears the band', async ($, on) => {
  await start($, on)
  await $.turn.complete(reply('Rotation [CONFIRM: tread depth RF].'))
  await $.turn.complete(reply('All set.'))
  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' } as any)
  expect(await ui.find({ type: 'Text', text: /open/ })).toBeUndefined()
  await ui.unmount()
})

test('/flags lists them', async ($, on) => {
  await start($, on)
  await $.turn.complete(reply('[CONFIRM: DOT date]'))
  const r = await $.command.run({ command: 'flags', args: '', origin: { kind: 'composer' } } as any)
  expect(r.text).toMatch(/1\. DOT date/)
})
