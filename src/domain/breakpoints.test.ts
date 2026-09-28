import { describe, expect, it } from 'vitest'
import {
  activeBreakpoint,
  viewportTier,
  type BreakpointMatches,
} from './breakpoints'

function matches(flags: Partial<BreakpointMatches> = {}): BreakpointMatches {
  return {
    sm: false,
    md: false,
    lg: false,
    xl: false,
    '2xl': false,
    ...flags,
  }
}

describe('activeBreakpoint', () => {
  it('is base when the viewport is below every breakpoint', () => {
    expect(activeBreakpoint(matches())).toBe('base')
  })

  it('picks the largest matching min-width query', () => {
    expect(activeBreakpoint(matches({ sm: true }))).toBe('sm')
    expect(activeBreakpoint(matches({ sm: true, md: true }))).toBe('md')
    expect(activeBreakpoint(matches({ sm: true, md: true, lg: true }))).toBe('lg')
    expect(activeBreakpoint(matches({ sm: true, md: true, lg: true, xl: true }))).toBe('xl')
    expect(
      activeBreakpoint(matches({ sm: true, md: true, lg: true, xl: true, '2xl': true })),
    ).toBe('2xl')
  })
})

describe('viewportTier', () => {
  it('maps base and sm to mobile, md to tablet, and lg and up to desktop', () => {
    expect(viewportTier('base')).toBe('mobile')
    expect(viewportTier('sm')).toBe('mobile')
    expect(viewportTier('md')).toBe('tablet')
    expect(viewportTier('lg')).toBe('desktop')
    expect(viewportTier('xl')).toBe('desktop')
    expect(viewportTier('2xl')).toBe('desktop')
  })
})
