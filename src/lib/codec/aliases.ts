import { CANONICAL_EMOJI_TO_HIRAGANA, chartEmojiToHiragana } from './chart'

/** Extra emoji glyphs that decode to the same hiragana as canonical chart glyphs. */
export const ALIAS_EMOJI_TO_HIRAGANA: ReadonlyMap<string, string> = new Map([
  ['🦑', 'い'],
  ['😷', 'ま'],
  ['📕', 'ほ'],
  ['🍉', 'す'],
  ['🩸', 'ち'],
  ['🥁', 'た'],
  ['🚢', 'ふ'],
  ['✌️', 'に'],
  ['⛰️', 'ゃ'],
])

/** When encoding with dialectPrefer, pick these glyphs over canonical chart where defined. */
export const DIALECT_PREFERRED_HIRAGANA_TO_EMOJI: ReadonlyMap<string, string> = new Map([
  ['に', '✌️'],
  ['ん', 'NG'], // emitted as literal letters by encode layer (not an emoji)
])

/**
 * Decode: canonical chart first, then community aliases.
 */
export function resolveEmojiToHiragana(grapheme: string): string | undefined {
  return chartEmojiToHiragana(grapheme) ?? ALIAS_EMOJI_TO_HIRAGANA.get(grapheme)
}

/**
 * For validation: emoji that map to hiragana (chart ∪ aliases).
 */
export function decodeKnownEmojiAlphabet(): Iterable<string> {
  return new Set([...CANONICAL_EMOJI_TO_HIRAGANA.keys(), ...ALIAS_EMOJI_TO_HIRAGANA.keys()])
}
