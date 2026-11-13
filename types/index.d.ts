export type Track = { status: string; title: string; artist: string; app: string }

declare module 'claude-code' {
  interface PluginState {
    'now-playing': { track: Track | null; bars: number[]; isHidden: boolean }
  }
}
