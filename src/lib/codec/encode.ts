import { expandSmallKana } from '../normalize/expand-small-kana'
import { chartHiraganaToEmoji } from './chart'

export interface EncodeOptions {
  /** Emit literal `NG` for ん instead of 🆖 */
  ngAsLiteral?: boolean
}

export interface EncodeResult {
  emoji: string
  warnings: string[]
}

const VOICE_MARK = '\u3099'
const SEMI_MARK = '\u309A'

type Tone = 'none' | 'voice' | 'half'

/** Split one hiragana grapheme into base syllable character + dakuten/handakuten. */
export function analyzeKanaGrapheme(g: string): { base: string; tone: Tone } {
  const nf = Array.from(g.normalize('NFD'))
  let tone: Tone = 'none'
  const filtered: string[] = []
  for (const ch of nf) {
    if (ch === VOICE_MARK) tone = tone === 'none' ? 'voice' : tone
    else if (ch === SEMI_MARK) tone = tone === 'none' ? 'half' : tone
    else filtered.push(ch)
  }
  const base = filtered.join('').normalize('NFC')
  return { base, tone }
}

/**
 * Encode normalized hiragana (no kanji). Unknown characters are skipped with warnings.
 */
export function encodeHiraganaToEmoji(
  input: string,
  options: EncodeOptions = {},
): EncodeResult {
  const warnings: string[] = []
  const out: string[] = []
  const ngLit = options.ngAsLiteral ?? false
  const normalized = expandSmallKana(input)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')

  const seg = new Intl.Segmenter('ja', { granularity: 'grapheme' })
  for (const part of seg.segment(normalized)) {
    const ch =
      typeof part.segment === 'string' ? part.segment : String(part.segment ?? '')
    if (/^[\n\u2028\u2029]$/u.test(ch)) {
      out.push('\n')
      continue
    }
    if (ch.trim() === '' || /[\s\-ー〜…、。,!！?？]/u.test(ch)) continue

    const { base, tone } = analyzeKanaGrapheme(ch)

    if (base === 'ん') {
      if (ngLit) out.push('NG')
      else out.push(chartHiraganaToEmoji('ん')!)
      continue
    }

    const emoji = chartHiraganaToEmoji(base)
    if (!emoji) {
      warnings.push(`ひらがなに対応する絵文字がありません: ${JSON.stringify(base)}`)
      continue
    }
    out.push(emoji)

    if (tone === 'voice') {
      out.push(String.fromCharCode(34))
    } else if (tone === 'half') {
      out.push('。')
    }
  }

  return { emoji: out.join(''), warnings }
}
