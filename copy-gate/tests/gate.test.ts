import { expect, test } from 'claude-code/testing'

const DRAFT = 'mcp__Microsoft_365__outlook_create_draft'
const SKILLS = ['anthropic-skills:econolube-pricing', 'anthropic-skills:tire-quote-email']

async function start($: any, on: any) {
  on('command.register', () => ({ value: { command: 'copy-gate' } }))
  on('session.start', (_: unknown, e: { cwd: string }) => ({ cwd: e.cwd }))
  on('tool.call', () => ({ result: {} }))
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
}

async function loadSkills($: any) {
  for (const skill of SKILLS) await $.tool.call({ tool: 'Skill', skill })
}

function draft(body: string, subject = 'Your vehicle') {
  return { tool: DRAFT, to: ['customer@example.com'], subject, body, bodyType: 'text' }
}

test('a clean note passes', async ($, on) => {
  await start($, on)
  const r = await $.tool.call(draft('Hi Sam, your car is ready for pickup today. Give us a call when you are on your way.'))
  expect(r.deny).toBeUndefined()
})

test('an em-dash is refused', async ($, on) => {
  await start($, on)
  const r = await $.tool.call(draft('Hi Sam — your car is ready.'))
  expect(r.deny).toMatch(/em-dash/)
})

test('a spaced en dash is refused', async ($, on) => {
  await start($, on)
  const r = await $.tool.call(draft('Hi Sam – your car is ready.'))
  expect(r.deny).toMatch(/en dash/)
})

test('an open CONFIRM flag is refused', async ($, on) => {
  await start($, on)
  const r = await $.tool.call(draft('Brakes come to [CONFIRM: rear pad price] installed.'))
  expect(r.deny).toMatch(/CONFIRM/)
})

test('tire warranty language is refused even with skills loaded', async ($, on) => {
  await start($, on)
  await loadSkills($)
  const r = await $.tool.call(draft('These tires carry an 80,000 km warranty and come to $900 installed.'))
  expect(r.deny).toMatch(/warranty/)
})

test('a priced tire quote needs both skills', async ($, on) => {
  await start($, on)
  const before = await $.tool.call(draft('Four tires come to $900 installed.'))
  expect(before.deny).toMatch(/tire-quote-email/)
  expect(before.deny).toMatch(/econolube-pricing/)
  await loadSkills($)
  const after = await $.tool.call(draft('Four tires come to $900 installed.'))
  expect(after.deny).toBeUndefined()
})

test('the quoted original of a reply is not judged', async ($, on) => {
  await start($, on)
  const body = 'Hi Sam, your car is ready.\n\nFrom: Sam\nSent: Monday\nI want tires — with a warranty please.'
  const r = await $.tool.call({ tool: 'mcp__Microsoft_365__outlook_update_draft', messageId: 'abc', body, bodyType: 'text' })
  expect(r.deny).toBeUndefined()
})

test('the model cannot switch the gate off', async ($, on) => {
  await start($, on)
  const r = await $.command.run({ command: 'copy-gate', args: 'off', origin: { kind: 'plugin', name: 'other' } })
  expect(r.text).toMatch(/only Noah/)
  const still = await $.tool.call(draft('Hi — ready.'))
  expect(still.deny).toMatch(/em-dash/)
})

test('other tools are untouched', async ($, on) => {
  await start($, on)
  const r = await $.tool.call({ tool: 'Bash', command: 'echo —' })
  expect(r.deny).toBeUndefined()
})
