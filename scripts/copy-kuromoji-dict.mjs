import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const src = join(root, 'node_modules', 'kuromoji', 'dict')
const dest = join(root, 'public', 'dict')

if (!existsSync(src)) {
  console.warn('copy-kuromoji-dict: kuromoji dict not found (run npm install first)')
  process.exit(0)
}
mkdirSync(dest, { recursive: true })
cpSync(src, dest, { recursive: true })
console.log('Copied kuromoji dict to public/dict')
