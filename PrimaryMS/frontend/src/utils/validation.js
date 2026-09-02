/**
 * Validate an email string.
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

/**
 * Validate that a string is non-empty after trimming.
 * @param {string} value
 * @returns {boolean}
 */
export const isRequired = (value) =>
  typeof value === 'string' && value.trim().length > 0

/**
 * Validate a phone number (basic, 7-15 digits).
 * @param {string} phone
 * @returns {boolean}
 */
export const isValidPhone = (phone) =>
  /^\+?[\d\s\-]{7,15}$/.test(phone)

/**
 * Validate a numeric score is within [min, max].
 * @param {number} score
 * @param {number} [min=0]
 * @param {number} [max=100]
 * @returns {boolean}
 */
export const isValidScore = (score, min = 0, max = 100) =>
  typeof score === 'number' && score >= min && score <= max
