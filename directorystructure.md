```
menchika-japanese/
├── .github/workflows/ci.yml   # audit + test + check + build → GitHub Pages
├── LICENSE
├── README.md
├── svelte.config.js           # adapter-static, paths.base
├── vite.config.ts             # SvelteKit + WASM assets
├── package.json
├── tsconfig.json
└── src/
    ├── app.html               # CSP・テーマ初期化
    ├── routes/
    │   ├── +layout.ts         # prerender, ssr: false
    │   ├── +layout.svelte
    │   └── +page.svelte       # UI
    └── lib/
        ├── app.css
        ├── codec/
        ├── normalize/         # suzume-init, to-hiragana
        ├── theme.ts
        └── util/

```
