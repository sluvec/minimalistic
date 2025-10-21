/**
 * Validation utility functions
 */

import { VALIDATION, ERROR_MESSAGES } from '../constants'

/**
 * Validates a URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function isValidUrl(url) {
  if (!url || url.trim() === '') return true // Empty is valid (optional field)

  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Validates an email address
 * @param {string} email - The email to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function isValidEmail(email) {
  if (!email || email.trim() === '') return true // Empty is valid (optional field)

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates a date string
 * @param {string} dateString - The date to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function isValidDate(dateString) {
  if (!dateString || dateString.trim() === '') return true // Empty is valid (optional field)

  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date)
}

/**
 * Validates note content
 * @param {string} content - The content to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateNoteContent(content) {
  if (!content || content.trim() === '') {
    return { valid: false, error: ERROR_MESSAGES.CONTENT_REQUIRED }
  }

  if (content.length > VALIDATION.CONTENT_MAX_LENGTH) {
    return { valid: false, error: ERROR_MESSAGES.CONTENT_TOO_LONG }
  }

  return { valid: true, error: null }
}

/**
 * Validates note title
 * @param {string} title - The title to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateNoteTitle(title) {
  if (!title || title.trim() === '') {
    return { valid: true, error: null } // Title is optional
  }

  if (title.length > VALIDATION.TITLE_MAX_LENGTH) {
    return { valid: false, error: ERROR_MESSAGES.TITLE_TOO_LONG }
  }

  return { valid: true, error: null }
}

/**
 * Validates a complete note object
 * @param {Object} note - The note object to validate
 * @returns {{valid: boolean, errors: Object}}
 */
export function validateNote(note) {
  const errors = {}

  // Validate title
  const titleValidation = validateNoteTitle(note.title)
  if (!titleValidation.valid) {
    errors.title = titleValidation.error
  }

  // Validate content
  const contentValidation = validateNoteContent(note.content)
  if (!contentValidation.valid) {
    errors.content = contentValidation.error
  }

  // Validate URL
  if (note.url && !isValidUrl(note.url)) {
    errors.url = ERROR_MESSAGES.INVALID_URL
  }

  // Validate date
  if (note.due_date && !isValidDate(note.due_date)) {
    errors.due_date = ERROR_MESSAGES.INVALID_DATE
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Sanitizes a string by trimming whitespace
 * @param {string} str - The string to sanitize
 * @returns {string} - The sanitized string
 */
export function sanitizeString(str) {
  if (!str) return ''
  return str.trim()
}

/**
 * Sanitizes an array of strings
 * @param {Array<string>} arr - The array to sanitize
 * @returns {Array<string>} - The sanitized array
 */
export function sanitizeArray(arr) {
  if (!Array.isArray(arr)) return []
  return arr.map(item => sanitizeString(item)).filter(item => item !== '')
}
