import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import { flagsIn, short } from './flags'

const flags = atom({ plugin: 'confirm-flags', key: 'flags' } as const, [], { shape: 'flags-1' })
const isHidden = atom({ plugin: 'confirm-flags', key: 'isHidden' } as const, false, { shape: 'hidden-1' })

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'flags',
      description: 'List the open [CONFIRM] flags from the last reply',
    })
    return next(e)
  })

  on('command.run', { command: 'flags' }, async $ => {
    const list = await read($, flags)
    await update($, isHidden, () => false)
    return {
      text: list.length
        ? `Open [CONFIRM] flags:\n${list.map((f, i) => `${i + 1}. ${f}`).join('\n')}`
        : 'No open [CONFIRM] flags in the last reply.',
    }
  })

  // Each main-thread reply replaces the list: what it still flags is what is open.
  on('turn.complete', async ($, e, next) => {
    if (e.agentId !== undefined || e.isAborted) return next(e)
    const before = await read($, flags)
    const now = flagsIn(e.answer)
    await update($, flags, () => now)
    await update($, isHidden, () => false)
    if (before.length > 0 && now.length === 0) $.ui.toast('All [CONFIRM] flags cleared')
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const list = await read($, flags)
    if (e.props.hasSurvey || list.length === 0 || (await read($, isHidden))) return next(e)

    const { Box, Button, Text } = $.ui.resolve(e)
    return (
      <Box flexDirection="row" flexWrap="wrap" gap={1}>
        <Text color="warning" weight="bold">
          {list.length} open [CONFIRM] flag{list.length > 1 ? 's' : ''}:
        </Text>
        {list.map((flag, i) => (
          <Button
            key={`flag-${i}`}
            label={short(flag)}
            onPress={() => $.prompt.fill({ text: `${flag}: `, mode: 'append' })}
          />
        ))}
        <Button key="hide" label="Hide" dimColor onPress={() => update($, isHidden, () => true)} />
      </Box>
    )
  })
}
