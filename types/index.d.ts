export type Track = {
  status: string
  title: string
  artist: string
  app: string
  canPrev: boolean
  canNext: boolean
  canToggle: boolean
  canShuffle: boolean
  canRepeat: boolean
  shuffle: boolean
  repeat: string
}

declare module 'claude-code' {
  interface PluginState {
    'now-playing': { track: Shaped<Track | null>; bars: number[]; isHidden: boolean }
  }
}
