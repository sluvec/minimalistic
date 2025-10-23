import React from 'react'
import PropTypes from 'prop-types'
import { useDarkModeColors } from '../../hooks/useDarkModeColors'

/**
 * Comprehensive filter component for notes
 * Handles tags, categories, types, priorities, importances, statuses, and boolean filters
 */
function NoteFilters({
  filters,
  filterOptions,
  onToggleFilter,
  onClearFilters,
  hasActiveFilters,
  searchTerm,
  onClearSearch,
  notes = [] // Add notes prop to calculate counts
}) {
  const colors = useDarkModeColors()
  const {
    allTags = [],
    allCategories = [],
    allTypes = [],
    allPriorities = [],
    allImportances = [],
    allStatuses = []
  } = filterOptions

  // Calculate count for each filter option
  const getFilterCount = (filterType, value) => {
    if (!notes || notes.length === 0) return 0

    return notes.filter(note => {
      switch (filterType) {
        case 'tags':
          return note.tags && note.tags.includes(value)
        case 'categories':
          return note.category === value
        case 'types':
          return note.type === value
        case 'priorities':
          return note.priority === value
        case 'importances':
          return note.importance === value
        case 'statuses':
          return note.status === value
        default:
          return false
      }
    }).length
  }

  const handleBooleanFilterChange = (filterName, value) => {
    onToggleFilter(filterName, value === filters[filterName] ? null : value)
  }

  return (
    <div className="filter-section" style={{ marginBottom: '1.5rem', marginTop: '1rem' }}>
      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="active-filters" style={{ marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Active Filters:</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {searchTerm && (
              <span className="active-filter" style={{ backgroundColor: colors.cardBackground, padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                Search: {searchTerm}
                <button onClick={onClearSearch} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0', marginLeft: '0.25rem', fontWeight: 'bold' }}>×</button>
              </span>
            )}

            {filters.tags.map(tag => (
              <span key={tag} className="active-filter" style={{ backgroundColor: colors.cardBackground, padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                #{tag}
                <button onClick={() => onToggleFilter('tags', tag)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0', marginLeft: '0.25rem', fontWeight: 'bold' }}>×</button>
              </span>
            ))}

            {filters.categories.map(category => (
              <span key={category} className="active-filter" style={{ backgroundColor: colors.cardBackground, padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                Category: {category}
                <button onClick={() => onToggleFilter('categories', category)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0', marginLeft: '0.25rem', fontWeight: 'bold' }}>×</button>
              </span>
            ))}

            {filters.types.map(type => (
              <span key={type} className="active-filter" style={{ backgroundColor: colors.cardBackground, padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                Type: {type}
                <button onClick={() => onToggleFilter('types', type)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0', marginLeft: '0.25rem', fontWeight: 'bold' }}>×</button>
              </span>
            ))}

            {filters.priorities.map(priority => (
              <span key={priority} className="active-filter" style={{ backgroundColor: colors.cardBackground, padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                Priority: {priority}
                <button onClick={() => onToggleFilter('priorities', priority)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0', marginLeft: '0.25rem', fontWeight: 'bold' }}>×</button>
              </span>
            ))}

            {filters.importances.map(importance => (
              <span key={importance} className="active-filter" style={{ backgroundColor: colors.cardBackground, padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                Importance: {importance}
                <button onClick={() => onToggleFilter('importances', importance)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0', marginLeft: '0.25rem', fontWeight: 'bold' }}>×</button>
              </span>
            ))}

            {filters.statuses.map(status => (
              <span key={status} className="active-filter" style={{ backgroundColor: colors.cardBackground, padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                Status: {status}
                <button onClick={() => onToggleFilter('statuses', status)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0', marginLeft: '0.25rem', fontWeight: 'bold' }}>×</button>
              </span>
            ))}

            {filters.isTask !== null && (
              <span className="active-filter" style={{ backgroundColor: colors.cardBackground, padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                Task: {filters.isTask ? 'Yes' : 'No'}
                <button onClick={() => onToggleFilter('isTask', null)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0', marginLeft: '0.25rem', fontWeight: 'bold' }}>×</button>
              </span>
            )}

            {filters.isList !== null && (
              <span className="active-filter" style={{ backgroundColor: colors.cardBackground, padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                List: {filters.isList ? 'Yes' : 'No'}
                <button onClick={() => onToggleFilter('isList', null)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0', marginLeft: '0.25rem', fontWeight: 'bold' }}>×</button>
              </span>
            )}

            {filters.isIdea !== null && (
              <span className="active-filter" style={{ backgroundColor: colors.cardBackground, padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                Idea: {filters.isIdea ? 'Yes' : 'No'}
                <button onClick={() => onToggleFilter('isIdea', null)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0', marginLeft: '0.25rem', fontWeight: 'bold' }}>×</button>
              </span>
            )}

            {filters.date && (
              <span className="active-filter" style={{ backgroundColor: colors.cardBackground, padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                Date: {filters.date.toLocaleDateString()}
                <button onClick={() => onToggleFilter('date', null)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0', marginLeft: '0.25rem', fontWeight: 'bold' }}>×</button>
              </span>
            )}

            <button
              onClick={onClearFilters}
              style={{
                backgroundColor: colors.danger,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.2rem 0.5rem',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Tags filter */}
      {allTags.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Tags:</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {allTags.map(tag => {
              const count = getFilterCount('tags', tag)
              return (
                <button
                  key={tag}
                  onClick={() => onToggleFilter('tags', tag)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: filters.tags.includes(tag) ? colors.primary : colors.cardBackground,
                    color: filters.tags.includes(tag) ? 'white' : colors.textPrimary,
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.8rem',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <span>#{tag}</span>
                  <span style={{
                    fontSize: '0.7rem',
                    opacity: 0.8,
                    fontWeight: 600
                  }}>
                    ({count})
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Categories filter */}
      {allCategories.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Categories:</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {allCategories.map(category => (
              <button
                key={category}
                onClick={() => onToggleFilter('categories', category)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: filters.categories.includes(category) ? colors.primary : colors.cardBackground,
                  color: filters.categories.includes(category) ? 'white' : colors.textPrimary,
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.8rem',
                  transition: 'all 0.2s'
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Types filter */}
      {allTypes.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Types:</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {allTypes.map(type => (
              <button
                key={type}
                onClick={() => onToggleFilter('types', type)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: filters.types.includes(type) ? colors.primary : colors.cardBackground,
                  color: filters.types.includes(type) ? 'white' : colors.textPrimary,
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.8rem',
                  transition: 'all 0.2s'
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Priorities filter */}
      {allPriorities.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Priorities:</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {allPriorities.map(priority => (
              <button
                key={priority}
                onClick={() => onToggleFilter('priorities', priority)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: filters.priorities.includes(priority) ? colors.primary : colors.cardBackground,
                  color: filters.priorities.includes(priority) ? 'white' : colors.textPrimary,
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.8rem',
                  transition: 'all 0.2s'
                }}
              >
                {priority}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Importances filter */}
      {allImportances.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Importances:</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {allImportances.map(importance => (
              <button
                key={importance}
                onClick={() => onToggleFilter('importances', importance)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: filters.importances.includes(importance) ? colors.primary : colors.cardBackground,
                  color: filters.importances.includes(importance) ? 'white' : colors.textPrimary,
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.8rem',
                  transition: 'all 0.2s'
                }}
              >
                {importance}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Statuses filter */}
      {allStatuses.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Statuses:</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {allStatuses.map(status => (
              <button
                key={status}
                onClick={() => onToggleFilter('statuses', status)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: filters.statuses.includes(status) ? colors.primary : colors.cardBackground,
                  color: filters.statuses.includes(status) ? 'white' : colors.textPrimary,
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.8rem',
                  transition: 'all 0.2s'
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Boolean filters (Task, List, Idea) */}
      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Note Type Filters:</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ marginBottom: '0.3rem', fontWeight: '500', color: colors.textPrimary }}>Task:</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => handleBooleanFilterChange('isTask', true)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: filters.isTask === true ? colors.primary : colors.cardBackground,
                  color: filters.isTask === true ? 'white' : colors.textPrimary,
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.8rem',
                  transition: 'all 0.2s'
                }}
              >
                Yes
              </button>
              <button
                onClick={() => handleBooleanFilterChange('isTask', false)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: filters.isTask === false ? colors.primary : colors.cardBackground,
                  color: filters.isTask === false ? 'white' : colors.textPrimary,
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.8rem',
                  transition: 'all 0.2s'
                }}
              >
                No
              </button>
              {filters.isTask !== null && (
                <button
                  onClick={() => onToggleFilter('isTask', null)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: colors.danger,
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.8rem'
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ marginBottom: '0.3rem', fontWeight: '500', color: colors.textPrimary }}>List:</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => handleBooleanFilterChange('isList', true)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: filters.isList === true ? colors.primary : colors.cardBackground,
                  color: filters.isList === true ? 'white' : colors.textPrimary,
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.8rem',
                  transition: 'all 0.2s'
                }}
              >
                Yes
              </button>
              <button
                onClick={() => handleBooleanFilterChange('isList', false)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: filters.isList === false ? colors.primary : colors.cardBackground,
                  color: filters.isList === false ? 'white' : colors.textPrimary,
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.8rem',
                  transition: 'all 0.2s'
                }}
              >
                No
              </button>
              {filters.isList !== null && (
                <button
                  onClick={() => onToggleFilter('isList', null)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: colors.danger,
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.8rem'
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ marginBottom: '0.3rem', fontWeight: '500', color: colors.textPrimary }}>Idea:</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => handleBooleanFilterChange('isIdea', true)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: filters.isIdea === true ? colors.primary : colors.cardBackground,
                  color: filters.isIdea === true ? 'white' : colors.textPrimary,
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.8rem',
                  transition: 'all 0.2s'
                }}
              >
                Yes
              </button>
              <button
                onClick={() => handleBooleanFilterChange('isIdea', false)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: filters.isIdea === false ? colors.primary : colors.cardBackground,
                  color: filters.isIdea === false ? 'white' : colors.textPrimary,
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.8rem',
                  transition: 'all 0.2s'
                }}
              >
                No
              </button>
              {filters.isIdea !== null && (
                <button
                  onClick={() => onToggleFilter('isIdea', null)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: colors.danger,
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.8rem'
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

NoteFilters.propTypes = {
  filters: PropTypes.shape({
    tags: PropTypes.arrayOf(PropTypes.string),
    categories: PropTypes.arrayOf(PropTypes.string),
    types: PropTypes.arrayOf(PropTypes.string),
    priorities: PropTypes.arrayOf(PropTypes.string),
    importances: PropTypes.arrayOf(PropTypes.string),
    statuses: PropTypes.arrayOf(PropTypes.string),
    isTask: PropTypes.bool,
    isList: PropTypes.bool,
    isIdea: PropTypes.bool
  }).isRequired,
  filterOptions: PropTypes.shape({
    allTags: PropTypes.arrayOf(PropTypes.string),
    allCategories: PropTypes.arrayOf(PropTypes.string),
    allTypes: PropTypes.arrayOf(PropTypes.string),
    allPriorities: PropTypes.arrayOf(PropTypes.string),
    allImportances: PropTypes.arrayOf(PropTypes.string),
    allStatuses: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  onToggleFilter: PropTypes.func.isRequired,
  onClearFilters: PropTypes.func.isRequired,
  hasActiveFilters: PropTypes.bool.isRequired,
  searchTerm: PropTypes.string,
  onClearSearch: PropTypes.func,
  notes: PropTypes.array
}

export default React.memo(NoteFilters)
