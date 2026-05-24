```
menchika-japanese/
├── .github/workflows/ci.yml   # 検証 + main/master push で GitHub Pages デプロイ
├── LICENSE
├── README.md
├── index.html
├── package.json
├── vite.config.ts             # base: /menchika-japanese/
├── tsconfig.json
├── scripts/
│   └── copy-kuromoji-dict.mjs # postinstall → public/dict
├── public/
│   └── dict/                  # （生成）Kuromoji 辞書 gz
└── src/
    ├── main.ts
    ├── style.css
    ├── codec/
    └── normalize/

```
