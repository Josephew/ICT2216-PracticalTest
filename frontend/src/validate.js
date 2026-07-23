// Frontend input validation — OWASP Top 10 2024 Proactive Control C3 (Validate All Input).
//
// Approach: POSITIVE validation (allow-list) rather than a blacklist of attack
// signatures. A blacklist (e.g. rejecting "<script>", "OR 1=1", "--") is
// inherently incomplete — there are unlimited payload variants an attacker
// can construct to slip past a specific blacklist. An allow-list instead
// defines exactly what a legitimate search term looks like; any SQLi or XSS
// payload necessarily needs characters (<, >, ', ", ;, =, (, )) that are
// outside that allowed set, so it is rejected by construction, not by
// pattern-matching known attacks.
//
// Unicode is explicitly out of scope per the assignment, so the allow-list
// is restricted to a plain ASCII range.

export const MIN_LENGTH = 2;
export const MAX_LENGTH = 100;

// Letters, digits, spaces, and a small set of harmless punctuation.
const ALLOWED_PATTERN = /^[A-Za-z0-9 ,.'-]+$/;

export function validateSearchTerm(rawInput) {
  const term = (rawInput || '').trim();

  if (term.length < MIN_LENGTH || term.length > MAX_LENGTH) {
    return {
      valid: false,
      reason: `Search term must be between ${MIN_LENGTH} and ${MAX_LENGTH} characters.`,
    };
  }

  if (!ALLOWED_PATTERN.test(term)) {
    return {
      valid: false,
      reason: 'Search term contains characters that are not permitted.',
    };
  }

  return { valid: true, term };
}
