## technology stack（このプロジェクト）

- **Runtime**: Modern browsers（ES2022、`Intl.Segmenter`）
- **App**: [SvelteKit 2](https://kit.svelte.dev/) + **Svelte 5**（CSR / 静的プリレンダー、`ssr: false`）
- **Build**: TypeScript / **Vite 8**（`paths.base: /menchika-japanese`）
- **型チェック**: `svelte-check`（`npm run check`）
- **Morphology**: [@libraz/suzume](https://github.com/libraz/suzume) 0.9.x（WASM・約 450KB gzip）+ `reading-snapshot.json`（開発時 `npm run generate:readings`、kuromoji は devDependencies のみ）
- **Tests**: Vitest 3（jsdom、`src/lib/**/*.test.ts`）
- **Hosting**: GitHub Pages（Actions で `dist` をデプロイ）
- **セキュリティ**: クライアントのみ（秘密情報なし）、CSP メタタグ、Svelte の自動エスケープ、CI で `npm audit --audit-level=high`
