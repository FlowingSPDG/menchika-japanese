<script lang="ts">
  import { CHART_ROW_LABELS, CHART_ROWS } from '$lib/codec/chart'
  import { decodeEmojiText } from '$lib/codec/decode'
  import { encodeHiraganaToEmoji } from '$lib/codec/encode'
  import { toHiragana } from '$lib/normalize/to-hiragana'
  import {
    cyclePreference,
    getPreference,
    themeToggleLabel,
    type ThemePreference,
  } from '$lib/theme'
  import { buildCommitShort, buildCommitUrl } from '$lib/build-info'
  import { debounce } from '$lib/util/debounce'

  const siteName = 'メン地下絵文字↔️日本語の変換アプリ'
  const siteIntro =
    'メン地下界隈で話題の絵文字もどき日本語と、ひらがな・漢字の日本語を、ブラウザ上で双方向に変換できます。'
  const repoUrl = 'https://github.com/FlowingSPDG/menchika-japanese'
  const devCredit = { name: 'FlowingSPDG', handle: 'flowingspdg' } as const
  const chartCredit = { name: '2fxz4x', handle: '2fxz4x' } as const
  const inputTip =
    '対応していない語や読みが多いため、漢字混じりよりひらがなでの入力をおすすめします。'

  let themePref = $state<ThemePreference>('system')
  let japaneseIn = $state('')
  let hiraganaOut = $state('')
  let emojiEncOut = $state('')
  let encodeWarn = $state('')
  let emojiDecIn = $state('')
  let hiraganaDecOut = $state('')
  let decodeWarn = $state('')

  let encodeGeneration = 0
  let chartDialog: HTMLDialogElement | undefined

  function openChartModal(): void {
    chartDialog?.showModal()
  }

  function closeChartModal(): void {
    chartDialog?.close()
  }

  function onChartDialogClick(e: MouseEvent): void {
    if (e.target === chartDialog) closeChartModal()
  }

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

      const enc = encodeHiraganaToEmoji(normalized.hiragana)
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
  <meta name="description" content={siteIntro} />
</svelte:head>

<header class="site-header">
  <div class="site-heading">
    <h1>{siteName}</h1>
    <p class="site-intro">{siteIntro}</p>
  </div>
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

<p class="chart-open-row">
  <button type="button" class="chart-open-btn" onclick={openChartModal}>
    変換対応表を見る（46音）
  </button>
</p>

<fieldset>
  <label for="japanese-in">入力（日本語）</label>
  <textarea
    id="japanese-in"
    placeholder="漢字・ひらがな・カタカナ…"
    bind:value={japaneseIn}
    oninput={scheduleEncode}
  ></textarea>

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

{#snippet chartGrid()}
  <table class="chart-grid">
    <tbody>
      {#each CHART_ROWS as row, ri}
        <tr>
          <th scope="row" class="chart-row-label">{CHART_ROW_LABELS[ri]}行</th>
          {#each row as pair}
            <td>
              <span class="chart-cell-kana">{pair[0]}</span>
              <span class="chart-cell-emoji" aria-hidden="true">{pair[1]}</span>
            </td>
          {/each}
          {#each Array(5 - row.length) as _}
            <td class="chart-cell-empty" aria-hidden="true"></td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
{/snippet}

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
<dialog
  bind:this={chartDialog}
  class="chart-modal"
  aria-labelledby="chart-modal-title"
  onclick={onChartDialogClick}
>
  <div class="chart-modal-panel">
    <header class="chart-modal-header">
      <h2 id="chart-modal-title">メン地下会話絵文字一覧（46音）</h2>
      <button
        type="button"
        class="chart-modal-close"
        aria-label="閉じる"
        onclick={closeChartModal}
      >
        ×
      </button>
    </header>
    <div class="chart-modal-body">
      {@render chartGrid()}
      <p class="chart-modal-note">
        濁点は直前のモーラのあとに <code>"</code>、半濁点（は行）は <code>。</code>。んは
        🆖、しは <code>4️⃣</code>（じは <code>4️⃣"</code>）。貼り付けた文字列中の
        <code>NG</code> はんとしてデコードします。
      </p>
    </div>
    <footer class="chart-modal-footer">
      <button type="button" onclick={closeChartModal}>閉じる</button>
    </footer>
  </div>
</dialog>

<footer class="site-footer">
  <div class="footer-line">
    開発: {devCredit.name}(<a
      href="https://x.com/{devCredit.handle}"
      rel="noreferrer noopener"
      target="_blank">x:{devCredit.handle}</a>)
  </div>
  <div class="footer-line">
    変換表提供: {chartCredit.name}(<a
      href="https://x.com/{chartCredit.handle}"
      rel="noreferrer noopener"
      target="_blank">x:{chartCredit.handle}</a>)
  </div>
  <div class="footer-line">
    <a href={repoUrl} rel="noreferrer noopener" target="_blank">{repoUrl}</a>
    ・読みには揺れや誤差があります。
  </div>
  <div class="footer-line">
    ビルド:
    <a href={buildCommitUrl} rel="noreferrer noopener" target="_blank">{buildCommitShort}</a>
  </div>
</footer>
