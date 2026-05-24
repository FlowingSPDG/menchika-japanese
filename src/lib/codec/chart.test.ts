import { describe, expect, it } from 'vitest'
import {
  CANONICAL_EMOJI_TO_HIRAGANA,
  CHART_PAIRS,
  chartEmojiToHiragana,
  chartHiraganaToEmoji,
} from './chart'

describe('chart', () => {
  it('has 46 kana mappings', () => {
    expect(CHART_PAIRS).toHaveLength(46)
  })

  it('round-trips every chart pair (encode emoji -> decode hiragana)', () => {
    for (const [h, emoji] of CHART_PAIRS) {
      expect(chartHiraganaToEmoji(h)).toBe(emoji)
      expect(chartEmojiToHiragana(emoji)).toBe(h)
    }
  })

  it('emoji map covers same keys as canonical', () => {
    const set = new Set(CANONICAL_EMOJI_TO_HIRAGANA.keys())
    for (const [, e] of CHART_PAIRS) expect(set.has(e)).toBe(true)
  })
})
