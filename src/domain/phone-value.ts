import {
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from 'libphonenumber-js';

/** True when the value contains digits beyond a bare country dial code. */
export function hasPhoneNumber(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;

  const parsed = parsePhoneNumberFromString(trimmed);
  if (parsed) return parsed.nationalNumber.length > 0;

  return trimmed.replace(/\D/g, '').length > 3;
}

/** True when the value is a complete, valid phone number (E.164 or national). */
export function isValidPhone(value: string, defaultCountry: CountryCode = 'PT'): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return isValidPhoneNumber(trimmed) || isValidPhoneNumber(trimmed, defaultCountry);
}

/** National digits for the input. Never includes the country dial code. */
export function toNationalPhoneDisplay(
  value: string,
  defaultCountry: CountryCode = 'PT',
): string {
  const trimmed = value.trim();
  if (!trimmed) return '';

  const parsed =
    parsePhoneNumberFromString(trimmed) ??
    parsePhoneNumberFromString(trimmed, defaultCountry);

  if (!parsed?.nationalNumber) return '';
  return parsed.formatNational();
}
