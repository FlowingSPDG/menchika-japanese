export type MenchikaToken =
  | { kind: 'ng' }
  | { kind: 'shi_voiced' } // 4"
  | { kind: 'shi_plain' }
  | { kind: 'emoji'; value: string }
  | { kind: 'quote' }
  | { kind: 'period_handakuten' }

const graphemeSeg = new Intl.Segmenter('ja', { granularity: 'grapheme' })

/** Next grapheme cluster starting exactly at byte index `start`, or null. */
export function graphemeAt(input: string, start: number): string | null {
  for (const { segment, index } of graphemeSeg.segment(input)) {
    if (index === start) return segment
    if (index > start) return null
  }
  return null
}

/** Tokenize emoji-mixed pseudotext without interpreting modifiers. */
export function lexMenchika(input: string): MenchikaToken[] {
  const s = input.normalize('NFKC').replace(/\u201C|\u201D/g, '"')
  const tokens: MenchikaToken[] = []
  let i = 0
  while (i < s.length) {
    const rest = s.slice(i)
    if (rest.startsWith('NG')) {
      tokens.push({ kind: 'ng' })
      i += 2
      continue
    }
    if (rest.startsWith('4"')) {
      tokens.push({ kind: 'shi_voiced' })
      i += 2
      continue
    }
    // 「"4」を1トークンにすると 🥁"4 のような並びが壊れるため、「"」（濁点）と「4」（し）は常に分離する。
    const c0 = rest[0]
    if (c0 === '4') {
      tokens.push({ kind: 'shi_plain' })
      i += 1
      continue
    }
    if (c0 === '"') {
      tokens.push({ kind: 'quote' })
      i += 1
      continue
    }
    if (c0 === '。') {
      tokens.push({ kind: 'period_handakuten' })
      i += 1
      continue
    }

    const g = graphemeAt(s, i)
    if (g == null || g.length === 0) {
      // Should not happen; advance by one code unit
      tokens.push({ kind: 'emoji', value: c0 })
      i += 1
      continue
    }
    tokens.push({ kind: 'emoji', value: g })
    i += g.length
  }
  return tokens
}
