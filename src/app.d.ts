/// <reference types="@sveltejs/kit" />

interface ImportMetaEnv {
  readonly VITE_BUILD_COMMIT_SHORT: string
  readonly VITE_BUILD_COMMIT_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  namespace App {}
}

export {}
