import { describe, expect, it } from 'vitest';
import {
  detectPhoneCountry,
  hasPhoneNumber,
  isValidPhone,
  normalizePhoneE164,
  toNationalPhoneDisplay,
} from './phone-value';

describe('hasPhoneNumber', () => {
  it('treats empty and dial-code-only values as empty', () => {
    expect(hasPhoneNumber('')).toBe(false);
    expect(hasPhoneNumber('   ')).toBe(false);
    expect(hasPhoneNumber('+351')).toBe(false);
  });

  it('detects when the user typed a national number', () => {
    expect(hasPhoneNumber('+351 912 345 678')).toBe(true);
    expect(hasPhoneNumber('912345678')).toBe(true);
  });
});

describe('isValidPhone', () => {
  it('accepts a complete Portuguese mobile in E.164 or national form', () => {
    expect(isValidPhone('+351912345678')).toBe(true);
    expect(isValidPhone('912345678')).toBe(true);
  });

  it('rejects empty and dial-code-only values', () => {
    expect(isValidPhone('')).toBe(false);
    expect(isValidPhone('+351')).toBe(false);
  });
});

describe('detectPhoneCountry', () => {
  it('detects the country from an E.164 value', () => {
    expect(detectPhoneCountry('+351912345678')).toBe('PT');
    expect(detectPhoneCountry('+5511987654321')).toBe('BR');
  });

  it('detects the country when the API stored digits without "+"', () => {
    expect(detectPhoneCountry('351912345678')).toBe('PT');
    expect(detectPhoneCountry('5511987654321')).toBe('BR');
  });

  it('falls back to the default country for blank values', () => {
    expect(detectPhoneCountry('')).toBe('PT');
    expect(detectPhoneCountry('   ', 'BR')).toBe('BR');
  });
});

describe('normalizePhoneE164', () => {
  it('normalizes API values to E.164 for vue-tel-input', () => {
    expect(normalizePhoneE164('+351912345678')).toBe('+351912345678');
    expect(normalizePhoneE164('351912345678')).toBe('+351912345678');
    expect(normalizePhoneE164('912345678')).toBe('+351912345678');
    expect(normalizePhoneE164('5511987654321')).toBe('+5511987654321');
  });

  it('returns empty for blank values', () => {
    expect(normalizePhoneE164('')).toBe('');
  });
});

describe('toNationalPhoneDisplay', () => {
  it('strips the country code from an E.164 value', () => {
    expect(toNationalPhoneDisplay('+351912345678')).toBe('912 345 678');
  });

  it('strips the country code when digits were stored without "+"', () => {
    expect(toNationalPhoneDisplay('351912345678')).toBe('912 345 678');
  });

  it('returns empty for dial-code-only or blank values', () => {
    expect(toNationalPhoneDisplay('')).toBe('');
    expect(toNationalPhoneDisplay('+351')).toBe('');
  });
});
