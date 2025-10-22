import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

// Custom hooks
import { useNotesData } from '../hooks/useNotesData'
import { useNoteFilters } from '../hooks/useNoteFilters'
import { useNotesCRUD } from '../hooks/useNotesCRUD'

// Components
import NoteCard from '../components/notes/NoteCard'
import NoteListItem from '../components/notes/NoteListItem'
import NoteSearch from '../components/notes/NoteSearch'
import NoteSorting from '../components/notes/NoteSorting'
import NoteFilters from '../components/notes/NoteFilters'

// Constants
import { SUCCESS_MESSAGES, ERROR_MESSAGES, CONFIRM_MESSAGES } from '../constants'

function Archive() {
  // Use custom hooks
  const { notes, loading, error: fetchError, removeNoteFromState } = useNotesData(true) // archived=true
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

  const { deleteNote, restoreNote } = useNotesCRUD()

  // Mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle permanent deletion
  const handlePermanentDelete = useCallback(async (id) => {
    if (!window.confirm(CONFIRM_MESSAGES.DELETE_NOTE)) return

    const { error } = await deleteNote(id)
    if (!error) {
      removeNoteFromState(id)
      toast.success(SUCCESS_MESSAGES.NOTE_DELETED)
    } else {
      toast.error(ERROR_MESSAGES.NOTE_DELETE_FAILED)
    }
  }, [deleteNote, removeNoteFromState])

  // Handle restore
  const handleRestore = useCallback(async (id) => {
    if (!window.confirm(CONFIRM_MESSAGES.RESTORE_NOTE)) return

    const { error } = await restoreNote(id)
    if (!error) {
      removeNoteFromState(id)
      toast.success(SUCCESS_MESSAGES.NOTE_RESTORED)
    } else {
      toast.error(ERROR_MESSAGES.NOTE_RESTORE_FAILED)
    }
  }, [restoreNote, removeNoteFromState])

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

      {/* Left Sidebar - Hidden on mobile unless toggled */}
      <aside
        className={`archive-sidebar ${showMobileFilters ? 'mobile-visible' : ''}`}
        style={{
          width: '300px',
          flexShrink: 0,
          backgroundColor: showMobileFilters && isMobile ? 'white' : 'transparent',
          borderRadius: showMobileFilters && isMobile ? '0.5rem' : '0',
          boxShadow: showMobileFilters && isMobile ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
          padding: showMobileFilters && isMobile ? '1rem' : '0',
          marginBottom: showMobileFilters && isMobile ? '1rem' : '0'
        }}>
          {/* Filters in Sidebar */}
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

          {/* Sorting in Sidebar */}
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
        {/* Header */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Archive</h2>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.5rem 0.75rem',
                backgroundColor: '#edf2f7',
                color: '#4a5568',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              <span style={{ marginRight: '0.25rem' }}>←</span> Back to Notes
            </Link>
          </div>
        </div>

        {fetchError && <div className="error">{fetchError}</div>}

        {/* Search */}
        <NoteSearch
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          onSearchSubmit={(e) => e.preventDefault()}
          placeholder="Search archived notes by title, content, or URL..."
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
              <span>Found <strong>{filteredNotes.length}</strong> {filteredNotes.length === 1 ? 'archived note' : 'archived notes'} matching your criteria</span>
            ) : (
              <span>Showing all <strong>{notes.length}</strong> {notes.length === 1 ? 'archived note' : 'archived notes'}</span>
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
          <div className="loading">Loading archived notes...</div>
        ) : filteredNotes.length > 0 ? (
          <div
            role="table"
            aria-label={`${filteredNotes.length} ${filteredNotes.length === 1 ? 'archived note' : 'archived notes'} found`}
            style={{
              marginTop: '1rem',
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}
          >
            {/* Archived Notes List */}
            {filteredNotes.map(note => (
              <NoteListItem
                key={note.id}
                note={note}
                onTagClick={toggleFilter.bind(null, 'tags')}
                onCategoryClick={toggleFilter.bind(null, 'categories')}
                onTypeClick={toggleFilter.bind(null, 'types')}
                onDelete={handlePermanentDelete}
                onRestore={handleRestore}
                isArchived={true}
              />
            ))}
          </div>
        ) : (
          <div className="no-notes">
            {hasActiveFilters ? 'No archived notes match your filters.' : 'No archived notes yet.'}
          </div>
        )}
      </main>
    </div>
  )
}

export default Archive
