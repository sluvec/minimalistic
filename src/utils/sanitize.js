import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitization utility to prevent XSS attacks
 * Uses DOMPurify to clean user input
 */

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param {string} dirty - Potentially unsafe HTML string
 * @param {object} config - DOMPurify configuration options
 * @returns {string} - Sanitized HTML string safe for rendering
 */
export const sanitizeHtml = (dirty, config = {}) => {
  if (typeof dirty !== 'string') {
    console.warn('sanitizeHtml: Input must be a string')
    return ''
  }

  const defaultConfig = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'title', 'target'],
    ALLOW_DATA_ATTR: false,
  }

  return DOMPurify.sanitize(dirty, { ...defaultConfig, ...config })
}

/**
 * Sanitizes plain text by escaping HTML entities
 * Use this for content that should be displayed as plain text
 * @param {string} text - Plain text that may contain HTML characters
 * @returns {string} - Text with HTML entities escaped
 */
export const sanitizeText = (text) => {
  if (typeof text !== 'string') {
    return ''
  }

  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Sanitizes URLs to prevent javascript: protocol and other malicious schemes
 * @param {string} url - URL to sanitize
 * @returns {string} - Safe URL or empty string if invalid
 */
export const sanitizeUrl = (url) => {
  if (typeof url !== 'string') {
    return ''
  }

  const trimmedUrl = url.trim().toLowerCase()

  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:']
  for (const protocol of dangerousProtocols) {
    if (trimmedUrl.startsWith(protocol)) {
      console.warn(`Blocked dangerous URL protocol: ${protocol}`)
      return ''
    }
  }

  // Only allow http, https, mailto, tel
  if (
    !trimmedUrl.startsWith('http://') &&
    !trimmedUrl.startsWith('https://') &&
    !trimmedUrl.startsWith('mailto:') &&
    !trimmedUrl.startsWith('tel:') &&
    !trimmedUrl.startsWith('/')
  ) {
    return ''
  }

  return url.trim()
}

/**
 * Sanitizes form data object by sanitizing all string values
 * @param {object} formData - Form data object
 * @param {object} options - Sanitization options
 * @param {string[]} options.htmlFields - Fields that should be sanitized as HTML
 * @param {string[]} options.urlFields - Fields that should be sanitized as URLs
 * @returns {object} - Sanitized form data
 */
export const sanitizeFormData = (formData, options = {}) => {
  const { htmlFields = [], urlFields = [] } = options
  const sanitized = {}

  for (const [key, value] of Object.entries(formData)) {
    if (typeof value === 'string') {
      if (htmlFields.includes(key)) {
        sanitized[key] = sanitizeHtml(value)
      } else if (urlFields.includes(key)) {
        sanitized[key] = sanitizeUrl(value)
      } else {
        sanitized[key] = sanitizeText(value)
      }
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

/**
 * Validates and sanitizes email address
 * @param {string} email - Email address to validate
 * @returns {string} - Validated email or empty string
 */
export const sanitizeEmail = (email) => {
  if (typeof email !== 'string') {
    return ''
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const trimmed = email.trim().toLowerCase()

  return emailRegex.test(trimmed) ? trimmed : ''
}

/**
 * Strips all HTML tags from a string
 * @param {string} html - HTML string
 * @returns {string} - Plain text without HTML tags
 */
export const stripHtmlTags = (html) => {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] })
}

export default {
  sanitizeHtml,
  sanitizeText,
  sanitizeUrl,
  sanitizeFormData,
  sanitizeEmail,
  stripHtmlTags,
}
