import { CHART_PAIRS } from './codec/chart'
import { decodeEmojiText } from './codec/decode'
import { encodeHiraganaToEmoji } from './codec/encode'
import { toHiragana } from './normalize/to-hiragana'
import './style.css'

const siteName = 'メン地下絵文字もどき変換機'
const repoUrl = 'https://github.com/FlowingSPDG/menchika-japanese'

document.title = siteName

const app = document.getElementById('app')
if (!app) throw new Error('#app missing')

const heading = document.createElement('h1')
heading.textContent = siteName
app.appendChild(heading)

function label(forId: string, text: string) {
  const l = document.createElement('label')
  l.htmlFor = forId
  l.textContent = text
  return l
}

/* --- Encode --- */
const hEnc = document.createElement('h2')
hEnc.textContent = '日本語 → ひらがな → 絵文字'
app.appendChild(hEnc)

const encFs = document.createElement('fieldset')
app.appendChild(encFs)

const japaneseIn = document.createElement('textarea')
japaneseIn.id = 'japanese-in'
japaneseIn.placeholder = '漢字・ひらがな・カタカナ…'

encFs.appendChild(label('japanese-in', '入力（日本語）'))
encFs.appendChild(japaneseIn)

const dialectChk = document.createElement('input')
dialectChk.type = 'checkbox'
dialectChk.id = 'opt-dialect'
encFs.appendChild(dialectChk)
encFs.appendChild(label('opt-dialect', '方言優先エンコード（✌ に / 🥁 たなど）'))

const ngChk = document.createElement('input')
ngChk.type = 'checkbox'
ngChk.id = 'opt-ng'
encFs.appendChild(ngChk)
encFs.appendChild(label('opt-ng', 'んを NG で出力（絵文字😐 の代わりにリテラル NG）'))

const hiraganaOut = document.createElement('div')
hiraganaOut.id = 'hiragana-out'
hiraganaOut.className = 'output'
hiraganaOut.setAttribute('role', 'status')

encFs.appendChild(label('hiragana-out', 'ひらがな（変換後・読み取り専用）'))
encFs.appendChild(hiraganaOut)

const emojiEncOut = document.createElement('textarea')
emojiEncOut.id = 'emoji-enc-out'
emojiEncOut.placeholder = 'エンコード結果'
emojiEncOut.spellcheck = false

encFs.appendChild(label('emoji-enc-out', '絵文字もどき'))
encFs.appendChild(emojiEncOut)

const btnEnc = document.createElement('button')
btnEnc.type = 'button'
btnEnc.textContent = 'エンコード'

const btnCopyHr = document.createElement('button')
btnCopyHr.type = 'button'
btnCopyHr.textContent = 'ひらがなをコピー'

const btnCopyEmoji = document.createElement('button')
btnCopyEmoji.type = 'button'
btnCopyEmoji.textContent = '絵文字をコピー'

const encBtnRow = document.createElement('div')
encBtnRow.append(btnEnc, btnCopyHr, btnCopyEmoji)
encFs.appendChild(encBtnRow)

const encodeWarn = document.createElement('div')
encodeWarn.className = 'warnings'
encodeWarn.setAttribute('role', 'status')
encFs.appendChild(encodeWarn)

/* --- Decode --- */
const hDec = document.createElement('h2')
hDec.textContent = '絵文字 → ひらがな'
app.appendChild(hDec)

const decFs = document.createElement('fieldset')
app.appendChild(decFs)

const emojiDecIn = document.createElement('textarea')
emojiDecIn.id = 'emoji-dec-in'
emojiDecIn.placeholder = '絵文字列を貼り付け'
emojiDecIn.spellcheck = false

decFs.appendChild(label('emoji-dec-in', '絵文字もどき'))
decFs.appendChild(emojiDecIn)

const decBtnRow = document.createElement('div')
const decodeBtn = document.createElement('button')
decodeBtn.type = 'button'
decodeBtn.textContent = 'デコード'

const swapBtn = document.createElement('button')
swapBtn.type = 'button'
swapBtn.textContent = '入れ替え（上下の絵文字欄を入れ替える）'

const decCopyHrBtn = document.createElement('button')
decCopyHrBtn.type = 'button'
decCopyHrBtn.textContent = 'ひらがなをコピー'

decBtnRow.append(decodeBtn, swapBtn, decCopyHrBtn)
decFs.appendChild(decBtnRow)

const hiraganaDecOut = document.createElement('textarea')
hiraganaDecOut.id = 'hiragana-dec-out'
hiraganaDecOut.readOnly = true
hiraganaDecOut.spellcheck = false

decFs.appendChild(label('hiragana-dec-out', 'ひらがな'))
decFs.appendChild(hiraganaDecOut)

const decodeWarn = document.createElement('div')
decodeWarn.className = 'warnings'
decFs.appendChild(decodeWarn)

/** Chart reference */
const det = document.createElement('details')
det.className = 'chart'

const summary = document.createElement('summary')
summary.textContent = '46音変換表（リファレンス）'

const tbl = document.createElement('table')
tbl.className = 'chart-grid'

const thead = tbl.createTHead()
const hdr = thead.insertRow()
hdr.insertCell().textContent = ''
for (let col = 0; col < 5; col++) hdr.insertCell().textContent = `列${col + 1}`

const tbody = tbl.createTBody()
for (let r = 0; r < CHART_PAIRS.length / 5; r++) {
  const row = tbody.insertRow()
  row.insertCell().textContent = `${r + 1}段`
  for (let c = 0; c < 5; c++) {
    const ix = r * 5 + c
    const cell = row.insertCell()
    if (ix < CHART_PAIRS.length) cell.textContent = CHART_PAIRS[ix].join(' ')
  }
}

det.append(summary, tbl)
app.appendChild(det)

/** Footer */
const foot = document.createElement('footer')
const a = document.createElement('a')
a.href = repoUrl
a.rel = 'noreferrer'
a.target = repoUrl.startsWith('http') ? '_blank' : ''
a.textContent = repoUrl
foot.appendChild(a)
foot.appendChild(
  document.createTextNode(
    ' ・読み・方言には揺れや誤差があります。',
  ),
)
app.appendChild(foot)

swapBtn.addEventListener('click', () => {
  const t = emojiEncOut.value
  emojiEncOut.value = emojiDecIn.value
  emojiDecIn.value = t
})

async function runEncode(): Promise<void> {
  hiraganaOut.textContent = '読込中…'
  emojiEncOut.value = ''
  encodeWarn.textContent = ''

  try {
    const normalized = await toHiragana(japaneseIn.value)
    hiraganaOut.textContent = normalized.hiragana

    const enc = encodeHiraganaToEmoji(normalized.hiragana, {
      dialectPrefer: dialectChk.checked,
      ngAsLiteral: ngChk.checked,
    })
    emojiEncOut.value = enc.emoji

    const messages = [...normalized.warnings, ...enc.warnings]
    encodeWarn.textContent = messages.join('\n')
  } catch (e) {
    hiraganaOut.textContent = ''
    encodeWarn.textContent = `エラー: ${e}`
  }
}

btnEnc.addEventListener('click', () => runEncode())

decodeBtn.addEventListener('click', () => {
  decodeWarn.textContent = ''
  const decoded = decodeEmojiText(emojiDecIn.value)
  hiraganaDecOut.value = decoded.hiragana
  decodeWarn.textContent = decoded.warnings.join('\n')
})

function clipboardWrite(t: string) {
  void navigator.clipboard?.writeText(t)
}

btnCopyHr.addEventListener('click', () =>
  clipboardWrite(hiraganaOut.textContent ?? ''),
)

btnCopyEmoji.addEventListener('click', () => clipboardWrite(emojiEncOut.value))

decCopyHrBtn.addEventListener('click', () =>
  clipboardWrite(hiraganaDecOut.value),
)
