import { describe, expect, it } from 'vitest'
import {
  indicationOriginNameIssue,
  normalizeIndicationOriginName,
} from './indication-origin-name'

describe('normalizeIndicationOriginName', () => {
  it('trims and collapses repeated spaces', () => {
    expect(normalizeIndicationOriginName('  Google   Ads  ')).toBe('Google Ads')
  })
})

describe('indicationOriginNameIssue', () => {
  it('refuses a name that normalizes below 2 or above 100 characters', () => {
    expect(indicationOriginNameIssue('   ')).toBe('short')
    expect(indicationOriginNameIssue(' A ')).toBe('short')
    expect(indicationOriginNameIssue(`  ${'a'.repeat(101)}  `)).toBe('long')
  })

  it('accepts a name inside the ruler', () => {
    expect(indicationOriginNameIssue('  Facebook  ')).toBeNull()
    expect(indicationOriginNameIssue('a'.repeat(100))).toBeNull()
  })
})
