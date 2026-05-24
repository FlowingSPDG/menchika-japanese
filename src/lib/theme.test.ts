import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  cyclePreference,
  getPreference,
  resolveTheme,
  setPreference,
} from './theme'

describe('theme', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: query.includes('dark'),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    )
  })

  it('defaults to system', () => {
    expect(getPreference()).toBe('system')
  })

  it('cycles system → light → dark → system', () => {
    expect(cyclePreference()).toBe('light')
    expect(cyclePreference()).toBe('dark')
    expect(cyclePreference()).toBe('system')
  })

  it('resolveTheme respects explicit preference', () => {
    setPreference('light')
    expect(resolveTheme('light')).toBe('light')
    setPreference('dark')
    expect(resolveTheme('dark')).toBe('dark')
  })
})
