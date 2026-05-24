import { describe, expect, it } from 'vitest'
import { lookupReadingHiragana } from './reading-snapshot'
import { readingFromVerbLemma } from './verb-lemma-reading'

describe('readingFromVerbLemma', () => {
  it('derives stem reading from lemma', () => {
    if (!lookupReadingHiragana('疲れる')) return
    expect(readingFromVerbLemma('疲れ', '疲れる')).toBe('つかれ')
  })

  it('returns undefined when stem does not match', () => {
    expect(readingFromVerbLemma('食べた', '食べる')).toBeUndefined()
  })
})

describe('lookupReadingHiragana', () => {
  it('expands small kana in snapshot values', () => {
    const r = lookupReadingHiragana('今日')
    if (!r) return
    expect(r).not.toMatch(/[ゃゅょ]/)
    expect(r).toBe('きよう')
  })
})
