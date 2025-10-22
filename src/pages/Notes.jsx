import { useState, useCallback } from 'react'
import { useNotesData } from '../hooks/useNotesData'
import { useNoteFilters } from '../hooks/useNoteFilters'
import { useNotesCRUD } from '../hooks/useNotesCRUD'
import NoteListItem from '../components/notes/NoteListItem'
import NoteSearch from '../components/notes/NoteSearch'
import NoteSorting from '../components/notes/NoteSorting'
import NoteFilters from '../components/notes/NoteFilters'
import { CONFIRM_MESSAGES } from '../constants'

function Notes() {
  const { notes, loading, error: fetchError, removeNoteFromState } = useNotesData(false)
  const {
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
    sorting,
    setSorting,
    filteredNotes,
    filterOptions,
    toggleFilter,
    clearFilters,
    hasActiveFilters
  } = useNoteFilters(notes)

  const { deleteNote, archiveNote } = useNotesCRUD()

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Handle note deletion
  const handleDeleteNote = useCallback(async (id) => {
    if (!window.confirm(CONFIRM_MESSAGES.DELETE_NOTE)) return

    const { error } = await deleteNote(id)
    if (!error) {
      removeNoteFromState(id)
    }
  }, [deleteNote, removeNoteFromState])

  // Handle note archiving
  const handleArchiveNote = useCallback(async (id) => {
    if (!window.confirm(CONFIRM_MESSAGES.ARCHIVE_NOTE)) return

    const { error } = await archiveNote(id)
    if (!error) {
      removeNoteFromState(id)
    }
  }, [archiveNote, removeNoteFromState])

  return (
    <div style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '1rem' : '2rem'
    }}>
      {/* Mobile: Filters Toggle Button */}
      {isMobile && (
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          style={{
            padding: '0.75rem',
            backgroundColor: '#4299e1',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          {showMobileFilters ? '✕ Hide Filters' : '☰ Show Filters'}
        </button>
      )}

      {/* Left Sidebar - Filters */}
      <aside
        className={`notes-sidebar ${showMobileFilters ? 'mobile-visible' : ''}`}
        style={{
          width: '300px',
          flexShrink: 0,
          backgroundColor: showMobileFilters && isMobile ? 'white' : 'transparent',
          borderRadius: showMobileFilters && isMobile ? '0.5rem' : '0',
          boxShadow: showMobileFilters && isMobile ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
          padding: showMobileFilters && isMobile ? '1rem' : '0',
          marginBottom: showMobileFilters && isMobile ? '1rem' : '0',
          display: isMobile && !showMobileFilters ? 'none' : 'block'
        }}>

        {/* Filters */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#2d3748' }}>Filters</h3>
          <NoteFilters
            filters={filters}
            filterOptions={filterOptions}
            onToggleFilter={toggleFilter}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
            searchTerm={searchTerm}
            onClearSearch={() => setSearchTerm('')}
          />
        </div>

        {/* Sorting */}
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#2d3748' }}>Sort By</h3>
          <NoteSorting
            sorting={sorting}
            onSortingChange={setSorting}
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, minWidth: 0 }}>
        <section aria-labelledby="all-notes-heading">
          <h1 id="all-notes-heading" style={{ marginBottom: '1.5rem' }}>All Notes</h1>

          {fetchError && <div className="error" role="alert" aria-live="polite">{fetchError}</div>}

          {/* Search */}
          <NoteSearch
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            onSearchSubmit={(e) => e.preventDefault()}
            placeholder="Search notes by title, content, or URL..."
          />

          {/* Note count */}
          <div style={{
            marginBottom: '1rem',
            fontSize: '0.95rem',
            color: '#4a5568',
            backgroundColor: '#edf2f7',
            padding: '0.5rem 0.75rem',
            borderRadius: '0.375rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              {hasActiveFilters ? (
                <span>Found <strong>{filteredNotes.length}</strong> {filteredNotes.length === 1 ? 'note' : 'notes'} matching your criteria</span>
              ) : (
                <span>Showing all <strong>{notes.length}</strong> {notes.length === 1 ? 'note' : 'notes'}</span>
              )}
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                style={{
                  backgroundColor: 'transparent',
                  color: '#3182ce',
                  border: 'none',
                  padding: '0.25rem 0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  textDecoration: 'underline'
                }}
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Notes List */}
          {loading ? (
            <div className="loading" role="status" aria-live="polite">
              <span aria-label="Loading notes">Loading notes...</span>
            </div>
          ) : filteredNotes.length > 0 ? (
            <div
              role="table"
              aria-label={`${filteredNotes.length} ${filteredNotes.length === 1 ? 'note' : 'notes'} found`}
              style={{
                marginTop: '1rem',
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                overflow: 'hidden'
              }}
            >
              {filteredNotes.map(note => (
                <NoteListItem
                  key={note.id}
                  note={note}
                  onTagClick={toggleFilter.bind(null, 'tags')}
                  onCategoryClick={toggleFilter.bind(null, 'categories')}
                  onTypeClick={toggleFilter.bind(null, 'types')}
                  onDelete={handleDeleteNote}
                  onArchive={handleArchiveNote}
                  isArchived={false}
                />
              ))}
            </div>
          ) : (
            <div className="no-notes" role="status" aria-live="polite">
              {hasActiveFilters ? 'No notes match your filters.' : 'No notes yet.'}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default Notes
