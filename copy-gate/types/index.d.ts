declare module 'claude-code' {
  interface PluginState {
    'copy-gate': { skills: Shaped<string[]>; paused: Shaped<boolean> }
  }
}
export {}
