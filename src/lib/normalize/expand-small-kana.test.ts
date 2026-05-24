import { describe, expect, it } from 'vitest'
import { expandSmallKana } from './expand-small-kana'

describe('expandSmallKana', () => {
  it('expands 拗音小書き', () => {
    expect(expandSmallKana('にゃん')).toBe('にやん')
    expect(expandSmallKana('きゅう')).toBe('きゆう')
    expect(expandSmallKana('しょく')).toBe('しよく')
  })

  it('leaves 促音', () => {
    expect(expandSmallKana('まって')).toBe('まって')
  })

  it('expands katakana small', () => {
    expect(expandSmallKana('キャット')).toBe('キヤット')
  })
})
