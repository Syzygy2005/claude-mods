import type { ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'

// Brand colours, from the EconoLube Brand Identity Guidelines (via the
// econolube-brand skill). These three are the only brand values here.
export const YELLOW = '#FFDD00'
export const BLUE = '#2FB3C7'
export const CHARCOAL = '#4D4D4F'

// The grays below are neutral surfaces, not brand colours: dark mode follows
// the guide's "screen runs dark" scheme (near-black ground, white text), light
// mode its paperwork scheme (white ground, Charcoal text). danger, success and
// pro are left to the app so red still means red.
export const { theme, problems } = makeColors({
  label: 'Econolube',
  roles: { accent: BLUE, warning: YELLOW },
  light: {
    gray: {
      anchors: {
        'surface-0': '#f3f3f3',
        'surface-1': '#f8f8f8',
        'surface-2': '#ffffff',
        'surface-3': '#ffffff',
        'text-primary': CHARCOAL,
        'text-secondary': '#555557',
        'text-muted': '#616163',
      },
    },
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#0d0d0e',
        'surface-1': '#161617',
        'surface-2': '#1e1e1f',
        'surface-3': '#252526',
        'text-primary': '#ffffff',
        'text-secondary': '#d9d9da',
        'text-muted': '#a9a9ab',
      },
    },
  },
})

const BASE: ThemeSetArgs = { colors: theme }

// Your messages sit on a Yellow band with Charcoal type (6.26:1 per the guide),
// which is the guide's "Yellow as a fill" in both modes. Yellow never carries text.
export const LOOK: ThemeSetArgs = {
  ...BASE,
  style: {
    Text: { fontFamily: ['sans'] },
    Heading: { fontFamily: ['sans'], fontWeight: 'bold' },
    UserMessage: { backgroundColor: YELLOW, color: CHARCOAL, radius: 6, paddingX: 14, paddingY: 10 },
  },
}

export const PLAIN = BASE
