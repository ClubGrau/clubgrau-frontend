import { computed, onScopeDispose, reactive } from 'vue'
import {
  BREAKPOINT_NAMES,
  BREAKPOINT_QUERIES,
  activeBreakpoint,
  viewportTier,
  type BreakpointMatches,
  type BreakpointName,
} from '../domain/breakpoints'

export type { ActiveBreakpoint, BreakpointName, ViewportTier } from '../domain/breakpoints'

export type MediaQueryListener = (event: { matches: boolean }) => void

export type MediaQuerySubscription = {
  matches: boolean
  addEventListener(type: 'change', listener: MediaQueryListener): void
  removeEventListener(type: 'change', listener: MediaQueryListener): void
}

export type MatchMedia = (query: string) => MediaQuerySubscription

/** Desktop (`lg`) when the browser cannot answer media queries. */
const DESKTOP_FALLBACK: BreakpointMatches = {
  sm: true,
  md: true,
  lg: true,
  xl: false,
  '2xl': false,
}

function browserMatchMedia(): MatchMedia | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null
  return (query) => window.matchMedia(query)
}

/**
 * Current Tailwind breakpoint and the mobile / tablet / desktop tier.
 * Pass `matchMedia` in tests; the browser is the default.
 *
 * `isMobile` is below `md`, `isTablet` is `md` up to `lg`, `isDesktop` is `lg` and up.
 * `atLeast('lg')` is the same check as the `lg:` utility.
 */
export function useBreakpoint(matchMedia: MatchMedia | null = browserMatchMedia()) {
  const matches = reactive<BreakpointMatches>({
    sm: false,
    md: false,
    lg: false,
    xl: false,
    '2xl': false,
  })

  const cleanups: Array<() => void> = []

  if (matchMedia) {
    for (const name of BREAKPOINT_NAMES) {
      const list = matchMedia(BREAKPOINT_QUERIES[name])
      matches[name] = list.matches
      const onChange: MediaQueryListener = (event) => {
        matches[name] = event.matches
      }
      list.addEventListener('change', onChange)
      cleanups.push(() => list.removeEventListener('change', onChange))
    }
  } else {
    Object.assign(matches, DESKTOP_FALLBACK)
  }

  onScopeDispose(() => {
    for (const cleanup of cleanups) cleanup()
  })

  const breakpoint = computed(() => activeBreakpoint(matches))
  const tier = computed(() => viewportTier(breakpoint.value))
  const isMobile = computed(() => tier.value === 'mobile')
  const isTablet = computed(() => tier.value === 'tablet')
  const isDesktop = computed(() => tier.value === 'desktop')

  function atLeast(name: BreakpointName) {
    return computed(() => matches[name])
  }

  return { breakpoint, tier, isMobile, isTablet, isDesktop, atLeast }
}
