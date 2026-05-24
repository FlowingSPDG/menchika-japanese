import type { Morpheme } from '@libraz/suzume'
import { expandSmallKana } from './expand-small-kana'
import { katakanaChunkToHiragana } from './katakana-to-hiragana'
import { readingFromMixedSurface } from './mixed-reading'
import { lookupReadingHiragana } from './reading-snapshot'
import { readingFromVerbLemma } from './verb-lemma-reading'
import { getSuzume } from './suzume-init'

export interface NormalizeResult {
  hiragana: string
  warnings: string[]
}

/** Han / iteration marks that trigger morphological analysis. */
export function containsKanji(s: string): boolean {
  return /[\u4e00-\u9fff々〆〇]/u.test(s)
}

/** Pass-through Hiragana; convert Katakana; expand small kana (ゃ→や など). */
export function widenToHiragana(s: string): string {
  return expandSmallKana(katakanaChunkToHiragana(s))
}

function readingKatakanaToHiragana(reading: string): string {
  return expandSmallKana(
    katakanaChunkToHiragana(reading).normalize('NFC').replace(/\u30fc/gu, 'ー'),
  )
}

function morphemeToHiragana(m: Morpheme): string {
  const { reading, surface, baseForm } = m

  if (reading) return readingKatakanaToHiragana(reading)

  const fromSnapshot =
    lookupReadingHiragana(surface) ?? lookupReadingHiragana(baseForm)
  if (fromSnapshot) return fromSnapshot

  const mixed = readingFromMixedSurface(surface, baseForm)
  if (mixed) return mixed

  const fromLemma = readingFromVerbLemma(surface, baseForm)
  if (fromLemma) return fromLemma

  if (baseForm && /^[\u3041-\u3096ー]+$/u.test(baseForm)) {
    return expandSmallKana(baseForm)
  }

  if (/^[\u3041-\u3096ー]+$/u.test(surface)) {
    return expandSmallKana(surface)
  }

  if (/^[\u30a1-\u30fa\u30fcー]+$/u.test(surface)) {
    return readingKatakanaToHiragana(surface)
  }

  if (!containsKanji(surface)) {
    return widenToHiragana(surface)
  }

  return ''
}

async function hiraganaWithSuzume(
  rawInput: string,
  suzume: NonNullable<Awaited<ReturnType<typeof getSuzume>>>,
): Promise<NormalizeResult> {
  const warnings: string[] = []
  const raw = rawInput.normalize('NFKC')
  const tokens = suzume.analyze(raw)
  let out = ''

  for (const t of tokens) {
    const surface = t.surface ?? ''

    if (/^[\s\u3000]+$/u.test(surface)) {
      out += surface.replace(/\u3000/g, ' ')
      continue
    }

    if (/^[。、,!！?？．.・…「」『』:：;；]+$/u.test(surface)) continue

    if (/^[a-zA-Z0-9０-９]+$/.test(surface)) {
      out += surface.normalize('NFKC')
      continue
    }

    const piece = morphemeToHiragana(t)

    if (!piece) {
      if (containsKanji(surface)) {
        warnings.push(`読みが取りにくい語をスキップ: ${JSON.stringify(surface)}`)
      }
      continue
    }

    out += piece
  }

  return { hiragana: expandSmallKana(out), warnings }
}

export async function toHiragana(input: string): Promise<NormalizeResult> {
  const rawIn = input.normalize('NFKC')
  if (rawIn.trim() === '') return { hiragana: '', warnings: [] }

  if (!containsKanji(rawIn)) {
    return { hiragana: widenToHiragana(rawIn), warnings: [] }
  }

  const suzume = await getSuzume()
  if (!suzume) {
    return {
      hiragana: '',
      warnings: [
        '形態素解析の初期化に失敗しました。ページを再読み込みしてください。',
      ],
    }
  }

  return hiraganaWithSuzume(rawIn, suzume)
}
