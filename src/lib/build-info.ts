/** Injected at build time via vite.config.ts */
export const buildCommitShort =
  import.meta.env.VITE_BUILD_COMMIT_SHORT || 'dev'

export const buildCommitUrl =
  import.meta.env.VITE_BUILD_COMMIT_URL ||
  'https://github.com/FlowingSPDG/menchika-japanese'
