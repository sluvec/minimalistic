/**
 * Tag processing helper functions
 */

import { sanitizeArray } from './validation'

/**
 * Parses a comma-separated string of tags into an array
 * @param {string} tagsString - Comma-separated tags
 * @returns {Array<string>|null} - Array of tags or null if empty
 */
export function parseTags(tagsString) {
  if (!tagsString || tagsString.trim() === '') {
    return null
  }

  const tags = tagsString
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag !== '')

  return tags.length > 0 ? tags : null
}

/**
 * Converts a tags array to a comma-separated string
 * @param {Array<string>} tagsArray - Array of tags
 * @returns {string} - Comma-separated string
 */
export function tagsToString(tagsArray) {
  if (!tagsArray || !Array.isArray(tagsArray) || tagsArray.length === 0) {
    return ''
  }

  return tagsArray.join(', ')
}

/**
 * Normalizes tags by removing duplicates and sanitizing
 * @param {Array<string>} tags - Array of tags
 * @returns {Array<string>} - Normalized array
 */
export function normalizeTags(tags) {
  if (!Array.isArray(tags)) return []

  const sanitized = sanitizeArray(tags)
  const unique = [...new Set(sanitized)]

  return unique.sort()
}

/**
 * Extracts all unique values from an array of objects for a given key
 * Used for extracting unique categories, types, etc.
 * @param {Array<Object>} items - Array of objects
 * @param {string} key - The key to extract
 * @returns {Array<string>} - Sorted array of unique values
 */
export function extractUniqueValues(items, key) {
  if (!Array.isArray(items) || items.length === 0) {
    return []
  }

  const values = items
    .map(item => item[key])
    .filter(value => value !== null && value !== undefined && value !== '')

  return [...new Set(values)].sort()
}

/**
 * Extracts all unique tags from an array of notes
 * @param {Array<Object>} notes - Array of note objects
 * @returns {Array<string>} - Sorted array of unique tags
 */
export function extractUniqueTags(notes) {
  if (!Array.isArray(notes) || notes.length === 0) {
    return []
  }

  const allTags = notes
    .flatMap(note => note.tags || [])
    .filter(tag => tag !== null && tag !== undefined && tag !== '')

  return [...new Set(allTags)].sort()
}

/**
 * Checks if a note matches a tag filter
 * @param {Object} note - The note object
 * @param {Array<string>} tagFilters - Array of tag filters
 * @returns {boolean} - True if note has all specified tags
 */
export function matchesTags(note, tagFilters) {
  if (!tagFilters || tagFilters.length === 0) return true
  if (!note.tags || !Array.isArray(note.tags)) return false

  return tagFilters.every(tag => note.tags.includes(tag))
}
