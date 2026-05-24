/**
 * Formal 46-sound hiragana → emoji chart (canonical encode).
 */

export type ChartPair = readonly [hiragana: string, emoji: string]

export const CHART_PAIRS: readonly ChartPair[] = [
  ['あ', '🐜'],
  ['い', '🪨'],
  ['う', '🐮'],
  ['え', '🖼️'],
  ['お', '👹'],
  ['か', '🦀'],
  ['き', '🌳'],
  ['く', '🌰'],
  ['け', '👮'],
  ['こ', '👊'],
  ['さ', '🐟'],
  ['し', '🦌'],
  ['す', '🍣'],
  ['せ', '🌍'],
  ['そ', '🛷'],
  ['た', '🐙'],
  ['ち', '🍫'],
  ['つ', '🌙'],
  ['て', '✋'],
  ['と', '🕙'],
  ['な', '🍐'],
  ['に', '2️⃣'],
  ['ぬ', '🧸'],
  ['ね', '🐱'],
  ['の', '📓'],
  ['は', '🦷'],
  ['ひ', '🔥'],
  ['ふ', '🦩'],
  ['へ', '🚁'],
  ['ほ', '⭐'],
  ['ま', '🪆'],
  ['み', '👂'],
  ['む', '🔍'],
  ['め', '👀'],
  ['も', '🍑'],
  ['や', '🌴'],
  ['ゆ', '♨️'],
  ['よ', '4️⃣'],
  ['ら', '🏩'],
  ['り', '🍎'],
  ['る', '🇷🇴'],
  ['れ', '🍋'],
  ['ろ', '🚀'],
  ['わ', '🐊'],
  ['を', '👌'],
  ['ん', '😐'],
]

const _h2e = new Map<string, string>()
const _e2h = new Map<string, string>()

for (const [h, e] of CHART_PAIRS) {
  _h2e.set(h, e)
  _e2h.set(e, h)
}

export const HIRAGANA_TO_CANONICAL_EMOJI = _h2e
export const CANONICAL_EMOJI_TO_HIRAGANA = _e2h

export function chartHiraganaToEmoji(ch: string): string | undefined {
  return _h2e.get(ch)
}

export function chartEmojiToHiragana(emoji: string): string | undefined {
  return _e2h.get(emoji)
}

export function allChartHiragana(): readonly string[] {
  return [..._h2e.keys()]
}
