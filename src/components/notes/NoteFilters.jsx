import React from 'react'
import PropTypes from 'prop-types'

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
  onClearSearch
}) {
  const {
    allTags = [],
    allCategories = [],
    allTypes = [],
    allPriorities = [],
    allImportances = [],
    allStatuses = []
  } = filterOptions

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
              <span className="active-filter" style={{ backgroundColor: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                Search: {searchTerm}
                <button onClick={onClearSearch} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0', marginLeft: '0.25rem', fontWeight: 'bold' }}>×</button>
              </span>
            )}

            {filters.tags.map(tag => (
              <span key={tag} className="active-filter" style={{ backgroundColor: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                #{tag}
                <button onClick={() => onToggleFilter('tags', tag)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0', marginLeft: '0.25rem', fontWeight: 'bold' }}>×</button>
              </span>
            ))}

            {filters.categories.map(category => (
              <span key={category} className="active-filter" style={{ backgroundColor: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                Category: {category}
                <button onClick={() => onToggleFilter('categories', category)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0', marginLeft: '0.25rem', fontWeight: 'bold' }}>×</button>
              </span>
            ))}

            {filters.types.map(type => (
              <span key={type} className="active-filter" style={{ backgroundColor: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                Type: {type}
                <button onClick={() => onToggleFilter('types', type)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0', marginLeft: '0.25rem', fontWeight: 'bold' }}>×</button>
              </span>
            ))}

            {filters.priorities.map(priority => (
              <span key={priority} className="active-filter" style={{ backgroundColor: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                Priority: {priority}
                <button onClick={() => onToggleFilter('priorities', priority)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0', marginLeft: '0.25rem', fontWeight: 'bold' }}>×</button>
              </span>
            ))}

            {filters.importances.map(importance => (
              <span key={importance} className="active-filter" style={{ backgroundColor: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                Importance: {importance}
                <button onClick={() => onToggleFilter('importances', importance)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0', marginLeft: '0.25rem', fontWeight: 'bold' }}>×</button>
              </span>
            ))}

            {filters.statuses.map(status => (
              <span key={status} className="active-filter" style={{ backgroundColor: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                Status: {status}
                <button onClick={() => onToggleFilter('statuses', status)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0', marginLeft: '0.25rem', fontWeight: 'bold' }}>×</button>
              </span>
            ))}

            {filters.isTask !== null && (
              <span className="active-filter" style={{ backgroundColor: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                Task: {filters.isTask ? 'Yes' : 'No'}
                <button onClick={() => onToggleFilter('isTask', null)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0', marginLeft: '0.25rem', fontWeight: 'bold' }}>×</button>
              </span>
            )}

            {filters.isList !== null && (
              <span className="active-filter" style={{ backgroundColor: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                List: {filters.isList ? 'Yes' : 'No'}
                <button onClick={() => onToggleFilter('isList', null)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0', marginLeft: '0.25rem', fontWeight: 'bold' }}>×</button>
              </span>
            )}

            {filters.isIdea !== null && (
              <span className="active-filter" style={{ backgroundColor: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                Idea: {filters.isIdea ? 'Yes' : 'No'}
                <button onClick={() => onToggleFilter('isIdea', null)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0', marginLeft: '0.25rem', fontWeight: 'bold' }}>×</button>
              </span>
            )}

            {filters.date && (
              <span className="active-filter" style={{ backgroundColor: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                Date: {filters.date.toLocaleDateString()}
                <button onClick={() => onToggleFilter('date', null)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0', marginLeft: '0.25rem', fontWeight: 'bold' }}>×</button>
              </span>
            )}

            <button
              onClick={onClearFilters}
              style={{
                backgroundColor: '#f56565',
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
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => onToggleFilter('tags', tag)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: filters.tags.includes(tag) ? '#4299e1' : '#e2e8f0',
                  color: filters.tags.includes(tag) ? 'white' : '#4a5568',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.8rem',
                  transition: 'all 0.2s'
                }}
              >
                #{tag}
              </button>
            ))}
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
                  backgroundColor: filters.categories.includes(category) ? '#4299e1' : '#e2e8f0',
                  color: filters.categories.includes(category) ? 'white' : '#4a5568',
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
                  backgroundColor: filters.types.includes(type) ? '#4299e1' : '#e2e8f0',
                  color: filters.types.includes(type) ? 'white' : '#4a5568',
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
                  backgroundColor: filters.priorities.includes(priority) ? '#4299e1' : '#e2e8f0',
                  color: filters.priorities.includes(priority) ? 'white' : '#4a5568',
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
                  backgroundColor: filters.importances.includes(importance) ? '#4299e1' : '#e2e8f0',
                  color: filters.importances.includes(importance) ? 'white' : '#4a5568',
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
                  backgroundColor: filters.statuses.includes(status) ? '#4299e1' : '#e2e8f0',
                  color: filters.statuses.includes(status) ? 'white' : '#4a5568',
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
            <div style={{ marginBottom: '0.3rem', fontWeight: '500' }}>Task:</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => handleBooleanFilterChange('isTask', true)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: filters.isTask === true ? '#4299e1' : '#e2e8f0',
                  color: filters.isTask === true ? 'white' : '#4a5568',
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
                  backgroundColor: filters.isTask === false ? '#4299e1' : '#e2e8f0',
                  color: filters.isTask === false ? 'white' : '#4a5568',
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
                    backgroundColor: '#f56565',
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
            <div style={{ marginBottom: '0.3rem', fontWeight: '500' }}>List:</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => handleBooleanFilterChange('isList', true)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: filters.isList === true ? '#4299e1' : '#e2e8f0',
                  color: filters.isList === true ? 'white' : '#4a5568',
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
                  backgroundColor: filters.isList === false ? '#4299e1' : '#e2e8f0',
                  color: filters.isList === false ? 'white' : '#4a5568',
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
                    backgroundColor: '#f56565',
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
            <div style={{ marginBottom: '0.3rem', fontWeight: '500' }}>Idea:</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => handleBooleanFilterChange('isIdea', true)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: filters.isIdea === true ? '#4299e1' : '#e2e8f0',
                  color: filters.isIdea === true ? 'white' : '#4a5568',
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
                  backgroundColor: filters.isIdea === false ? '#4299e1' : '#e2e8f0',
                  color: filters.isIdea === false ? 'white' : '#4a5568',
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
                    backgroundColor: '#f56565',
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
  onClearSearch: PropTypes.func
}

export default React.memo(NoteFilters)
