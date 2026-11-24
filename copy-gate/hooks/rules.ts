// Pure checks for customer-facing mail. No engine calls here, so tests can
// feed them text directly.

export type Draft = { subject: string; body: string }

const EM_DASH = /—|&mdash;|&#8212;|&#x2014;/i
// An en dash or a double hyphen with spaces round it is an em dash in disguise.
const FAKE_EM_DASH = / (–|&ndash;|&#8211;|--) /i
const CONFIRM = /\[CONFIRM\b/i
const TIRE = /\b(tires?|tyres?)\b/i
const WARRANTY =
  /warrant|tread ?(life|wear) (guarantee|promise|protection)|mileage (guarantee|promise|protection)|road ?hazard/i
const PRICE = /\$\s?\d/

// Where a reply's quoted original starts. Anything from here down is the
// customer's text or an earlier message, not ours, so it is not judged.
const QUOTE_STARTS = [
  /<div[^>]*id=["']?divRplyFwdMsg/i,
  /<hr\b/i,
  /-{2,}\s*Original Message\s*-{2,}/i,
  /^\s*From:\s.+$/im,
  /^On .+ wrote:\s*$/im,
]

export function ownText(body: string): string {
  let cut = body.length
  for (const re of QUOTE_STARTS) {
    const at = body.search(re)
    if (at >= 0 && at < cut) cut = at
  }
  return body.slice(0, cut)
}

export const SKILL_TIRE = 'tire-quote-email'
export const SKILL_PRICING = 'econolube-pricing'

/** The skill's bare name, with any `plugin:` prefix removed. */
export function bareSkill(name: string): string {
  const i = name.lastIndexOf(':')
  return (i >= 0 ? name.slice(i + 1) : name).trim().toLowerCase()
}

/** Every reason this draft must not go out; empty when it passes. */
export function problems(draft: Draft, loadedSkills: readonly string[]): string[] {
  const text = `${draft.subject}\n${ownText(draft.body)}`
  const loaded = new Set(loadedSkills.map(bareSkill))
  const out: string[] = []

  if (EM_DASH.test(text)) out.push('It contains an em-dash. Rewrite the sentence without one.')
  if (FAKE_EM_DASH.test(text))
    out.push('It uses a spaced en dash or "--" as an em-dash. Rewrite the sentence without one.')
  if (CONFIRM.test(text))
    out.push('It still has a [CONFIRM: ...] flag. Get the real number from Noah before drafting.')

  const tires = TIRE.test(text)
  if (tires && WARRANTY.test(text))
    out.push('It mentions tires and uses warranty or mileage-guarantee language. Remove it entirely.')

  const priced = PRICE.test(text)
  if (tires && priced && !loaded.has(SKILL_TIRE))
    out.push(`It is a tire quote but the ${SKILL_TIRE} skill was not loaded this session. Load it and redo the draft, or tell Noah it would not load.`)
  if (priced && !loaded.has(SKILL_PRICING))
    out.push(`It has a dollar figure but the ${SKILL_PRICING} skill was not loaded this session. Load it and check every shop price, or tell Noah it would not load.`)

  return out
}

/** The tools that put words in front of a customer, and how to read each. */
export function draftOf(tool: string, e: Record<string, unknown>): Draft | undefined {
  const s = (v: unknown) => (typeof v === 'string' ? v : '')
  const name = tool.replace(/^mcp__[^_]+(?:_[^_]+)*?__/, '')
  if (!tool.startsWith('mcp__')) return undefined

  switch (name) {
    case 'outlook_create_draft':
    case 'outlook_send_mail':
    case 'outlook_update_draft':
    case 'create_draft': // Gmail
      return { subject: s(e.subject), body: s(e.body) }
    case 'outlook_create_reply_draft':
    case 'outlook_create_reply_all_draft':
      return { subject: '', body: s(e.body) || s(e.comment) }
    case 'outlook_forward_mail':
      return { subject: '', body: s(e.comment) }
    default:
      return undefined
  }
}
