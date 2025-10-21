/**
 * Date formatting and manipulation helpers
 */

/**
 * Formats a date string to DD/MM/YYYY format
 * @param {string} dateString - The date string to format
 * @returns {string} - Formatted date or empty string
 */
export function formatDateForDisplay(dateString) {
  if (!dateString) return ''

  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}/${month}/${year}`
}

/**
 * Formats a date string to ISO format (YYYY-MM-DD) for input fields
 * @param {string} dateString - The date string to format
 * @returns {string} - Formatted date or empty string
 */
export function formatDateForInput(dateString) {
  if (!dateString) return ''

  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''

  return date.toISOString().split('T')[0]
}

/**
 * Checks if a date is in the past
 * @param {string} dateString - The date string to check
 * @returns {boolean} - True if date is in the past
 */
export function isPastDate(dateString) {
  if (!dateString) return false

  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return date < today
}

/**
 * Checks if a date is today
 * @param {string} dateString - The date string to check
 * @returns {boolean} - True if date is today
 */
export function isToday(dateString) {
  if (!dateString) return false

  const date = new Date(dateString)
  const today = new Date()

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

/**
 * Checks if two dates are the same day
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {boolean} - True if same day
 */
export function isSameDay(date1, date2) {
  if (!date1 || !date2) return false

  const d1 = typeof date1 === 'string' ? new Date(date1) : date1
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2

  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  )
}

/**
 * Gets the start of today (00:00:00)
 * @returns {Date} - Start of today
 */
export function getStartOfToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

/**
 * Gets the end of today (23:59:59)
 * @returns {Date} - End of today
 */
export function getEndOfToday() {
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  return today
}
