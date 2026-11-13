import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Track } from '../types'
import { SCRIPT, controlScript } from './script'
import type { ControlAction } from './script'

const NBARS = 16
const GLYPHS = ' ▁▂▃▄▅▆▇█'

const track = atom({ plugin: 'now-playing', key: 'track' } as const, null, { shape: 'track-2' })
const bars = atom({ plugin: 'now-playing', key: 'bars' } as const, [])
const isHidden = atom({ plugin: 'now-playing', key: 'isHidden' } as const, false)

// PowerShell -EncodedCommand wants base64 of UTF-16LE.
function encodeUtf16Base64(s: string): string {
  let bin = ''
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i)
    bin += String.fromCharCode(c & 0xff, c >> 8)
  }
  return btoa(bin)
}

function powershell(script: string): string[] {
  return ['powershell.exe', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', encodeUtf16Base64(script)]
}

function parseTrack(parts: string[]): Track | null {
  const [, status = 'none', title = '', artist = '', app = '', p = '0', n = '0', tg = '0', sh = '0', rp = '0', shOn = '', rpMode = ''] = parts
  if (status === 'none' || !title) return null
  return {
    status, title, artist, app,
    canPrev: p === '1', canNext: n === '1', canToggle: tg === '1',
    canShuffle: sh === '1', canRepeat: rp === '1',
    shuffle: shOn === 'True', repeat: rpMode || 'None',
  }
}

let current: Track | null = null

async function control($: EngineInterface, action: ControlAction) {
  // Optimistic flip so the button reacts before the next poll.
  if (current) {
    const t: Track = current
    const guess: Track =
      action === 'toggle' ? { ...t, status: t.status === 'Playing' ? 'Paused' : 'Playing' }
      : action === 'shuffle' ? { ...t, shuffle: !t.shuffle }
      : action === 'repeat' ? { ...t, repeat: t.repeat === 'List' ? 'Track' : t.repeat === 'Track' ? 'None' : 'List' }
      : t
    current = guess
    await update($, track, () => guess)
  }
  await $.process.run(powershell(controlScript(action)))
}

export const register: Register = on => {
  let peak = 0
  let lo = 1
  let hi = 0
  const levels: number[] = new Array(NBARS).fill(0)
  const weights: number[] = Array.from({ length: NBARS }, (_, i) => 0.55 + 0.45 * Math.sin((i / NBARS) * Math.PI))

  on('session.start', async ($, e, next) => {
    const started = await next(e)

    await $.command.register({ name: 'np', description: 'Mostrar u ocultar el visualizador de música' })

    // Reader: a long-lived PowerShell child streaming "P\t<peak>" and "M\t<status>\t<title>\t...".
    void (async () => {
      const child = $.process.spawn({ argv: powershell(SCRIPT) })
      let buf = ''
      for await (const { stream, text } of child) {
        if (stream !== 'stdout') continue
        buf += text
        const lines = buf.split(/\r?\n/)
        buf = lines.pop() ?? ''
        for (const line of lines) {
          const parts = line.split('\t')
          if (parts[0] === 'P') {
            peak = Number(parts[1]) || 0
          } else if (parts[0] === 'M') {
            const found = parseTrack(parts)
            if (JSON.stringify(found) !== JSON.stringify(current)) {
              current = found
              await update($, track, () => found)
            }
          }
        }
      }
    })()

    // Animation: ~10 fps. Peak is normalised against a slowly relaxing min/max so loud masters still move.
    $.clock.every(100, async () => {
      const playing = current?.status === 'Playing'
      lo = Math.min(peak, lo + 0.01)
      hi = Math.max(peak, hi - 0.01)
      const span = Math.max(hi - lo, 0.05)
      const energy = playing ? Math.min(1, Math.max(0, (peak - lo) / span) * 0.7 + peak * 0.3) : 0
      for (let i = 0; i < NBARS; i++) {
        const target = energy * (weights[i] ?? 1) * (0.45 + 0.55 * Math.random())
        levels[i] = target > (levels[i] ?? 0) ? target : (levels[i] ?? 0) * 0.7 + target * 0.3
      }
      await update($, bars, () => levels.map(v => Math.round(v * 8)))
    })

    return started
  })

  on('command.run', { command: 'np' }, async ($, e, next) => {
    const hidden = await read($, isHidden)
    await update($, isHidden, () => !hidden)
    return { text: hidden ? 'Visualizador visible' : 'Visualizador oculto' }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const t = await read($, track)
    if (e.props.hasSurvey || t === null || (await read($, isHidden))) {
      return next(e)
    }

    const { Box, Text, Button } = $.ui.resolve(e)
    const b = await read($, bars)
    const playing = t.status === 'Playing'
    const viz = Array.from({ length: NBARS }, (_, i) => GLYPHS[Math.min(8, Math.max(playing ? 1 : 0, b[i] ?? 0))]).join('')
    const repeatLabel = t.repeat === 'Track' ? 'rep 1' : 'rep'

    return (
      <Box>
        <Text color={playing ? 'green' : undefined} dimColor={!playing}>{viz} </Text>
        {t.canPrev ? <Button key="prev" label="|<" onPress={() => control($, 'prev')} /> : null}
        <Text> </Text>
        <Button key="toggle" label={playing ? '||' : '>'} onPress={() => control($, 'toggle')} />
        <Text> </Text>
        {t.canNext ? <Button key="next" label=">|" onPress={() => control($, 'next')} /> : null}
        {t.canShuffle ? <Text> </Text> : null}
        {t.canShuffle ? <Button key="shuffle" label="shuf" dimColor={!t.shuffle} onPress={() => control($, 'shuffle')} /> : null}
        {t.canRepeat ? <Text> </Text> : null}
        {t.canRepeat ? <Button key="repeat" label={repeatLabel} dimColor={t.repeat === 'None'} onPress={() => control($, 'repeat')} /> : null}
        <Text>  </Text>
        <Text bold dimColor={!playing}>{t.title}</Text>
        {t.artist ? <Text dimColor> — {t.artist}</Text> : null}
      </Box>
    )
  })
}
