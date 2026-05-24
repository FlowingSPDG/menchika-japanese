import { expandSmallKana } from './expand-small-kana'
import { katakanaChunkToHiragana } from './katakana-to-hiragana'
import { lookupReadingHiragana } from './reading-snapshot'

type Segment = { kind: 'kana' | 'other'; text: string }

function isKanaChar(ch: string): boolean {
  return /^[\u3040-\u309f\u30a0-\u30ffー]$/u.test(ch)
}

function isKanjiChar(ch: string): boolean {
  return /[\u4e00-\u9fff々〆〇]/u.test(ch)
}

/** Split into kana runs vs kanji / other runs. */
export function segmentKanaKanji(text: string): Segment[] {
  const seg = new Intl.Segmenter('ja', { granularity: 'grapheme' })
  const segments: Segment[] = []
  let buf = ''
  let kind: 'kana' | 'other' | null = null

  const flush = () => {
    if (buf) segments.push({ kind: kind!, text: buf })
    buf = ''
    kind = null
  }

  for (const part of seg.segment(text)) {
    const ch =
      typeof part.segment === 'string' ? part.segment : String(part.segment ?? '')
    const nextKind: 'kana' | 'other' = isKanaChar(ch) ? 'kana' : 'other'
    if (kind !== null && kind !== nextKind) flush()
    kind = nextKind
    buf += ch
  }
  flush()
  return segments
}

function kanaRunToHiragana(run: string): string {
  return expandSmallKana(katakanaChunkToHiragana(run).replace(/\u30fc/gu, 'ー'))
}

/** Longest-match lookup against reading snapshot (UTF-16 safe via graphemes). */
export function greedyReadingLookup(word: string): string | undefined {
  const direct = lookupReadingHiragana(word)
  if (direct) return direct

  const graphemes = [
    ...new Intl.Segmenter('ja', { granularity: 'grapheme' }).segment(word),
  ].map((p) =>
    typeof p.segment === 'string' ? p.segment : String(p.segment ?? ''),
  )

  let out = ''
  let i = 0
  while (i < graphemes.length) {
    let matched = false
    const maxLen = Math.min(12, graphemes.length - i)
    for (let len = maxLen; len >= 1; len--) {
      const sub = graphemes.slice(i, i + len).join('')
      const hit = lookupReadingHiragana(sub)
      if (hit) {
        out += hit
        i += len
        matched = true
        break
      }
    }
    if (!matched) {
      const ch = graphemes[i]!
      if (isKanaChar(ch)) {
        out += kanaRunToHiragana(ch)
        i++
        continue
      }
      if (!isKanjiChar(ch)) {
        out += ch
        i++
        continue
      }
      return undefined
    }
  }
  return out
}

/** Build hiragana from a surface that may mix kanji and kana. */
export function readingFromMixedSurface(
  surface: string,
  baseForm?: string,
): string | undefined {
  const whole =
    lookupReadingHiragana(surface) ??
    (baseForm ? lookupReadingHiragana(baseForm) : undefined) ??
    greedyReadingLookup(surface) ??
    (baseForm ? greedyReadingLookup(baseForm) : undefined)
  if (whole) return whole

  let out = ''
  for (const { kind, text } of segmentKanaKanji(surface)) {
    if (kind === 'kana') {
      out += kanaRunToHiragana(text)
      continue
    }
    const chunk = greedyReadingLookup(text)
    if (chunk === undefined) return undefined
    out += chunk
  }
  return out
}
