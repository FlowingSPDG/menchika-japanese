const COMBINING_VOICED = '\u3099'
const COMBINING_SEMIVOICED = '\u309A'

/** Applies handakuten to the は-row base (は→ぱ-style). Undefined if incompatible. */
export function applyVoicedCombining(prev: string): string | undefined {
  if (!prev || prev === 'ん') return undefined
  const out = (prev + COMBINING_VOICED).normalize('NFC')
  return out !== prev ? out : undefined
}

/** Applies handakuten (半濁点) to は-row syllable. Undefined if incompatible. */
export function applySemiVoicedCombining(prev: string): string | undefined {
  if (!prev || prev === 'ん') return undefined
  const out = (prev + COMBINING_SEMIVOICED).normalize('NFC')
  return out !== prev ? out : undefined
}
