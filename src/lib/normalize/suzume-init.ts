import { Suzume, type Suzume as SuzumeInstance } from '@libraz/suzume'
import suzumeWasm from '@libraz/suzume/wasm?url'

let suzumePromise: Promise<SuzumeInstance | null> | null = null

export async function getSuzume(): Promise<SuzumeInstance | null> {
  if (!suzumePromise) {
    suzumePromise = (async () => {
      try {
        return await Suzume.create({ wasmPath: suzumeWasm })
      } catch (err) {
        console.error('[suzume]', err)
        return null
      }
    })()
  }
  return suzumePromise
}

/** Warm up WASM in background (first kanji input is faster). */
export function preloadSuzume(): void {
  void getSuzume()
}
