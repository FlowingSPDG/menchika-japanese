import { execSync } from 'node:child_process'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

const REPO_URL = 'https://github.com/FlowingSPDG/menchika-japanese'

function resolveGitCommit(): { short: string; url: string } {
  const full =
    process.env.GITHUB_SHA?.trim() ||
    (() => {
      try {
        return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()
      } catch {
        return ''
      }
    })()

  if (!full) {
    return { short: 'dev', url: REPO_URL }
  }

  return {
    short: full.slice(0, 7),
    url: `${REPO_URL}/commit/${full}`,
  }
}

const git = resolveGitCommit()

export default defineConfig({
  plugins: [sveltekit()],
  assetsInclude: ['**/*.wasm'],
  optimizeDeps: {
    exclude: ['@libraz/suzume'],
  },
  define: {
    'import.meta.env.VITE_BUILD_COMMIT_SHORT': JSON.stringify(git.short),
    'import.meta.env.VITE_BUILD_COMMIT_URL': JSON.stringify(git.url),
  },
})
