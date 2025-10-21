import React from 'react'
import PropTypes from 'prop-types'

/**
 * Reusable search bar for notes
 */
function NoteSearch({ searchTerm, onSearchChange, onSearchSubmit, placeholder = "Search notes..." }) {
  return (
    <div style={{ marginBottom: '1.5rem' }} role="search">
      <form onSubmit={onSearchSubmit} aria-label="Search notes">
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <label htmlFor="note-search-input" className="sr-only">Search notes</label>
          <input
            id="note-search-input"
            type="search"
            value={searchTerm}
            onChange={onSearchChange}
            placeholder={placeholder}
            aria-label="Search notes by title, content, or URL"
            style={{
              flex: 1,
              padding: '0.5rem 0.75rem',
              border: '1px solid #cbd5e0',
              borderRadius: '0.375rem',
              fontSize: '1rem'
            }}
          />
          <button
            type="submit"
            aria-label="Submit search"
            style={{
              backgroundColor: '#4299e1',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Search
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange({ target: { value: '' } })}
              aria-label="Clear search"
              style={{
                backgroundColor: '#f56565',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Clear
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

NoteSearch.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onSearchSubmit: PropTypes.func.isRequired,
  placeholder: PropTypes.string
}

NoteSearch.defaultProps = {
  placeholder: "Search notes..."
}

export default React.memo(NoteSearch)
