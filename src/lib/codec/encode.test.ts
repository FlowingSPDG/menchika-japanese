import { describe, expect, it } from 'vitest'
import { analyzeKanaGrapheme, encodeHiraganaToEmoji } from './encode'

describe('encodeHiraganaToEmoji', () => {
  it('canonical round-trip for simple mora（あ）', () => {
    const { emoji } = encodeHiraganaToEmoji('あ')
    expect(emoji).toBe('🍨')
  })

  it('adds ascii quote after voiced mora（だ）', () => {
    const { emoji, warnings } = encodeHiraganaToEmoji('だ')
    expect(warnings).toHaveLength(0)
    expect(emoji).toBe('🥁"')
  })

  it('adds period for hand row（ぷ）', () => {
    expect(encodeHiraganaToEmoji('ぷ').emoji).toBe('🚢。')
  })

  it('emits NG literal when option set', () => {
    expect(encodeHiraganaToEmoji('ん', { ngAsLiteral: true }).emoji).toBe('NG')
    expect(encodeHiraganaToEmoji('ん', {}).emoji).toBe('🆖')
  })

  it('にゃん → にやん として ✌️🗻🆖（小書き→通常かな）', () => {
    const { emoji, warnings } = encodeHiraganaToEmoji('にゃん')
    expect(warnings).toHaveLength(0)
    expect(emoji).toBe('✌️🗻🆖')
  })

  it('にゃん + ngAsLiteral → ✌️🗻NG', () => {
    const { emoji } = encodeHiraganaToEmoji('にゃん', { ngAsLiteral: true })
    expect(emoji).toBe('✌️🗻NG')
  })

  it('い uses squid from chart', () => {
    expect(encodeHiraganaToEmoji('い').emoji).toBe('🦑')
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
