export const INTERNAL_AUTH_DOMAIN = "agiliza.local";

const USERNAME_PATTERN = /^[a-z0-9][a-z0-9._-]{2,31}$/;

/** Returns the one canonical representation used by every login and user form. */
export function normalizeUsername(value: string) {
  return value.normalize("NFKC").trim().toLowerCase();
}

export function isValidUsername(value: string) {
  return USERNAME_PATTERN.test(normalizeUsername(value));
}

export function usernameToInternalEmail(username: string) {
  return `${normalizeUsername(username)}@${INTERNAL_AUTH_DOMAIN}`;
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isEmailIdentifier(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

export const PASSWORD_MIN_LENGTH = 6;

export function getPasswordValidationMessage(password: string) {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  }

  return null;
}
