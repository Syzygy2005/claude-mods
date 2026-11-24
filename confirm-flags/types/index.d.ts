declare module 'claude-code' {
  interface PluginState {
    'confirm-flags': { flags: Shaped<string[]>; isHidden: Shaped<boolean> }
  }
}
export type Flag = string
