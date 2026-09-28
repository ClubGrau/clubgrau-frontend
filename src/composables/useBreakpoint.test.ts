import { effectScope } from 'vue'
import { describe, expect, it } from 'vitest'
import { BREAKPOINT_QUERIES, type BreakpointName } from '../domain/breakpoints'
import {
  useBreakpoint,
  type MatchMedia,
  type MediaQueryListener,
} from './useBreakpoint'

function fakeMatchMedia(initial: Partial<Record<BreakpointName, boolean>> = {}) {
  const state: Record<BreakpointName, boolean> = {
    sm: false,
    md: false,
    lg: false,
    xl: false,
    '2xl': false,
    ...initial,
  }
  const listeners = new Map<BreakpointName, Set<MediaQueryListener>>()

  const matchMedia: MatchMedia = (query) => {
    const name = (Object.keys(BREAKPOINT_QUERIES) as BreakpointName[]).find(
      (candidate) => BREAKPOINT_QUERIES[candidate] === query,
    )
    if (!name) throw new Error(`Unknown media query: ${query}`)

    return {
      get matches() {
        return state[name]
      },
      addEventListener(_type, listener) {
        const group = listeners.get(name) ?? new Set()
        group.add(listener)
        listeners.set(name, group)
      },
      removeEventListener(_type, listener) {
        listeners.get(name)?.delete(listener)
      },
    }
  }

  function setViewport(next: Partial<Record<BreakpointName, boolean>>) {
    for (const name of Object.keys(next) as BreakpointName[]) {
      const matches = next[name]
      if (matches === undefined || matches === state[name]) continue
      state[name] = matches
      for (const listener of listeners.get(name) ?? []) {
        listener({ matches })
      }
    }
  }

  return { matchMedia, setViewport }
}

function withBreakpoint(matchMedia: MatchMedia | null) {
  const scope = effectScope()
  const composable = scope.run(() => useBreakpoint(matchMedia))
  if (!composable) throw new Error('useBreakpoint did not return inside the effect scope')
  return {
    composable,
    dispose: () => scope.stop(),
  }
}

describe('useBreakpoint', () => {
  it('reports mobile below md, tablet from md, and desktop from lg', () => {
    const mobile = fakeMatchMedia()
    const tablet = fakeMatchMedia({ sm: true, md: true })
    const desktop = fakeMatchMedia({ sm: true, md: true, lg: true })

    const mobileHook = withBreakpoint(mobile.matchMedia)
    const tabletHook = withBreakpoint(tablet.matchMedia)
    const desktopHook = withBreakpoint(desktop.matchMedia)

    expect(mobileHook.composable.tier.value).toBe('mobile')
    expect(mobileHook.composable.isMobile.value).toBe(true)
    expect(mobileHook.composable.breakpoint.value).toBe('base')

    expect(tabletHook.composable.tier.value).toBe('tablet')
    expect(tabletHook.composable.isTablet.value).toBe(true)
    expect(tabletHook.composable.breakpoint.value).toBe('md')

    expect(desktopHook.composable.tier.value).toBe('desktop')
    expect(desktopHook.composable.isDesktop.value).toBe(true)
    expect(desktopHook.composable.atLeast('lg').value).toBe(true)
    expect(desktopHook.composable.atLeast('xl').value).toBe(false)

    mobileHook.dispose()
    tabletHook.dispose()
    desktopHook.dispose()
  })

  it('updates the tier when a media query changes', () => {
    const viewport = fakeMatchMedia()
    const { composable, dispose } = withBreakpoint(viewport.matchMedia)

    expect(composable.isMobile.value).toBe(true)

    viewport.setViewport({ sm: true, md: true })
    expect(composable.isTablet.value).toBe(true)
    expect(composable.isMobile.value).toBe(false)

    viewport.setViewport({ lg: true, xl: true })
    expect(composable.isDesktop.value).toBe(true)
    expect(composable.breakpoint.value).toBe('xl')
    expect(composable.atLeast('xl').value).toBe(true)

    dispose()
  })

  it('stops listening after the scope is disposed', () => {
    const viewport = fakeMatchMedia()
    const { composable, dispose } = withBreakpoint(viewport.matchMedia)

    dispose()
    viewport.setViewport({ sm: true, md: true, lg: true })

    expect(composable.isMobile.value).toBe(true)
    expect(composable.isDesktop.value).toBe(false)
  })

  it('falls back to desktop when matchMedia is unavailable', () => {
    const { composable, dispose } = withBreakpoint(null)

    expect(composable.isDesktop.value).toBe(true)
    expect(composable.breakpoint.value).toBe('lg')

    dispose()
  })
})
