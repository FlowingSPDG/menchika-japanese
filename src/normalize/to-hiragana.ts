import type { KuromojiTokenizer } from './kuromoji-init'
import { getKuromojiTokenizer } from './kuromoji-init'
import { katakanaChunkToHiragana } from './katakana-to-hiragana'

export interface NormalizeResult {
  hiragana: string
  warnings: string[]
}

/** Han / iteration marks that trigger kuromoji. */
export function containsKanji(s: string): boolean {
  return /[\u4e00-\u9fff々〆〇]/u.test(s)
}

function stripWs(s: string): string {
  return s.replace(/[\s\u3000]+/gu, '')
}

/** Pass-through Hiragana; convert full-size Katakana block to Hiragana. */
export function widenToHiragana(s: string): string {
  return katakanaChunkToHiragana(stripWs(s))
}

async function hiraganaWithKuromoji(
  rawInput: string,
  tokenizer: KuromojiTokenizer,
): Promise<NormalizeResult> {
  const warnings: string[] = []
  const raw = stripWs(rawInput.normalize('NFKC'))
  const tokens = tokenizer.tokenize(raw)
  let out = ''
  for (const t of tokens) {
    const surface = t.surface_form
    /** Whitespace segments */
    if (/^$/u.test(surface)) continue

    /** Punctuation (keep out of hiragana stream for emoji encode) */
    if (/^[。、,!！?？“”'"，．.・…「」『』:：]+$/.test(surface)) continue

    /** Latin / digits passthrough (emoji encode側で対応しない可能性あり) */
    if (/^[a-zA-Z]+$/.test(surface)) {
      out += surface
      continue
    }
    if (/^[0-9０-９]+$/.test(surface)) {
      warnings.push(`数字はそのまま残しました: ${surface}`)
      out += surface.normalize('NFKC')
      continue
    }

    const readingRaw = t.reading
    let piece = ''
    if (readingRaw && readingRaw !== '*') {
      piece = katakanaChunkToHiragana(readingRaw)
    } else if (/^[\u3041-\u3096ー]+$/u.test(surface)) {
      piece = surface
    } else if (/^[\u30a1-\u30fa\u30fcー]+$/u.test(surface)) {
      piece = katakanaChunkToHiragana(surface)
    } else if (containsKanji(surface)) {
      warnings.push(`読みが取りにくい語をスキップ: ${JSON.stringify(surface)}`)
    }

    piece = piece.normalize('NFC').replace(/\u30fc/gu, 'ー')
    out += piece
  }
  return { hiragana: out, warnings }
}

export async function toHiragana(input: string): Promise<NormalizeResult> {
  const rawIn = input.normalize('NFKC').trimEnd()
  if (rawIn === '') return { hiragana: '', warnings: [] }

  /** No kanji: cheap path */
  if (!containsKanji(rawIn)) return { hiragana: widenToHiragana(rawIn), warnings: [] }

  const tokenizer = await getKuromojiTokenizer()
  if (!tokenizer)
    return {
      hiragana: '',
      warnings: ['形態素解析辞書の読込に失敗しました（Kuromoji）'],
    }
  return hiraganaWithKuromoji(rawIn, tokenizer)
}
