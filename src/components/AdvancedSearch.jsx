import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useDarkModeColors } from '../hooks/useDarkModeColors'

/**
 * Advanced Search Component with Query Builder
 * Allows users to create complex search queries with multiple criteria
 */
function AdvancedSearch({ onSearch, onClose, filterOptions }) {
  const colors = useDarkModeColors()
  const [queries, setQueries] = useState([
    { field: 'title', operator: 'contains', value: '' }
  ])
  const [matchType, setMatchType] = useState('all') // 'all' (AND) or 'any' (OR)

  const fields = [
    { value: 'title', label: 'Title' },
    { value: 'content', label: 'Content' },
    { value: 'tags', label: 'Tags' },
    { value: 'category', label: 'Category' },
    { value: 'type', label: 'Type' },
    { value: 'status', label: 'Status' },
    { value: 'priority', label: 'Priority' },
    { value: 'importance', label: 'Importance' },
    { value: 'due_date', label: 'Due Date' },
    { value: 'created_at', label: 'Created Date' },
    { value: 'updated_at', label: 'Updated Date' }
  ]

  const operators = {
    title: [
      { value: 'contains', label: 'contains' },
      { value: 'not_contains', label: 'does not contain' },
      { value: 'equals', label: 'equals' },
      { value: 'starts_with', label: 'starts with' },
      { value: 'ends_with', label: 'ends with' }
    ],
    content: [
      { value: 'contains', label: 'contains' },
      { value: 'not_contains', label: 'does not contain' }
    ],
    tags: [
      { value: 'includes', label: 'includes' },
      { value: 'not_includes', label: 'does not include' }
    ],
    category: [
      { value: 'equals', label: 'is' },
      { value: 'not_equals', label: 'is not' }
    ],
    type: [
      { value: 'equals', label: 'is' },
      { value: 'not_equals', label: 'is not' }
    ],
    status: [
      { value: 'equals', label: 'is' },
      { value: 'not_equals', label: 'is not' }
    ],
    priority: [
      { value: 'equals', label: 'is' },
      { value: 'not_equals', label: 'is not' },
      { value: 'greater_than', label: 'is greater than' },
      { value: 'less_than', label: 'is less than' }
    ],
    importance: [
      { value: 'equals', label: 'is' },
      { value: 'not_equals', label: 'is not' },
      { value: 'greater_than', label: 'is greater than' },
      { value: 'less_than', label: 'is less than' }
    ],
    due_date: [
      { value: 'equals', label: 'is' },
      { value: 'before', label: 'is before' },
      { value: 'after', label: 'is after' },
      { value: 'between', label: 'is between' }
    ],
    created_at: [
      { value: 'equals', label: 'is' },
      { value: 'before', label: 'is before' },
      { value: 'after', label: 'is after' },
      { value: 'between', label: 'is between' }
    ],
    updated_at: [
      { value: 'equals', label: 'is' },
      { value: 'before', label: 'is before' },
      { value: 'after', label: 'is after' },
      { value: 'between', label: 'is between' }
    ]
  }

  const addQuery = () => {
    setQueries([...queries, { field: 'title', operator: 'contains', value: '' }])
  }

  const removeQuery = (index) => {
    if (queries.length > 1) {
      setQueries(queries.filter((_, i) => i !== index))
    }
  }

  const updateQuery = (index, field, value) => {
    const newQueries = [...queries]
    newQueries[index][field] = value

    // Reset operator when field changes if current operator is not valid for new field
    if (field === 'field') {
      const validOperators = operators[value] || operators.title
      const currentOperator = newQueries[index].operator
      if (!validOperators.find(op => op.value === currentOperator)) {
        newQueries[index].operator = validOperators[0].value
      }
    }

    setQueries(newQueries)
  }

  const executeSearch = () => {
    // Filter out empty queries
    const validQueries = queries.filter(q => q.value !== '' && q.value !== null)

    if (validQueries.length === 0) {
      alert('Please add at least one search criterion')
      return
    }

    onSearch({ queries: validQueries, matchType })
  }

  const clearSearch = () => {
    setQueries([{ field: 'title', operator: 'contains', value: '' }])
    setMatchType('all')
  }

  const getInputType = (field) => {
    if (field === 'due_date' || field === 'created_at' || field === 'updated_at') {
      return 'date'
    }
    if (field === 'priority' || field === 'importance') {
      return 'number'
    }
    return 'text'
  }

  const getFieldOptions = (field) => {
    switch (field) {
      case 'category':
        return filterOptions?.allCategories || []
      case 'type':
        return filterOptions?.allTypes || []
      case 'status':
        return filterOptions?.allStatuses || []
      case 'tags':
        return filterOptions?.allTags || []
      case 'priority':
        return filterOptions?.allPriorities || []
      case 'importance':
        return filterOptions?.allImportances || []
      default:
        return null
    }
  }

  const inputStyle = {
    padding: '0.5rem',
    borderRadius: '0.375rem',
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.cardBackground,
    color: colors.textPrimary,
    fontSize: '0.875rem',
    width: '100%'
  }

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer'
  }

  const buttonStyle = {
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    border: 'none',
    fontWeight: '500',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'opacity 0.2s'
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1050,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: colors.cardBackground,
          borderRadius: '0.75rem',
          padding: '2rem',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: colors.shadow
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, color: colors.textPrimary }}>Advanced Search</h2>
          <button
            onClick={onClose}
            style={{
              ...buttonStyle,
              backgroundColor: 'transparent',
              color: colors.textMuted,
              fontSize: '1.5rem',
              padding: '0.25rem 0.5rem'
            }}
            aria-label="Close advanced search"
          >
            ×
          </button>
        </div>

        {/* Match Type Selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: colors.textPrimary }}>
            Match:
          </label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: colors.textPrimary }}>
              <input
                type="radio"
                value="all"
                checked={matchType === 'all'}
                onChange={(e) => setMatchType(e.target.value)}
                style={{ accentColor: colors.primary }}
              />
              All conditions (AND)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: colors.textPrimary }}>
              <input
                type="radio"
                value="any"
                checked={matchType === 'any'}
                onChange={(e) => setMatchType(e.target.value)}
                style={{ accentColor: colors.primary }}
              />
              Any condition (OR)
            </label>
          </div>
        </div>

        {/* Query Builder */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: colors.textPrimary }}>
              Search Criteria:
            </label>
            <button
              onClick={addQuery}
              style={{
                ...buttonStyle,
                backgroundColor: colors.primary,
                color: 'white'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              + Add Condition
            </button>
          </div>

          {queries.map((query, index) => (
            <div
              key={index}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(120px, 1fr) minmax(140px, 1fr) minmax(140px, 2fr) auto',
                gap: '0.75rem',
                marginBottom: '0.75rem',
                alignItems: 'start'
              }}
            >
              {/* Field Selector */}
              <select
                value={query.field}
                onChange={(e) => updateQuery(index, 'field', e.target.value)}
                style={selectStyle}
              >
                {fields.map(field => (
                  <option key={field.value} value={field.value}>
                    {field.label}
                  </option>
                ))}
              </select>

              {/* Operator Selector */}
              <select
                value={query.operator}
                onChange={(e) => updateQuery(index, 'operator', e.target.value)}
                style={selectStyle}
              >
                {(operators[query.field] || operators.title).map(op => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>

              {/* Value Input */}
              <div>
                {getFieldOptions(query.field) ? (
                  <select
                    value={query.value}
                    onChange={(e) => updateQuery(index, 'value', e.target.value)}
                    style={selectStyle}
                  >
                    <option value="">Select...</option>
                    {getFieldOptions(query.field).map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={getInputType(query.field)}
                    value={query.value}
                    onChange={(e) => updateQuery(index, 'value', e.target.value)}
                    placeholder="Enter value..."
                    style={inputStyle}
                  />
                )}
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeQuery(index)}
                disabled={queries.length === 1}
                style={{
                  ...buttonStyle,
                  backgroundColor: queries.length === 1 ? colors.border : colors.danger,
                  color: 'white',
                  padding: '0.5rem',
                  opacity: queries.length === 1 ? 0.5 : 1,
                  cursor: queries.length === 1 ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => queries.length > 1 && (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={(e) => queries.length > 1 && (e.currentTarget.style.opacity = '1')}
                aria-label="Remove condition"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            onClick={clearSearch}
            style={{
              ...buttonStyle,
              backgroundColor: colors.border,
              color: colors.textPrimary
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Clear
          </button>
          <button
            onClick={onClose}
            style={{
              ...buttonStyle,
              backgroundColor: colors.border,
              color: colors.textPrimary
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Cancel
          </button>
          <button
            onClick={executeSearch}
            style={{
              ...buttonStyle,
              backgroundColor: colors.success,
              color: 'white'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Search
          </button>
        </div>

        {/* Query Preview */}
        {queries.some(q => q.value) && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: colors.darkerBackground,
            borderRadius: '0.375rem',
            borderLeft: `4px solid ${colors.primary}`
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.5rem', color: colors.textMuted }}>
              QUERY PREVIEW
            </div>
            <div style={{ fontSize: '0.875rem', color: colors.textPrimary, fontFamily: 'monospace' }}>
              {queries.filter(q => q.value).map((q, i) => (
                <div key={i} style={{ marginBottom: '0.25rem' }}>
                  {i > 0 && <span style={{ color: colors.primary, fontWeight: '700' }}>{matchType === 'all' ? ' AND ' : ' OR '}</span>}
                  <span style={{ color: colors.success }}>{q.field}</span>
                  {' '}
                  <span style={{ color: colors.textMuted }}>{(operators[q.field] || operators.title).find(op => op.value === q.operator)?.label}</span>
                  {' '}
                  <span style={{ color: colors.warning }}>"{q.value}"</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

AdvancedSearch.propTypes = {
  onSearch: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  filterOptions: PropTypes.shape({
    allTags: PropTypes.arrayOf(PropTypes.string),
    allCategories: PropTypes.arrayOf(PropTypes.string),
    allTypes: PropTypes.arrayOf(PropTypes.string),
    allPriorities: PropTypes.arrayOf(PropTypes.string),
    allImportances: PropTypes.arrayOf(PropTypes.string),
    allStatuses: PropTypes.arrayOf(PropTypes.string)
  })
}

export default AdvancedSearch
