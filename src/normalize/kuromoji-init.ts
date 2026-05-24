import kuromoji, {
  type IpadicFeatures,
  type Tokenizer as KuTokenizer,
} from 'kuromoji'

export type KuromojiTokenizer = KuTokenizer<IpadicFeatures>

let tokenizerPromise: Promise<KuromojiTokenizer | null> | null = null

/**
 * CDN / dev server が `public/dict/*.dat.gz` を配信することを前提。
 * `import.meta.env.BASE_URL` はサブディレクトリデプロイ用。
 */
export function getKuromojiDicPath(): string {
  const base = import.meta.env.BASE_URL ?? '/'
  return `${base}dict/`
}

export async function getKuromojiTokenizer(): Promise<KuromojiTokenizer | null> {
  if (!tokenizerPromise) {
    tokenizerPromise = new Promise((resolve) => {
      const dicPath = getKuromojiDicPath()
      kuromoji.builder({ dicPath }).build((err, tokenizer) => {
        if (err) {
          console.error('[kuromoji]', err)
          resolve(null)
        } else resolve(tokenizer)
      })
    })
  }
  return tokenizerPromise
}
