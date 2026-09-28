/**
 * Tailwind v4 default min-width breakpoints (root font-size 16px):
 * sm 40rem (640px), md 48rem (768px), lg 64rem (1024px),
 * xl 80rem (1280px), 2xl 96rem (1536px).
 *
 * mobile is below `md`. tablet is `md` up to `lg`. desktop is `lg` and up.
 */
export const BREAKPOINT_NAMES = ['sm', 'md', 'lg', 'xl', '2xl'] as const

export type BreakpointName = (typeof BREAKPOINT_NAMES)[number]

export type ActiveBreakpoint = 'base' | BreakpointName

export type ViewportTier = 'mobile' | 'tablet' | 'desktop'

export type BreakpointMatches = Record<BreakpointName, boolean>

export const BREAKPOINT_QUERIES: Record<BreakpointName, string> = {
  sm: '(min-width: 40rem)',
  md: '(min-width: 48rem)',
  lg: '(min-width: 64rem)',
  xl: '(min-width: 80rem)',
  '2xl': '(min-width: 96rem)',
}

const TIER_BY_BREAKPOINT: Record<ActiveBreakpoint, ViewportTier> = {
  base: 'mobile',
  sm: 'mobile',
  md: 'tablet',
  lg: 'desktop',
  xl: 'desktop',
  '2xl': 'desktop',
}

/** Largest matching min-width query. `base` means every query is false. */
export function activeBreakpoint(matches: BreakpointMatches): ActiveBreakpoint {
  for (let index = BREAKPOINT_NAMES.length - 1; index >= 0; index -= 1) {
    const name = BREAKPOINT_NAMES[index]
    if (name && matches[name]) return name
  }
  return 'base'
}

export function viewportTier(breakpoint: ActiveBreakpoint): ViewportTier {
  return TIER_BY_BREAKPOINT[breakpoint]
}
