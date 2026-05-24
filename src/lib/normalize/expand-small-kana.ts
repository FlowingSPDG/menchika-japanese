/** 拗音・小書きのひらがな・カタカナ → 通常サイズ（ゃ→や など）。促音 っ/ッ はそのまま。 */
const SMALL_TO_FULL_HIRAGANA: Readonly<Record<string, string>> = {
  ぁ: 'あ',
  ぃ: 'い',
  ぅ: 'う',
  ぇ: 'え',
  ぉ: 'お',
  ゃ: 'や',
  ゅ: 'ゆ',
  ょ: 'よ',
  ゎ: 'わ',
  ァ: 'ア',
  ィ: 'イ',
  ゥ: 'ウ',
  ェ: 'エ',
  ォ: 'オ',
  ャ: 'ヤ',
  ュ: 'ユ',
  ョ: 'ヨ',
  ヮ: 'ワ',
}

export function expandSmallKana(input: string): string {
  const seg = new Intl.Segmenter('ja', { granularity: 'grapheme' })
  let out = ''
  for (const part of seg.segment(input)) {
    const g =
      typeof part.segment === 'string' ? part.segment : String(part.segment ?? '')
    out += SMALL_TO_FULL_HIRAGANA[g] ?? g
  }
  return out
}
