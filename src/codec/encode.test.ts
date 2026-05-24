import { describe, expect, it } from 'vitest'
import { analyzeKanaGrapheme, encodeHiraganaToEmoji } from './encode'

describe('encodeHiraganaToEmoji', () => {
  it('canonical round-trip for simple mora（あ）', () => {
    const { emoji } = encodeHiraganaToEmoji('あ')
    expect(emoji).toBe('🐜')
  })

  it('adds ascii quote after voiced mora（だ）', () => {
    const { emoji, warnings } = encodeHiraganaToEmoji('だ')
    expect(warnings).toHaveLength(0)
    expect(emoji).toBe('🐙"')
  })

  it('adds period for hand row（ぷ）', () => {
    expect(encodeHiraganaToEmoji('ぷ').emoji).toBe('🦩。')
  })

  it('emits NG literal when option set', () => {
    expect(encodeHiraganaToEmoji('ん', { ngAsLiteral: true }).emoji).toBe('NG')
    expect(encodeHiraganaToEmoji('ん', {}).emoji).toBe('😐')
  })

  it('Dialect: にゃん → ✌️⛰️NG（方言＋ NG）', () => {
    const { emoji, warnings } = encodeHiraganaToEmoji('にゃん', {
      dialectPrefer: true,
      ngAsLiteral: true,
    })
    expect(warnings).toHaveLength(0)
    expect(emoji).toBe('✌️⛰️NG')
  })

  it('Dialect: い uses squid', () => {
    const { emoji } = encodeHiraganaToEmoji('い', { dialectPrefer: true })
    expect(emoji).toBe('🦑')
  })

  it('Dialect: base だ uses drum + quote', () => {
    expect(encodeHiraganaToEmoji('だ', { dialectPrefer: true }).emoji).toBe('🥁"')
  })
})

describe('analyzeKanaGrapheme', () => {
  it('parses が', () => {
    expect(analyzeKanaGrapheme('が')).toEqual({
      base: 'か',
      tone: 'voice',
    })
  })
})
