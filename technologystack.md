## technology stack（このプロジェクト）

- **Runtime**: Modern browsers（ES2022、`Intl.Segmenter`）
- **Build**: TypeScript / Vite 6（`base: /menchika-japanese/`）
- **Morphology**: Kuromoji 0.1.x（ブラウザで `/menchika-japanese/dict/` をフェッチ）
- **Tests**: Vitest 3（jsdom）
- **Hosting**: GitHub Pages（Actions で `dist` をデプロイ）
