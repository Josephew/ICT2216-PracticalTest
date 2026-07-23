// Backend input validation — OWASP Top 10 2024 Proactive Control C3 (Validate All Input).
//
// This mirrors the frontend check in frontend/src/validate.js, but runs
// server-side. Client-side validation is purely a UX convenience — it can be
// bypassed entirely (disabled JS, direct API calls via curl/Postman, a
// modified request), so the server MUST independently re-validate every
// input regardless of what the client already checked. Same allow-list
// rationale as the frontend: see comments there.

const MIN_LENGTH = 2;
const MAX_LENGTH = 100;
const ALLOWED_PATTERN = /^[A-Za-z0-9 ,.'-]+$/;

function validateSearchTerm(rawInput) {
  const term = (typeof rawInput === 'string' ? rawInput : '').trim();

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

module.exports = { validateSearchTerm, MIN_LENGTH, MAX_LENGTH };
