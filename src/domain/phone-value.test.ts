import { describe, expect, it } from 'vitest';
import { hasPhoneNumber, isValidPhone, toNationalPhoneDisplay } from './phone-value';

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

describe('toNationalPhoneDisplay', () => {
  it('strips the country code from an E.164 value', () => {
    expect(toNationalPhoneDisplay('+351912345678')).toBe('912 345 678');
  });

  it('returns empty for dial-code-only or blank values', () => {
    expect(toNationalPhoneDisplay('')).toBe('');
    expect(toNationalPhoneDisplay('+351')).toBe('');
  });
});
