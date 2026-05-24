/**
 * メン地下会話絵文字一覧（46音）— canonical encode / decode chart.
 */

export type ChartPair = readonly [hiragana: string, emoji: string]

export const CHART_PAIRS: readonly ChartPair[] = [
  ['あ', '🍨'],
  ['い', '🦑'],
  ['う', '🐴'],
  ['え', '🖼️'],
  ['お', '👹'],
  ['か', '🦟'],
  ['き', '🌳'],
  ['く', '🐻'],
  ['け', '⚔️'],
  ['こ', '🐨'],
  ['さ', '🈂️'],
  ['し', '4️⃣'],
  ['す', '🍉'],
  ['せ', '🪭'],
  ['そ', '🛷'],
  ['た', '🥁'],
  ['ち', '🩸'],
  ['つ', '🌙'],
  ['て', '✋'],
  ['と', '🍅'],
  ['な', '🍐'],
  ['に', '✌️'],
  ['ぬ', '🧸'],
  ['ね', '🐱'],
  ['の', '🧠'],
  ['は', '🦷'],
  ['ひ', '🔥'],
  ['ふ', '🚢'],
  ['へ', '🐍'],
  ['ほ', '📕'],
  ['ま', '😷'],
  ['み', '💧'],
  ['む', '💜'],
  ['め', '👀'],
  ['も', '🍑'],
  ['や', '🗻'],
  ['ゆ', '🏹'],
  ['よ', '🪀'],
  ['ら', '🎒'],
  ['り', '🍎'],
  ['る', '🇷🇴'],
  ['れ', '🧱'],
  ['ろ', '6️⃣'],
  ['わ', '🐊'],
  ['を', '🎵'],
  ['ん', '🆖'],
]

/** 五十音の行ラベル（CHART_ROWS と同じ順・長さ） */
export const CHART_ROW_LABELS = [
  'あ',
  'か',
  'さ',
  'た',
  'な',
  'は',
  'ま',
  'や',
  'ら',
  'わ',
] as const

/** 変換表表示用：あ行・か行…わ行ごとの5列（や行・わ行は3音） */
export const CHART_ROWS: readonly (readonly ChartPair[])[] = [
  CHART_PAIRS.slice(0, 5),
  CHART_PAIRS.slice(5, 10),
  CHART_PAIRS.slice(10, 15),
  CHART_PAIRS.slice(15, 20),
  CHART_PAIRS.slice(20, 25),
  CHART_PAIRS.slice(25, 30),
  CHART_PAIRS.slice(30, 35),
  CHART_PAIRS.slice(35, 38),
  CHART_PAIRS.slice(38, 43),
  CHART_PAIRS.slice(43, 46),
]

const _h2e = new Map<string, string>()
const _e2h = new Map<string, string>()

for (const [h, e] of CHART_PAIRS) {
  _h2e.set(h, e)
  _e2h.set(e, h)
  const nfkc = e.normalize('NFKC')
  if (nfkc !== e && !_e2h.has(nfkc)) _e2h.set(nfkc, h)
}

export const HIRAGANA_TO_CANONICAL_EMOJI = _h2e
export const CANONICAL_EMOJI_TO_HIRAGANA = _e2h

export function chartHiraganaToEmoji(ch: string): string | undefined {
  return _h2e.get(ch)
}

export function chartEmojiToHiragana(emoji: string): string | undefined {
  return _e2h.get(emoji) ?? _e2h.get(emoji.normalize('NFKC'))
}

export function allChartHiragana(): readonly string[] {
  return [..._h2e.keys()]
}
