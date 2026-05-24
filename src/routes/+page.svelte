<script lang="ts">
  import { CHART_PAIRS } from '$lib/codec/chart'
  import { decodeEmojiText } from '$lib/codec/decode'
  import { encodeHiraganaToEmoji } from '$lib/codec/encode'
  import { toHiragana } from '$lib/normalize/to-hiragana'
  import {
    cyclePreference,
    getPreference,
    themeToggleLabel,
    type ThemePreference,
  } from '$lib/theme'
  import { debounce } from '$lib/util/debounce'

  const siteName = 'メン地下絵文字もどき変換機'
  const repoUrl = 'https://github.com/FlowingSPDG/menchika-japanese'
  const devCredits = [
    { name: 'FlowingSPDG', handle: 'flowingspdg' },
    { name: '2fxz4x', handle: '2fxz4x' },
  ] as const
  const inputTip =
    '対応していない語や読みが多いため、漢字混じりよりひらがなでの入力をおすすめします。'

  let themePref = $state<ThemePreference>('system')
  let japaneseIn = $state('')
  let ngAsLiteral = $state(false)
  let hiraganaOut = $state('')
  let emojiEncOut = $state('')
  let encodeWarn = $state('')
  let emojiDecIn = $state('')
  let hiraganaDecOut = $state('')
  let decodeWarn = $state('')

  let encodeGeneration = 0

  function syncThemeToggle(): void {
    themePref = getPreference()
  }

  syncThemeToggle()

  function warningLines(...groups: unknown[]): string {
    const out: string[] = []
    for (const g of groups) {
      if (!Array.isArray(g)) continue
      for (const line of g) {
        if (typeof line === 'string' && line.length > 0) out.push(line)
      }
    }
    return out.join('\n')
  }

  function formatError(e: unknown): string {
    return e instanceof Error ? e.message : String(e)
  }

  async function runEncode(): Promise<void> {
    const gen = ++encodeGeneration
    const raw = japaneseIn

    if (raw.trim() === '') {
      hiraganaOut = ''
      emojiEncOut = ''
      encodeWarn = ''
      return
    }

    hiraganaOut = '読込中…'
    encodeWarn = ''

    try {
      const normalized = await toHiragana(raw)
      if (gen !== encodeGeneration) return

      const enc = encodeHiraganaToEmoji(normalized.hiragana, {
        ngAsLiteral,
      })
      if (gen !== encodeGeneration) return

      hiraganaOut = normalized.hiragana
      emojiEncOut = enc.emoji
      encodeWarn = warningLines(normalized.warnings, enc.warnings)
    } catch (e) {
      if (gen !== encodeGeneration) return
      hiraganaOut = ''
      emojiEncOut = ''
      encodeWarn = `エラー: ${formatError(e)}`
    }
  }

  function runDecode(): void {
    const raw = emojiDecIn
    if (raw.trim() === '') {
      hiraganaDecOut = ''
      decodeWarn = ''
      return
    }

    try {
      const decoded = decodeEmojiText(raw)
      hiraganaDecOut = decoded.hiragana
      decodeWarn = warningLines(decoded.warnings)
    } catch (e) {
      hiraganaDecOut = ''
      decodeWarn = `エラー: ${formatError(e)}`
    }
  }

  const scheduleEncode = debounce(() => {
    void runEncode()
  }, 320)

  const scheduleDecode = debounce(() => {
    runDecode()
  }, 200)

  function swapEmojiFields(): void {
    const t = emojiEncOut
    emojiEncOut = emojiDecIn
    emojiDecIn = t
    runDecode()
  }

  function clipboardWrite(t: string): void {
    void navigator.clipboard?.writeText(t)
  }

  function onThemeClick(): void {
    cyclePreference()
    syncThemeToggle()
  }
</script>

<svelte:head>
  <title>{siteName}</title>
</svelte:head>

<header class="site-header">
  <h1>{siteName}</h1>
  <button
    type="button"
    class="theme-toggle"
    aria-label="{themeToggleLabel(themePref)}（クリックで切り替え）"
    onclick={onThemeClick}
  >
    {themeToggleLabel(themePref)}
  </button>
</header>

<h2>日本語 → ひらがな → 絵文字</h2>

<p class="input-tip" role="note">{inputTip}</p>

<fieldset>
  <label for="japanese-in">入力（日本語）</label>
  <textarea
    id="japanese-in"
    placeholder="漢字・ひらがな・カタカナ…"
    bind:value={japaneseIn}
    oninput={scheduleEncode}
  ></textarea>

  <input
    type="checkbox"
    id="opt-ng"
    bind:checked={ngAsLiteral}
    onchange={scheduleEncode}
  />
  <label for="opt-ng">んをリテラル NG で出力（既定は 🆖）</label>

  <label for="hiragana-out">ひらがな（変換後・読み取り専用）</label>
  <div id="hiragana-out" class="output" role="status">{hiraganaOut}</div>

  <label for="emoji-enc-out">絵文字もどき</label>
  <textarea
    id="emoji-enc-out"
    placeholder="エンコード結果"
    spellcheck={false}
    bind:value={emojiEncOut}
  ></textarea>

  <div class="btn-row">
    <button type="button" onclick={() => clipboardWrite(hiraganaOut)}>
      ひらがなをコピー
    </button>
    <button type="button" onclick={() => clipboardWrite(emojiEncOut)}>
      絵文字をコピー
    </button>
  </div>

  {#if encodeWarn}
    <div class="warnings" role="status">{encodeWarn}</div>
  {/if}
</fieldset>

<h2>絵文字 → ひらがな</h2>

<fieldset>
  <label for="emoji-dec-in">絵文字もどき</label>
  <textarea
    id="emoji-dec-in"
    placeholder="絵文字列を貼り付け"
    spellcheck={false}
    bind:value={emojiDecIn}
    oninput={scheduleDecode}
  ></textarea>

  <div class="btn-row">
    <button type="button" onclick={swapEmojiFields}>
      入れ替え（上下の絵文字欄を入れ替える）
    </button>
    <button type="button" onclick={() => clipboardWrite(hiraganaDecOut)}>
      ひらがなをコピー
    </button>
  </div>

  <label for="hiragana-dec-out">ひらがな</label>
  <textarea id="hiragana-dec-out" readonly spellcheck={false} bind:value={hiraganaDecOut}
  ></textarea>

  {#if decodeWarn}
    <div class="warnings">{decodeWarn}</div>
  {/if}
</fieldset>

<details class="chart">
  <summary>メン地下会話絵文字一覧（46音）</summary>
  <table class="chart-grid">
    <thead>
      <tr>
        <th></th>
        {#each [1, 2, 3, 4, 5] as col}
          <th>列{col}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each Array.from({ length: CHART_PAIRS.length / 5 }, (_, r) => r) as r}
        <tr>
          <th>{r + 1}段</th>
          {#each [0, 1, 2, 3, 4] as c}
            {@const ix = r * 5 + c}
            <td>
              {#if ix < CHART_PAIRS.length}
                {@const pair = CHART_PAIRS[ix]!}
                {pair[0]} {pair[1]}
              {/if}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</details>

<footer>
  <p class="footer-credits">
    開発:
    {#each devCredits as dev, i}
      {#if i > 0}&nbsp;{/if}
      {dev.name}(<a
        href="https://x.com/{dev.handle}"
        rel="noreferrer noopener"
        target="_blank">x:{dev.handle}</a>)
    {/each}
  </p>
  <p>
    <a href={repoUrl} rel="noreferrer noopener" target="_blank">{repoUrl}</a>
    ・読みには揺れや誤差があります。
  </p>
</footer>
