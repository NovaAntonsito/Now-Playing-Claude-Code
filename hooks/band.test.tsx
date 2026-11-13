import { expect, test } from 'claude-code/testing'

const T = { status: 'Playing', title: 'November', artist: 'PPC', app: 'x', canPrev: true, canNext: true, canToggle: true, canShuffle: false, canRepeat: false, shuffle: false, repeat: 'None' }

test('band draws track and buttons', async ($, on) => {
  on('state.get', (_, e: any) => {
    if (e.key === 'track') return { value: { value: { shape: 'track-2', value: T }, version: 1 } }
    if (e.key === 'bars') return { value: { value: [1, 2, 3], version: 1 } }
    return { value: { value: false, version: 1 } }
  })
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'now-playing', surface, component: 'AbovePrompt', requestId: 'x', props: { hasSurvey: false, bodyColumns: 100 } as any })
    const title = await ui.find({ type: 'Text', text: /November/ })
    expect(title?.text).toBe('November')
    await ui.unmount()
  }
})
