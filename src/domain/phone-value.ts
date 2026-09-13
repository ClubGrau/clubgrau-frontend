import {
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  type CountryCode,
  type PhoneNumber,
} from 'libphonenumber-js';

function parseStoredPhone(
  value: string,
  defaultCountry: CountryCode = 'PT',
): PhoneNumber | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const direct = parsePhoneNumberFromString(trimmed);
  if (direct) return direct;

  if (/^\d+$/.test(trimmed)) {
    const withDialCode = parsePhoneNumberFromString(`+${trimmed}`);
    if (withDialCode?.isValid()) return withDialCode;
  }

  return parsePhoneNumberFromString(trimmed, defaultCountry);
}

/** True when the value contains digits beyond a bare country dial code. */
export function hasPhoneNumber(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;

  const parsed = parseStoredPhone(trimmed);
  if (parsed) return parsed.nationalNumber.length > 0;

  return trimmed.replace(/\D/g, '').length > 3;
}

/** True when the value is a complete, valid phone number (E.164 or national). */
export function isValidPhone(value: string, defaultCountry: CountryCode = 'PT'): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;

  const parsed = parseStoredPhone(trimmed, defaultCountry);
  if (parsed?.isValid()) return true;

  return isValidPhoneNumber(trimmed) || isValidPhoneNumber(trimmed, defaultCountry);
}

/** ISO country code inferred from an E.164 or national value. */
export function detectPhoneCountry(
  value: string,
  defaultCountry: CountryCode = 'PT',
): CountryCode {
  const trimmed = value.trim();
  if (!trimmed) return defaultCountry;

  return parseStoredPhone(trimmed, defaultCountry)?.country ?? defaultCountry;
}

/** Canonical E.164 for vue-tel-input hydration (handles values stored without "+"). */
export function normalizePhoneE164(
  value: string,
  defaultCountry: CountryCode = 'PT',
): string {
  const trimmed = value.trim();
  if (!trimmed) return '';

  const parsed = parseStoredPhone(trimmed, defaultCountry);
  if (parsed?.isValid()) return parsed.number;

  return trimmed.startsWith('+') ? trimmed : trimmed;
}

/** National digits for the input. Never includes the country dial code. */
export function toNationalPhoneDisplay(
  value: string,
  defaultCountry: CountryCode = 'PT',
): string {
  const trimmed = value.trim();
  if (!trimmed) return '';

  const parsed = parseStoredPhone(trimmed, defaultCountry);
  if (!parsed?.nationalNumber) return '';
  return parsed.formatNational();
}
