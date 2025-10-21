/**
 * Error handling utility functions
 */

import { ERROR_MESSAGES } from '../constants'

/**
 * Extracts a user-friendly error message from an error object
 * @param {Error|Object|string} error - The error to parse
 * @returns {string} - A user-friendly error message
 */
export function getErrorMessage(error) {
  if (!error) {
    return ERROR_MESSAGES.GENERIC
  }

  // If it's a string, return it
  if (typeof error === 'string') {
    return error
  }

  // If it's an Error object with a message
  if (error.message) {
    return error.message
  }

  // If it's a Supabase error
  if (error.error_description) {
    return error.error_description
  }

  // If it has a details field
  if (error.details) {
    return error.details
  }

  // Default fallback
  return ERROR_MESSAGES.GENERIC
}

/**
 * Checks if an error is a network error
 * @param {Error} error - The error to check
 * @returns {boolean} - True if it's a network error
 */
export function isNetworkError(error) {
  if (!error) return false

  const message = getErrorMessage(error).toLowerCase()
  return (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('connection') ||
    message.includes('timeout') ||
    error.name === 'NetworkError' ||
    error.code === 'NETWORK_ERROR'
  )
}

/**
 * Checks if an error is an authentication error
 * @param {Error} error - The error to check
 * @returns {boolean} - True if it's an auth error
 */
export function isAuthError(error) {
  if (!error) return false

  const message = getErrorMessage(error).toLowerCase()
  return (
    message.includes('auth') ||
    message.includes('unauthorized') ||
    message.includes('unauthenticated') ||
    message.includes('permission') ||
    error.status === 401 ||
    error.status === 403
  )
}

/**
 * Logs an error to the console with context
 * @param {string} context - Where the error occurred
 * @param {Error} error - The error object
 * @param {Object} additionalInfo - Any additional information
 */
export function logError(context, error, additionalInfo = {}) {
  console.error(`[${context}] Error:`, {
    message: getErrorMessage(error),
    error,
    ...additionalInfo,
    timestamp: new Date().toISOString()
  })
}

/**
 * Creates a standardized error response object
 * @param {Error} error - The error object
 * @param {string} context - The context where the error occurred
 * @returns {Object} - Standardized error object
 */
export function createErrorResponse(error, context = 'Unknown') {
  return {
    success: false,
    error: getErrorMessage(error),
    context,
    isNetworkError: isNetworkError(error),
    isAuthError: isAuthError(error),
    timestamp: new Date().toISOString()
  }
}

/**
 * Handles async errors with optional retry logic
 * @param {Function} fn - The async function to execute
 * @param {Object} options - Options for retry logic
 * @returns {Promise} - The result or error
 */
export async function handleAsyncError(
  fn,
  options = { retries: 0, delay: 1000, context: 'Unknown' }
) {
  const { retries, delay, context } = options
  let lastError = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      logError(context, error, { attempt: attempt + 1, maxRetries: retries })

      // If we have more retries left and it's a network error, wait and retry
      if (attempt < retries && isNetworkError(error)) {
        await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)))
      } else {
        break
      }
    }
  }

  throw lastError
}
