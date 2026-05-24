import snapshot from './reading-snapshot.json'
import { expandSmallKana } from './expand-small-kana'
import { katakanaChunkToHiragana } from './katakana-to-hiragana'

const READING_MAP: ReadonlyMap<string, string> = new Map(
  Object.entries(snapshot as Record<string, string>),
)

/** Lookup pre-generated hiragana reading for a surface or lemma. */
export function lookupReadingHiragana(word: string): string | undefined {
  const hit = READING_MAP.get(word)
  if (hit) return expandSmallKana(hit)
  if (/^[\u30a1-\u30fa\u30fcー]+$/u.test(word)) {
    return expandSmallKana(
      katakanaChunkToHiragana(word).replace(/\u30fc/gu, 'ー'),
    )
  }
  return undefined
}
