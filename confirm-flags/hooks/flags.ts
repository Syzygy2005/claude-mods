// Pulls every [CONFIRM: ...] flag out of a reply, in order, without repeats.
export function flagsIn(text: string): string[] {
  const found: string[] = []
  for (const m of text.matchAll(/\[CONFIRM:\s*([^\]\n]+?)\s*\]/gi)) {
    const what = (m[1] ?? '').trim()
    if (what && !found.includes(what)) found.push(what)
  }
  return found
}

export function short(text: string, max = 40): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`
}
