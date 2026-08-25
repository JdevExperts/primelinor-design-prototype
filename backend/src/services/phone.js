/**
 * India-first phone normalization. This is a WhatsApp-first B2B audience —
 * almost every real submission will be a 10-digit Indian mobile number,
 * typed with or without a country code, spaces, or a leading zero. The goal
 * is a single canonical E.164-ish key ("+91XXXXXXXXXX") to dedupe Contacts
 * on, not full international validation (libphonenumber is deliberately not
 * pulled in for this).
 *
 * Non-Indian numbers are accepted as-is (digits + a leading "+") so the form
 * doesn't hard-reject a real international enquiry — they just won't
 * dedupe as tightly as Indian numbers do.
 */
function normalizePhone(raw) {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const digitsOnly = trimmed.replace(/[^\d+]/g, "");
  const hadPlus = digitsOnly.startsWith("+");
  const digits = digitsOnly.replace(/\+/g, "");

  // Bare 10-digit Indian mobile: 6-9 followed by 9 more digits.
  if (!hadPlus && /^[6-9]\d{9}$/.test(digits)) {
    return `+91${digits}`;
  }

  // Leading 0 + 10-digit Indian mobile (common landline-style local dialing).
  if (!hadPlus && /^0[6-9]\d{9}$/.test(digits)) {
    return `+91${digits.slice(1)}`;
  }

  // 91 + 10-digit Indian mobile, with or without a "+".
  if (/^91[6-9]\d{9}$/.test(digits)) {
    return `+${digits}`;
  }

  // Any other explicit "+<country><number>" — accept as typed once digits
  // are cleaned, no further reshaping.
  if (hadPlus && /^\d{8,15}$/.test(digits)) {
    return `+${digits}`;
  }

  return null;
}

module.exports = { normalizePhone };
