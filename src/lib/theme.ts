export type ThemePreference = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'menchika-theme-preference'
const CYCLE: ThemePreference[] = ['system', 'light', 'dark']

export function getPreference(): ThemePreference {
  const v = localStorage.getItem(STORAGE_KEY)
  if (v === 'light' || v === 'dark' || v === 'system') return v
  return 'system'
}

export function resolveTheme(pref: ThemePreference): ResolvedTheme {
  if (pref === 'light' || pref === 'dark') return pref
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function applyTheme(pref: ThemePreference): ResolvedTheme {
  const resolved = resolveTheme(pref)
  document.documentElement.dataset.theme = resolved
  document.documentElement.dataset.themePreference = pref
  return resolved
}

export function setPreference(pref: ThemePreference): ResolvedTheme {
  localStorage.setItem(STORAGE_KEY, pref)
  return applyTheme(pref)
}

export function cyclePreference(): ThemePreference {
  const cur = getPreference()
  const next = CYCLE[(CYCLE.indexOf(cur) + 1) % CYCLE.length]!
  setPreference(next)
  return next
}

export function themeToggleLabel(pref: ThemePreference): string {
  switch (pref) {
    case 'system':
      return 'テーマ: システム'
    case 'light':
      return 'テーマ: ライト'
    case 'dark':
      return 'テーマ: ダーク'
  }
}

/** Apply stored preference and listen for OS changes while in system mode. */
export function initTheme(): () => void {
  applyTheme(getPreference())
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const onChange = () => {
    if (getPreference() === 'system') applyTheme('system')
  }
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}
