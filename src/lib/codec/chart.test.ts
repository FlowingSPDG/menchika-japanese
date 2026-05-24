import { describe, expect, it } from 'vitest'
import {
  CANONICAL_EMOJI_TO_HIRAGANA,
  CHART_PAIRS,
  CHART_ROW_LABELS,
  CHART_ROWS,
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

  it('CHART_ROWS groups あかさたな…わ行', () => {
    expect(CHART_ROW_LABELS).toEqual([
      'あ',
      'か',
      'さ',
      'た',
      'な',
      'は',
      'ま',
      'や',
      'ら',
      'わ',
    ])
    expect(CHART_ROWS.map((r) => r.length)).toEqual([5, 5, 5, 5, 5, 5, 5, 3, 5, 3])
    expect(CHART_ROWS.flat()).toEqual([...CHART_PAIRS])
  })

  it('れ maps to brick emoji', () => {
    expect(chartHiraganaToEmoji('れ')).toBe('🧱')
  })

  it('emoji map covers same keys as canonical', () => {
    const set = new Set(CANONICAL_EMOJI_TO_HIRAGANA.keys())
    for (const [, e] of CHART_PAIRS) expect(set.has(e)).toBe(true)
  })
})
