import React from 'react'
import PropTypes from 'prop-types'

/**
 * Reusable sorting controls for notes
 */
function NoteSorting({ sorting, onSortingChange, filters, onFiltersChange }) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        padding: '0.75rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '0.5rem',
        gap: '1rem'
      }}
    >
      {/* Sort by field and direction */}
      <div>
        <span style={{ fontWeight: '500', marginRight: '0.5rem' }}>Sort by:</span>
        <select
          value={sorting.field}
          onChange={(e) => onSortingChange({ ...sorting, field: e.target.value })}
          style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', marginRight: '0.5rem' }}
        >
          <option value="updated_at">Date Modified</option>
          <option value="created_at">Date Created</option>
          <option value="title">Title</option>
          <option value="due_date">Due Date</option>
          <option value="status">Status</option>
        </select>

        <select
          value={sorting.direction}
          onChange={(e) => onSortingChange({ ...sorting, direction: e.target.value })}
          style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      {/* Due Date filter */}
      {filters && onFiltersChange && (
        <>
          <div>
            <label htmlFor="dueDateFilter" style={{ marginRight: '0.5rem', fontWeight: 'bold' }}>
              Due Date:
            </label>
            <select
              id="dueDateFilter"
              value={filters.showWithDueDate}
              onChange={(e) => onFiltersChange({ ...filters, showWithDueDate: e.target.value })}
              style={{
                padding: '0.25rem 0.5rem',
                border: '1px solid #cbd5e0',
                borderRadius: '4px',
                backgroundColor: 'white'
              }}
            >
              <option value="both">Show All Notes</option>
              <option value="with">Only With Due Date</option>
              <option value="without">Only Without Due Date</option>
            </select>
          </div>

          {/* URL filter */}
          <div>
            <label htmlFor="urlFilter" style={{ marginRight: '0.5rem', fontWeight: 'bold' }}>
              URLs:
            </label>
            <select
              id="urlFilter"
              value={filters.showWithUrl}
              onChange={(e) => onFiltersChange({ ...filters, showWithUrl: e.target.value })}
              style={{
                padding: '0.25rem 0.5rem',
                border: '1px solid #cbd5e0',
                borderRadius: '4px',
                backgroundColor: 'white'
              }}
            >
              <option value="both">Show All Notes</option>
              <option value="with">Only With URLs</option>
              <option value="without">Only Without URLs</option>
            </select>
          </div>
        </>
      )}
    </div>
  )
}

NoteSorting.propTypes = {
  sorting: PropTypes.shape({
    field: PropTypes.string.isRequired,
    direction: PropTypes.oneOf(['asc', 'desc']).isRequired
  }).isRequired,
  onSortingChange: PropTypes.func.isRequired,
  filters: PropTypes.shape({
    showWithDueDate: PropTypes.oneOf(['both', 'with', 'without']),
    showWithUrl: PropTypes.oneOf(['both', 'with', 'without'])
  }),
  onFiltersChange: PropTypes.func
}

export default React.memo(NoteSorting)
