import { describe, expect, it } from 'vitest'
import { widenToHiragana, containsKanji, toHiragana } from './to-hiragana'

describe('widenToHiragana / containsKanji', () => {
  it('detects Kanji', () => {
    expect(containsKanji('好')).toBe(true)
    expect(containsKanji('ひら')).toBe(false)
  })

  it('converts kata to hira without kanji trigger', () => {
    expect(widenToHiragana('スキ')).toBe('すき')
  })

  it('keeps Hiragana as-is when no kata', () => {
    expect(widenToHiragana('すき')).toBe('すき')
  })
})

/** Suzume（WASM）はブラウザ / vite preview で検証。CI の jsdom では省略。 */
