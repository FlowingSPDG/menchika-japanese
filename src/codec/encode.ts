import {
  DIALECT_PREFERRED_HIRAGANA_TO_EMOJI,
  ALIAS_EMOJI_TO_HIRAGANA,
} from './aliases'
import { chartHiraganaToEmoji } from './chart'

export interface EncodeOptions {
  /** Prefer community emoji (✌️ に, 🥁 た, 📕 ほ, …) over canonical chart. */
  dialectPrefer?: boolean
  /** Emit literal `NG` for ん instead of 😐 */
  ngAsLiteral?: boolean
}

export interface EncodeResult {
  emoji: string
  warnings: string[]
}

/** Small hiragana that map outside the formal 46 table. */
export const SMALL_HIRAGANA_TO_EMOJI: ReadonlyMap<string, string> = new Map([
  ['ゃ', '⛰️'],
  // ゅ・ょ は将来 aliases で足す(v1 は警告のみ)
])

const DIALECT_BASE_HIRAGANA_TO_CANONICAL: ReadonlyMap<string, string> = (() => {
  const rev = new Map<string, string>()
  for (const [emoji, h] of ALIAS_EMOJI_TO_HIRAGANA) {
    if (emoji === '⛰️') continue
    if (!rev.has(h)) rev.set(h, emoji)
  }
  return rev
})()

const VOICE_MARK = '\u3099'
const SEMI_MARK = '\u309A'

type Tone = 'none' | 'voice' | 'half'

/** Split one hiragana grapheme into base syllable character + dakuten/handakuten. */
export function analyzeKanaGrapheme(g: string): { base: string; tone: Tone } {
  if (SMALL_HIRAGANA_TO_EMOJI.has(g)) return { base: g, tone: 'none' }
  const nf = [...g.normalize('NFD')]
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

function pickBaseEmoji(
  base: string,
  dialectPrefer: boolean,
): string | undefined {
  if (dialectPrefer) {
    const d = DIALECT_BASE_HIRAGANA_TO_CANONICAL.get(base)
    if (d) return d
    const dp = DIALECT_PREFERRED_HIRAGANA_TO_EMOJI.get(base)
    if (dp === 'NG') return undefined // handled for ん only
    if (dp) return dp
  }
  const small = SMALL_HIRAGANA_TO_EMOJI.get(base)
  if (small) return small
  return chartHiraganaToEmoji(base)
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
  const dialectPrefer = options.dialectPrefer ?? false
  const ngLit = options.ngAsLiteral ?? false

  const seg = new Intl.Segmenter('ja', { granularity: 'grapheme' })
  for (const { segment: g } of seg.segment(input)) {
    const ch = g
    if (ch.trim() === '' || /[\s\-ー〜…、。,!！?？]/u.test(ch)) continue

    const { base, tone } = analyzeKanaGrapheme(ch)

    if (base === 'ん') {
      if (ngLit) out.push('NG')
      else out.push(chartHiraganaToEmoji('ん')!)
      continue
    }

    const emoji = pickBaseEmoji(base, dialectPrefer)
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
