import { expandSmallKana } from './expand-small-kana'
import { lookupReadingHiragana } from './reading-snapshot'

/**
 * 基本形が「…る」のとき、連用形など（表面形＝語幹）の読みを推測する。
 * 例: 疲れ + 疲れる → つかれ、食べ + 食べる → たべ
 */
export function readingFromVerbLemma(
  surface: string,
  baseForm: string,
): string | undefined {
  if (!baseForm.endsWith('る')) return undefined

  const stem = baseForm.slice(0, -1)
  if (surface !== stem) return undefined

  const lemmaReading = lookupReadingHiragana(baseForm)
  if (!lemmaReading) return undefined

  if (lemmaReading.endsWith('る')) {
    return expandSmallKana(lemmaReading.slice(0, -1))
  }
  return lemmaReading
}
