import { describe, expect, it } from 'vitest'
import { decodeEmojiText } from './decode'

describe('decodeEmojiText', () => {
  it('decodes nyan sequence without special cases', () => {
    const { hiragana, warnings } = decodeEmojiText('✌️⛰️NG')
    expect(hiragana).toBe('にゃん')
    expect(warnings).toHaveLength(0)
  })

  it('decodes full thread-style golden string', () => {
    const q = String.fromCharCode(34) // ASCII quote (VOICE marker)
    const input = `🦑😷😷4${q}🍎📕✌️⛰️NG🍉🌳🥁${q}4🦑🩸🦷${q}NG🥁🦑🚢。`
    const { hiragana, warnings } = decodeEmojiText(input)
    expect(hiragana).toBe('いままじりほにゃんすきだしいちばんたいぷ')
    expect(warnings).toHaveLength(0)
  })

  it('decodes literal NG and 4-shi patterns', () => {
    const q = String.fromCharCode(34)
    expect(decodeEmojiText('NG').hiragana).toBe('ん')
    expect(decodeEmojiText(`4${q}`).hiragana).toBe('じ')
    // " は濁点、4 は し（文頭だと先行モーラ無しで警告のみ）
    const atStart = decodeEmojiText(`${q}4`)
    expect(atStart.hiragana).toBe('し')
    expect(atStart.warnings.some((w) => w.includes('先行'))).toBe(true)
    expect(decodeEmojiText('4').hiragana).toBe('し')
  })
})
