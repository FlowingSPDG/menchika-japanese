# menchika-japanese

メン地下界隈などで語られる「絵文字での日本語チェーン」と、通常のひらがなとの**双方向**変換をブラウザだけで行う静的サイトです。**漢字・カタカナ混じり**の入力は Kuromoji でひらがな読みへ正規化し、その**中間ひらがな**と**絵文字列**を同時に表示します。

**公開 URL（GitHub Pages）**: https://flowingspdg.github.io/menchika-japanese/

※ 読みや方言映射はゆれがあります。結果は確認の上使用してください。

## 開発

要件: Node 20+ を推奨（CI は Node 22）

```bash
npm ci
npm run dev      # http://localhost:5173/menchika-japanese/
npm test
npm run build
npm run preview  # ビルド後の確認（同じ base パス）
```

`vite.config.ts` の `base: '/menchika-japanese/'` は、リポジトリ名 `menchika-japanese` の **プロジェクトサイト**用です。ユーザー名・リポジトリ名を変えた場合は `base` も `/あなたのリポジトリ名/` に合わせてください。

## GitHub Pages へのデプロイ

1. リポジトリ **Settings → Pages → Build and deployment** で **Source** を **GitHub Actions** にする。
2. `main`（または `master`）へ push すると [`.github/workflows/ci.yml`](.github/workflows/ci.yml) がテスト・ビルドのあと `dist` をデプロイする。

初回デプロイ後、上記 URL で閲覧できます（ユーザー名は GitHub 上では大文字でも、URL は通常 **小文字** の `flowingspdg.github.io` になります）。

### カスタムドメイン

**Settings → Pages → Custom domain** から設定可能です。DNS は [GitHub の手順](https://docs.github.com/ja/pages/configuring-a-custom-domain-for-your-github-pages-site)に従ってください。カスタムドメイン利用時は `vite` の `base` を `'/'` に変更し、**ユーザー／組織のルートサイト用リポジトリ**（`FlowingSPDG.github.io`）に載せる構成にする必要があります。現在の設定は **プロジェクトサイト**（`/menchika-japanese/` 付き URL）向けです。

## 変換仕様の要約

- **正規 46 音表**: [`src/codec/chart.ts`](src/codec/chart.ts)
- **コミュニティ別表記**: [`src/codec/aliases.ts`](src/codec/aliases.ts)（デコード両対応／エンコードは「方言優先」トグル時）
- **修飾子**: `NG`（ん）、ASCII `4`（し）、`4"`（じ）、続く ASCII `"`（U+0022）が直前のモーラへの濁点を付与、`。` が半濁点（は行）。`"` と数字 `4` は別々のトークンとして解釈し、`🥁"4` →「だし」のように並べられる（詳細は `src/codec/lexer.ts`）。

ライセンス: [MIT](./LICENSE)
