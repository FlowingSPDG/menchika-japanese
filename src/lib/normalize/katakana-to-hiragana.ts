/** Katakana (full-width) → hiragana; leaves ー and non-katakana as-is. */

const K_START = 0x30a1
/** ヺ (0x30fa) is last standard katakana in main block */
const K_LAST_SYLLABLE = 0x30fa

export function katakanaChunkToHiragana(chunk: string): string {
  let out = ''
  for (let i = 0; i < chunk.length; ) {
    const cp = chunk.codePointAt(i)!
    const step = cp > 0xffff ? 2 : 1
    let h = cp
    if (cp >= K_START && cp <= K_LAST_SYLLABLE) {
      h = cp - 0x60
    }
    out += String.fromCodePoint(h)
    i += step
  }
  return out
}
