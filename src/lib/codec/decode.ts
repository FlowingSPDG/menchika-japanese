import { chartEmojiToHiragana } from './chart'
import { lexMenchika } from './lexer'
import { applySemiVoicedCombining, applyVoicedCombining } from './modifiers'

export interface DecodeResult {
  hiragana: string
  warnings: string[]
}

/**
 * Decoder for menchika pseudotext: 会話一覧 chart + literal NG + 4️⃣/4️⃣"/" + quote dakuten / period handakuten.
 */
export function decodeEmojiText(input: string): DecodeResult {
  const warnings: string[] = []
  const moras: string[] = []
  let unknownRun = ''

  function flushUnknown() {
    if (unknownRun) {
      warnings.push(`未対応トークン: ${JSON.stringify(unknownRun)}`)
      unknownRun = ''
    }
  }

  function pushMora(ch: string) {
    flushUnknown()
    moras.push(ch)
  }

  const tokens = lexMenchika(input)

  function popTailMora(): string | undefined {
    flushUnknown()
    return moras.length ? moras.pop() : undefined
  }

  for (let ti = 0; ti < tokens.length; ti++) {
    const t = tokens[ti]

    switch (t.kind) {
      case 'ng':
        pushMora('ん')
        break
      case 'shi_voiced':
        pushMora('じ')
        break
      case 'shi_plain':
        pushMora('し')
        break
      case 'quote': {
        const prev = popTailMora()
        if (prev === undefined) {
          warnings.push('濁点「"」に先行するモーラがありませんでした')
          break
        }
        const voiced = applyVoicedCombining(prev)
        if (!voiced) {
          warnings.push(`濁点を付けられないモーラがあります: ${JSON.stringify(prev)}`)
          pushMora(prev)
          break
        }
        pushMora(voiced)
        break
      }
      case 'period_handakuten': {
        const prev = popTailMora()
        if (prev === undefined) {
          warnings.push('半濁点「。」に先行するモーラがありませんでした')
          break
        }
        const hv = applySemiVoicedCombining(prev)
        if (!hv) {
          warnings.push(`半濁点を付けられないモーラがあります: ${JSON.stringify(prev)}`)
          pushMora(prev)
          break
        }
        pushMora(hv)
        break
      }
      case 'emoji': {
        const g = t.value.normalize('NFKC')
        const mora = chartEmojiToHiragana(g)
        if (mora !== undefined) {
          pushMora(mora)
        } else if (/[\n\r\u2028\u2029]/u.test(g)) {
          flushUnknown()
          moras.push('\n')
        } else if (/\s/u.test(g) || g.trim() === '') {
          // skip other whitespace
        } else {
          unknownRun += g
        }
        break
      }
      default:
        break
    }
  }

  flushUnknown()

  const hiragana = moras.join('')
  return { hiragana, warnings }
}
