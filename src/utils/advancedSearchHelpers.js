/**
 * Advanced Search Query Executor
 * Processes complex search queries with multiple criteria
 */

/**
 * Executes an advanced search query on a collection of notes
 * @param {Array} notes - Array of note objects to search
 * @param {Object} searchParams - Search parameters
 * @param {Array} searchParams.queries - Array of query objects {field, operator, value}
 * @param {string} searchParams.matchType - 'all' (AND) or 'any' (OR)
 * @returns {Array} Filtered notes
 */
export function executeAdvancedSearch(notes, { queries, matchType }) {
  if (!notes || notes.length === 0) return []
  if (!queries || queries.length === 0) return notes

  return notes.filter(note => {
    const results = queries.map(query => matchQuery(note, query))

    // Apply match type (AND/OR logic)
    if (matchType === 'all') {
      return results.every(result => result === true)
    } else {
      return results.some(result => result === true)
    }
  })
}

/**
 * Matches a single query against a note
 * @param {Object} note - Note object
 * @param {Object} query - Query object {field, operator, value}
 * @returns {boolean}
 */
function matchQuery(note, { field, operator, value }) {
  const noteValue = note[field]

  // Handle null/undefined values
  if (noteValue === null || noteValue === undefined) {
    return operator === 'not_equals' || operator === 'not_contains' || operator === 'not_includes'
  }

  switch (operator) {
    // String operators
    case 'contains':
      return String(noteValue).toLowerCase().includes(String(value).toLowerCase())

    case 'not_contains':
      return !String(noteValue).toLowerCase().includes(String(value).toLowerCase())

    case 'equals':
      return String(noteValue).toLowerCase() === String(value).toLowerCase()

    case 'not_equals':
      return String(noteValue).toLowerCase() !== String(value).toLowerCase()

    case 'starts_with':
      return String(noteValue).toLowerCase().startsWith(String(value).toLowerCase())

    case 'ends_with':
      return String(noteValue).toLowerCase().endsWith(String(value).toLowerCase())

    // Array operators (for tags)
    case 'includes':
      if (Array.isArray(noteValue)) {
        return noteValue.some(item =>
          String(item).toLowerCase().includes(String(value).toLowerCase())
        )
      }
      return String(noteValue).toLowerCase().includes(String(value).toLowerCase())

    case 'not_includes':
      if (Array.isArray(noteValue)) {
        return !noteValue.some(item =>
          String(item).toLowerCase().includes(String(value).toLowerCase())
        )
      }
      return !String(noteValue).toLowerCase().includes(String(value).toLowerCase())

    // Numeric operators
    case 'greater_than':
      return Number(noteValue) > Number(value)

    case 'less_than':
      return Number(noteValue) < Number(value)

    // Date operators
    case 'before':
      return new Date(noteValue) < new Date(value)

    case 'after':
      return new Date(noteValue) > new Date(value)

    case 'between':
      // TODO: Implement between operator (requires two values)
      return false

    default:
      return false
  }
}

/**
 * Validates a search query
 * @param {Array} queries - Array of query objects
 * @returns {Object} {valid: boolean, errors: Array}
 */
export function validateSearchQuery(queries) {
  const errors = []

  queries.forEach((query, index) => {
    if (!query.field) {
      errors.push(`Query ${index + 1}: Field is required`)
    }
    if (!query.operator) {
      errors.push(`Query ${index + 1}: Operator is required`)
    }
    if (query.value === '' || query.value === null || query.value === undefined) {
      errors.push(`Query ${index + 1}: Value is required`)
    }
  })

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Generates a human-readable description of the search query
 * @param {Object} searchParams - Search parameters
 * @returns {string}
 */
export function describeSearchQuery({ queries, matchType }) {
  if (!queries || queries.length === 0) return 'No search criteria'

  const descriptions = queries.map(query => {
    const operatorLabels = {
      contains: 'contains',
      not_contains: 'does not contain',
      equals: 'is',
      not_equals: 'is not',
      starts_with: 'starts with',
      ends_with: 'ends with',
      includes: 'includes',
      not_includes: 'does not include',
      greater_than: 'is greater than',
      less_than: 'is less than',
      before: 'is before',
      after: 'is after'
    }

    const fieldLabel = query.field.replace('_', ' ')
    const operatorLabel = operatorLabels[query.operator] || query.operator
    return `${fieldLabel} ${operatorLabel} "${query.value}"`
  })

  const connector = matchType === 'all' ? ' AND ' : ' OR '
  return descriptions.join(connector)
}
