import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
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

// Constants and utilities
import { SUCCESS_MESSAGES, ERROR_MESSAGES, CONFIRM_MESSAGES, STATUS } from '../constants'
import { parseTags } from '../utils/tagHelpers'
import { validateNote } from '../utils/validation'
import { formatDateForDisplay } from '../utils/dateHelpers'

function Dashboard() {
  // Use custom hooks
  const { notes, loading, error: fetchError, refresh, removeNoteFromState } = useNotesData(false)
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

  // Quick note form state
  const [quickNote, setQuickNote] = useState({
    title: '',
    content: '',
    category: '',
    type: '',
    tags: '',
    due_date: '',
    url: '',
    priority: '',
    importance: '',
    status: STATUS.NEW,
    isTask: false,
    isList: false,
    isIdea: false
  })
  const [quickNoteError, setQuickNoteError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCalendar, setShowCalendar] = useState(true)

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

  // Handle quick note input changes
  const handleQuickNoteChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    setQuickNote(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }, [])

  // Handle quick note submission
  const handleQuickNoteSubmit = async (e) => {
    e.preventDefault()

    // Prevent double submission
    if (isSubmitting) return

    setQuickNoteError(null)
    setIsSubmitting(true)

    try {
      // Validate note
      const validation = validateNote(quickNote)
      if (!validation.valid) {
        const firstError = Object.values(validation.errors)[0]
        setQuickNoteError(firstError)
        return
      }

      // Parse tags using utility
      const processedTags = parseTags(quickNote.tags)

      const user = await supabase.auth.getUser()
      if (!user.data.user) {
        setQuickNoteError(ERROR_MESSAGES.AUTH_REQUIRED)
        return
      }

      const { error } = await supabase
        .from('notes')
        .insert({
          title: quickNote.title,
          content: quickNote.content,
          category: quickNote.category || null,
          type: quickNote.type || null,
          tags: processedTags,
          due_date: quickNote.due_date || null,
          url: quickNote.url || null,
          priority: quickNote.priority || null,
          importance: quickNote.importance || null,
          status: quickNote.status || STATUS.NEW,
          isTask: quickNote.isTask,
          isList: quickNote.isList,
          isIdea: quickNote.isIdea,
          user_id: user.data.user.id
        })

      if (error) throw error

      // Reset form
      setQuickNote({
        title: '',
        content: '',
        category: '',
        type: '',
        tags: '',
        due_date: '',
        url: '',
        priority: '',
        importance: '',
        status: STATUS.NEW,
        isTask: false,
        isList: false,
        isIdea: false
      })

      toast.success(SUCCESS_MESSAGES.NOTE_CREATED)
      refresh()

    } catch (error) {
      console.error('Error creating note:', error)
      setQuickNoteError(ERROR_MESSAGES.NOTE_CREATE_FAILED)
      toast.error(ERROR_MESSAGES.NOTE_CREATE_FAILED)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle note deletion
  const handleDeleteNote = useCallback(async (id) => {
    if (!window.confirm(CONFIRM_MESSAGES.DELETE_NOTE)) return

    const { error } = await deleteNote(id)
    if (!error) {
      removeNoteFromState(id)
      toast.success(SUCCESS_MESSAGES.NOTE_DELETED)
    } else {
      toast.error(ERROR_MESSAGES.NOTE_DELETE_FAILED)
    }
  }, [deleteNote, removeNoteFromState])

  // Handle note archiving
  const handleArchiveNote = useCallback(async (id) => {
    if (!window.confirm(CONFIRM_MESSAGES.ARCHIVE_NOTE)) return

    const { error } = await archiveNote(id)
    if (!error) {
      removeNoteFromState(id)
      toast.success(SUCCESS_MESSAGES.NOTE_ARCHIVED)
    } else {
      toast.error(ERROR_MESSAGES.NOTE_ARCHIVE_FAILED)
    }
  }, [archiveNote, removeNoteFromState])

  // Calendar handlers
  const handleCalendarChange = useCallback((date) => {
    setFilters(prev => ({ ...prev, date }))

    if (date) {
      const formattedDate = date.toISOString().split('T')[0]
      setQuickNote(prev => ({ ...prev, due_date: formattedDate }))
    }
  }, [])

  const handleClearDateFilter = useCallback(() => {
    setFilters(prev => ({ ...prev, date: null }))
  }, [])

  const tileClassName = useCallback(({ date, view }) => {
    if (view === 'month') {
      const hasNotes = filterOptions.datesWithNotes.some(noteDate =>
        noteDate.getDate() === date.getDate() &&
        noteDate.getMonth() === date.getMonth() &&
        noteDate.getFullYear() === date.getFullYear()
      )
      return hasNotes ? 'has-notes' : null
    }
  }, [filterOptions.datesWithNotes])

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
          {showMobileFilters ? '✕ Hide Filters' : '☰ Show Filters & Calendar'}
        </button>
      )}

      {/* Left Sidebar - Hidden on mobile unless toggled */}
      <aside
        className={`dashboard-sidebar ${showMobileFilters ? 'mobile-visible' : ''}`}
        style={{
          width: '300px',
          flexShrink: 0,
          position: 'sticky',
          top: '1rem',
          height: 'fit-content',
          maxHeight: 'calc(100vh - 2rem)',
          overflowY: 'auto',
          backgroundColor: showMobileFilters && isMobile ? 'white' : 'transparent',
          borderRadius: showMobileFilters && isMobile ? '0.5rem' : '0',
          boxShadow: showMobileFilters && isMobile ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
          padding: showMobileFilters && isMobile ? '1rem' : '0',
          marginBottom: showMobileFilters && isMobile ? '1rem' : '0'
        }}>
        {/* Calendar */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#2d3748' }}>Calendar</h3>
          <div style={{
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            borderRadius: '0.5rem',
            overflow: 'hidden'
          }}>
            <style>
              {`
                .react-calendar {
                  width: 100%;
                  border: none;
                  font-family: Arial, sans-serif;
                }
                .react-calendar__tile--active {
                  background: #4299e1;
                  color: white;
                }
                .has-notes {
                  background-color: #FED7D7;
                  font-weight: bold;
                }
                .react-calendar__tile--active.has-notes {
                  background: #4299e1;
                }
              `}
            </style>
            <Calendar
              onChange={handleCalendarChange}
              value={filters.date}
              tileClassName={tileClassName}
              showNeighboringMonth={false}
              minDetail="month"
              maxDetail="month"
              showFixedNumberOfWeeks={false}
              selectRange={false}
              next2Label={null}
              prev2Label={null}
            />
            {filters.date && (
              <div style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#EBF8FF',
                color: '#2C5282',
                fontSize: '0.85rem'
              }}>
                <strong>Filtered:</strong> {formatDateForDisplay(filters.date)}
                <button
                  onClick={handleClearDateFilter}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#4299e1',
                    fontSize: '0.75rem',
                    marginLeft: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  ⨉ Clear
                </button>
              </div>
            )}
          </div>
        </div>

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
        {/* Quick Note Form */}
        <section aria-labelledby="quick-note-heading" style={{ marginBottom: '2rem' }}>
          <h2 id="quick-note-heading">Quick Note</h2>

          {quickNoteError && (
            <div className="error" role="alert" aria-live="polite" style={{ marginBottom: '1rem' }}>{quickNoteError}</div>
          )}

        <form onSubmit={handleQuickNoteSubmit} aria-label="Create a new note" style={{
          backgroundColor: '#f8f9fa',
          padding: '1rem',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <label htmlFor="quick-title">Title (optional)</label>
            <input
              id="quick-title"
              type="text"
              name="title"
              value={quickNote.title}
              onChange={handleQuickNoteChange}
              aria-label="Note title"
              style={{ width: '100%', marginBottom: '0.5rem' }}
            />
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label htmlFor="quick-content">Content*</label>
            <textarea
              id="quick-content"
              name="content"
              placeholder="Note Content"
              value={quickNote.content}
              onChange={handleQuickNoteChange}
              rows={4}
              aria-label="Note content"
              aria-required="true"
              style={{ width: '100%', marginBottom: '0.5rem' }}
            ></textarea>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 20%', minWidth: '150px' }}>
              <label htmlFor="quick-category" className="sr-only">Category</label>
              <input
                id="quick-category"
                type="text"
                name="category"
                placeholder="Category (optional)"
                value={quickNote.category}
                onChange={handleQuickNoteChange}
                aria-label="Note category"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ flex: '1 1 20%', minWidth: '150px' }}>
              <label htmlFor="quick-type" className="sr-only">Type</label>
              <input
                id="quick-type"
                type="text"
                name="type"
                placeholder="Type (optional)"
                value={quickNote.type}
                onChange={handleQuickNoteChange}
                aria-label="Note type"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ flex: '1 1 20%', minWidth: '150px' }}>
              <label htmlFor="quick-due-date" className="sr-only">Due Date</label>
              <input
                id="quick-due-date"
                type="date"
                name="due_date"
                placeholder="Due Date (optional)"
                value={quickNote.due_date}
                onChange={handleQuickNoteChange}
                aria-label="Note due date"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ flex: '1 1 40%', minWidth: '150px' }}>
              <label htmlFor="quick-tags" className="sr-only">Tags</label>
              <input
                id="quick-tags"
                type="text"
                name="tags"
                placeholder="Tags (comma separated, optional)"
                value={quickNote.tags}
                onChange={handleQuickNoteChange}
                aria-label="Note tags, comma separated"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 25%', minWidth: '150px' }}>
              <input
                type="text"
                name="priority"
                placeholder="Priority (optional)"
                value={quickNote.priority}
                onChange={handleQuickNoteChange}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ flex: '1 1 25%', minWidth: '150px' }}>
              <input
                type="text"
                name="importance"
                placeholder="Importance (optional)"
                value={quickNote.importance}
                onChange={handleQuickNoteChange}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ flex: '1 1 25%', minWidth: '150px' }}>
              <input
                type="url"
                name="url"
                placeholder="URL (optional)"
                value={quickNote.url}
                onChange={handleQuickNoteChange}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ flex: '1 1 25%', minWidth: '150px' }}>
              <input
                type="text"
                name="status"
                placeholder="Status"
                value={quickNote.status}
                onChange={handleQuickNoteChange}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginRight: '1rem' }}>
              <input
                type="checkbox"
                id="quickIsTask"
                name="isTask"
                checked={quickNote.isTask}
                onChange={handleQuickNoteChange}
                style={{ marginRight: '0.3rem' }}
              />
              <label htmlFor="quickIsTask">Task</label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginRight: '1rem' }}>
              <input
                type="checkbox"
                id="quickIsList"
                name="isList"
                checked={quickNote.isList}
                onChange={handleQuickNoteChange}
                style={{ marginRight: '0.3rem' }}
              />
              <label htmlFor="quickIsList">List</label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginRight: '1rem' }}>
              <input
                type="checkbox"
                id="quickIsIdea"
                name="isIdea"
                checked={quickNote.isIdea}
                onChange={handleQuickNoteChange}
                style={{ marginRight: '0.3rem' }}
              />
              <label htmlFor="quickIsIdea">Idea</label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="btn"
              style={{ width: '100%' }}
              disabled={isSubmitting}
              aria-label={isSubmitting ? 'Saving note' : 'Save note'}
            >
              {isSubmitting ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </form>
      </section>

        {/* My Notes Section */}
        <section aria-labelledby="my-notes-heading" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 id="my-notes-heading">My Notes</h2>
          </div>
        </section>

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
            {/* Notes List */}
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
            {hasActiveFilters ? 'No notes match your filters.' : 'No notes yet. Create your first note above!'}
          </div>
        )}

        {/* Archive Link */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
          <Link
            to="/archive"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.75rem 1.25rem',
              backgroundColor: '#edf2f7',
              color: '#4a5568',
              borderRadius: '0.375rem',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: '500',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
              transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)'
            }}
          >
            <span style={{ marginRight: '0.5rem' }}>📦</span> View Archive
          </Link>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
