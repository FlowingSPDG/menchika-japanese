import { describe, expect, it } from 'vitest'
import { decodeEmojiText } from './decode'

describe('decodeEmojiText', () => {
  it('decodes nyan sequence (会話一覧)', () => {
    const { hiragana, warnings } = decodeEmojiText('✌️🗻🆖')
    expect(hiragana).toBe('にやん')
    expect(warnings).toHaveLength(0)
  })

  it('decodes full thread-style golden string', () => {
    const q = String.fromCharCode(34)
    const input = `🦑😷😷4️⃣${q}🍎📕✌️🗻🆖🍉🌳🥁${q}4️⃣🦑🩸🦷${q}🆖🥁🦑🚢。`
    const { hiragana, warnings } = decodeEmojiText(input)
    expect(hiragana).toBe('いままじりほにやんすきだしいちばんたいぷ')
    expect(warnings).toHaveLength(0)
  })

  it('decodes さ as 🈂️ and NFKC form サ️', () => {
    expect(decodeEmojiText('🈂️').hiragana).toBe('さ')
    expect(decodeEmojiText('🈂️').warnings).toHaveLength(0)
    expect(decodeEmojiText('サ\uFE0F').hiragana).toBe('さ')
    expect(decodeEmojiText('サ\uFE0F').warnings).toHaveLength(0)
  })

  it('preserves line breaks between emoji', () => {
    const { hiragana, warnings } = decodeEmojiText('🍨\n🦑')
    expect(hiragana).toBe('あ\nい')
    expect(warnings).toHaveLength(0)
  })

  it('decodes literal NG and 4️⃣-shi patterns', () => {
    const q = String.fromCharCode(34)
    expect(decodeEmojiText('NG').hiragana).toBe('ん')
    expect(decodeEmojiText(`4️⃣${q}`).hiragana).toBe('じ')
    const atStart = decodeEmojiText(`${q}4️⃣`)
    expect(atStart.hiragana).toBe('し')
    expect(atStart.warnings.some((w) => w.includes('先行'))).toBe(true)
    expect(decodeEmojiText('4️⃣').hiragana).toBe('し')
  })
})
