# menchika-japanese

メン地下界隈などで語られる「絵文字での日本語チェーン」と、通常のひらがなとの**双方向**変換をブラウザだけで行う静的サイトです。**漢字・カタカナ混じり**の入力は Kuromoji でひらがな読みへ正規化し、その**中間ひらがな**と**絵文字列**を同時に表示します。

**公開 URL（GitHub Pages）**: https://flowingspdg.github.io/menchika-japanese/

※ 読みの推定にはゆれがあります。結果は確認の上使用してください。

## 開発

要件: Node 20+ を推奨（CI は Node 22）

```bash
npm ci
npm run dev      # http://localhost:5173/menchika-japanese/
npm test
npm run check    # svelte-check（型・Svelte 構文）
npm run build
npm run preview  # ビルド後の確認（同じ base パス）
```

スタックは **SvelteKit 2（adapter-static）+ Svelte 5 + TypeScript + Vite 8** です。漢字→ひらがなは **Suzume**（WASM、約 450KB gzip）で形態素解析し、読みは `reading-snapshot.json`（`npm run generate:readings` で更新・ビルド時のみ kuromoji 使用）で補完します。UI は Svelte コンポーネント（自動エスケープ）、変換ロジックは `src/lib/` に分離しています。

`svelte.config.js` の `paths.base: '/menchika-japanese'` は、リポジトリ名 `menchika-japanese` の **プロジェクトサイト**用です。ユーザー名・リポジトリ名を変えた場合は `base` も `/あなたのリポジトリ名` に合わせてください。

## GitHub Pages へのデプロイ

1. リポジトリ **Settings → Pages → Build and deployment** で **Source** を **GitHub Actions** にする。
2. `main`（または `master`）へ push すると [`.github/workflows/ci.yml`](.github/workflows/ci.yml) がテスト・ビルドのあと `dist` をデプロイする。

初回デプロイ後、上記 URL で閲覧できます（ユーザー名は GitHub 上では大文字でも、URL は通常 **小文字** の `flowingspdg.github.io` になります）。

### カスタムドメイン

**Settings → Pages → Custom domain** から設定可能です。DNS は [GitHub の手順](https://docs.github.com/ja/pages/configuring-a-custom-domain-for-your-github-pages-site)に従ってください。カスタムドメイン利用時は `vite` の `base` を `'/'` に変更し、**ユーザー／組織のルートサイト用リポジトリ**（`FlowingSPDG.github.io`）に載せる構成にする必要があります。現在の設定は **プロジェクトサイト**（`/menchika-japanese/` 付き URL）向けです。

## 変換仕様の要約

- **メン地下会話絵文字一覧（46音）**: [`src/lib/codec/chart.ts`](src/lib/codec/chart.ts)
- **修飾子**: リテラル `NG`（ん）、`4️⃣`（し）、`4️⃣"`（じ）、ASCII `"`（濁点）、`。`（半濁点）。`🥁"4️⃣` のように「"」と `4️⃣` は分離して解釈する（詳細は [`src/lib/codec/lexer.ts`](src/lib/codec/lexer.ts)）。

ライセンス: [MIT](./LICENSE)
