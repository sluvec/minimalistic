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
import { useDarkModeColors } from '../hooks/useDarkModeColors'

// Components
import NoteCard from '../components/notes/NoteCard'
import NoteListItem from '../components/notes/NoteListItem'
import NoteSearch from '../components/notes/NoteSearch'
import NoteSorting from '../components/notes/NoteSorting'
import NoteFilters from '../components/notes/NoteFilters'

// Constants and utilities
import { SUCCESS_MESSAGES, ERROR_MESSAGES, CONFIRM_MESSAGES, STATUS, STATUS_OPTIONS } from '../constants'
import { parseTags } from '../utils/tagHelpers'
import { validateNote } from '../utils/validation'
import { formatDateForDisplay } from '../utils/dateHelpers'

function Dashboard() {
  const colors = useDarkModeColors()

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

  // Projects and Spaces state
  const [projects, setProjects] = useState([])
  const [spaces, setSpaces] = useState([])

  // Quick note form state
  const [quickNote, setQuickNote] = useState({
    title: '',
    content: '',
    category: '',
    type: '',
    tags: '',
    start_date: '',
    end_date: '',
    due_date: '',
    url: '',
    priority: '',
    importance: '',
    status: STATUS.NEW,
    note_type: 'note',
    project_id: '',
    space_id: '',
    triage_status: 'New'
  })
  const [quickNoteError, setQuickNoteError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCalendar, setShowCalendar] = useState(true)

  // Mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Fetch projects and spaces on mount
  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, color')
        .eq('archived', false)
        .order('name')

      if (!error && data) {
        setProjects(data)
      }
    }

    const fetchSpaces = async () => {
      const { data, error } = await supabase
        .from('spaces')
        .select('id, name, icon, color')
        .eq('archived', false)
        .order('name')

      if (!error && data) {
        setSpaces(data)
      }
    }

    fetchProjects()
    fetchSpaces()
  }, [])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle quick note input changes
  const handleQuickNoteChange = useCallback((e) => {
    const { name, value } = e.target
    setQuickNote(prev => ({
      ...prev,
      [name]: value
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
          start_date: quickNote.start_date || null,
          end_date: quickNote.end_date || null,
          due_date: quickNote.due_date || null,
          url: quickNote.url || null,
          priority: quickNote.priority || null,
          importance: quickNote.importance || null,
          status: quickNote.status || STATUS.NEW,
          triage_status: quickNote.triage_status || 'New',
          note_type: quickNote.note_type,
          isTask: quickNote.note_type === 'task',
          isList: quickNote.note_type === 'list',
          isIdea: quickNote.note_type === 'idea',
          project_id: quickNote.project_id || null,
          space_id: quickNote.space_id || null,
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
        start_date: '',
        end_date: '',
        due_date: '',
        url: '',
        priority: '',
        importance: '',
        status: STATUS.NEW,
        note_type: 'note',
        project_id: '',
        space_id: '',
        triage_status: 'New'
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
      // Toast is handled by useNotesQuery
    }
    // Error toast is also handled by useNotesQuery
  }, [deleteNote, removeNoteFromState])

  // Handle note archiving
  const handleArchiveNote = useCallback(async (id) => {
    if (!window.confirm(CONFIRM_MESSAGES.ARCHIVE_NOTE)) return

    const { error } = await archiveNote(id)
    if (!error) {
      removeNoteFromState(id)
      // Toast is handled by useNotesQuery
    }
    // Error toast is also handled by useNotesQuery
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
            backgroundColor: colors.primary,
            color: colors.chipTextActive,
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
          backgroundColor: showMobileFilters && isMobile ? colors.cardBackground : 'transparent',
          borderRadius: showMobileFilters && isMobile ? '0.5rem' : '0',
          boxShadow: showMobileFilters && isMobile ? colors.shadow : 'none',
          padding: showMobileFilters && isMobile ? '1rem' : '0',
          marginBottom: showMobileFilters && isMobile ? '1rem' : '0'
        }}>
        {/* Calendar */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: colors.textPrimary }}>Calendar</h3>
          <div style={{
            boxShadow: colors.shadow,
            borderRadius: '0.5rem',
            overflow: 'hidden'
          }}>
            <style>
              {`
                .react-calendar {
                  width: 100%;
                  border: none;
                  font-family: Arial, sans-serif;
                  background-color: ${colors.cardBackground};
                  color: ${colors.textPrimary};
                }
                .react-calendar__tile--active {
                  background: ${colors.primary};
                  color: ${colors.chipTextActive};
                }
                .has-notes {
                  background-color: ${colors.danger}40;
                  font-weight: bold;
                }
                .react-calendar__tile--active.has-notes {
                  background: ${colors.primary};
                }
                .react-calendar__navigation button {
                  color: ${colors.textPrimary};
                }
                .react-calendar__month-view__weekdays {
                  color: ${colors.textSecondary};
                }
                .react-calendar__tile {
                  color: ${colors.textPrimary};
                }
                .react-calendar__tile:enabled:hover,
                .react-calendar__tile:enabled:focus {
                  background-color: ${colors.hoverBackground};
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
                backgroundColor: colors.lightBackground,
                color: colors.textSecondary,
                fontSize: '0.85rem'
              }}>
                <strong>Filtered:</strong> {formatDateForDisplay(filters.date)}
                <button
                  onClick={handleClearDateFilter}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: colors.primary,
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
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: colors.textPrimary }}>Filters</h3>
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
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: colors.textPrimary }}>Sort By</h3>
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
          backgroundColor: colors.lightBackground,
          padding: '1rem',
          borderRadius: '0.5rem',
          boxShadow: colors.shadow
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

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap', opacity: 0.6 }}>
            <div style={{ flex: '1 1 20%', minWidth: '120px' }}>
              <label htmlFor="quick-category" className="sr-only">Category</label>
              <input
                id="quick-category"
                type="text"
                name="category"
                placeholder="Category"
                value={quickNote.category}
                onChange={handleQuickNoteChange}
                aria-label="Note category"
                style={{ width: '100%', fontSize: '0.85rem', padding: '0.4rem' }}
              />
            </div>

            <div style={{ flex: '1 1 20%', minWidth: '120px' }}>
              <label htmlFor="quick-type" className="sr-only">Type</label>
              <input
                id="quick-type"
                type="text"
                name="type"
                placeholder="Type"
                value={quickNote.type}
                onChange={handleQuickNoteChange}
                aria-label="Note type"
                style={{ width: '100%', fontSize: '0.85rem', padding: '0.4rem' }}
              />
            </div>

            <div style={{ flex: '1 1 40%', minWidth: '120px' }}>
              <label htmlFor="quick-tags" className="sr-only">Tags</label>
              <input
                id="quick-tags"
                type="text"
                name="tags"
                placeholder="Tags"
                value={quickNote.tags}
                onChange={handleQuickNoteChange}
                aria-label="Note tags, comma separated"
                style={{ width: '100%', fontSize: '0.85rem', padding: '0.4rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap', opacity: 0.6 }}>
            <div style={{ flex: '1 1 30%', minWidth: '120px' }}>
              <label htmlFor="quick-start-date" className="sr-only">Start Date</label>
              <input
                id="quick-start-date"
                type="date"
                name="start_date"
                placeholder="Start Date"
                value={quickNote.start_date}
                onChange={handleQuickNoteChange}
                aria-label="Note start date"
                style={{ width: '100%', fontSize: '0.85rem', padding: '0.4rem' }}
              />
            </div>

            <div style={{ flex: '1 1 30%', minWidth: '120px' }}>
              <label htmlFor="quick-end-date" className="sr-only">End Date</label>
              <input
                id="quick-end-date"
                type="date"
                name="end_date"
                placeholder="End Date"
                value={quickNote.end_date}
                onChange={handleQuickNoteChange}
                aria-label="Note end date"
                style={{ width: '100%', fontSize: '0.85rem', padding: '0.4rem' }}
              />
            </div>

            <div style={{ flex: '1 1 30%', minWidth: '120px' }}>
              <label htmlFor="quick-due-date" className="sr-only">Due Date</label>
              <input
                id="quick-due-date"
                type="date"
                name="due_date"
                placeholder="Due Date"
                value={quickNote.due_date}
                onChange={handleQuickNoteChange}
                aria-label="Note due date"
                style={{ width: '100%', fontSize: '0.85rem', padding: '0.4rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap', opacity: 0.6 }}>
            <div style={{ flex: '1 1 48%', minWidth: '120px' }}>
              <label htmlFor="quick-project" className="sr-only">Project</label>
              <select
                id="quick-project"
                name="project_id"
                value={quickNote.project_id}
                onChange={handleQuickNoteChange}
                aria-label="Note project"
                style={{ width: '100%', fontSize: '0.85rem', padding: '0.4rem' }}
              >
                <option value="">No Project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: '1 1 48%', minWidth: '120px' }}>
              <label htmlFor="quick-space" className="sr-only">Space</label>
              <select
                id="quick-space"
                name="space_id"
                value={quickNote.space_id}
                onChange={handleQuickNoteChange}
                aria-label="Note space"
                style={{ width: '100%', fontSize: '0.85rem', padding: '0.4rem' }}
              >
                <option value="">No Space</option>
                {spaces.map(space => (
                  <option key={space.id} value={space.id}>
                    {space.icon} {space.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap', opacity: 0.6 }}>
            <div style={{ flex: '1 1 20%', minWidth: '120px' }}>
              <select
                name="triage_status"
                value={quickNote.triage_status}
                onChange={handleQuickNoteChange}
                style={{ width: '100%', fontSize: '0.85rem', padding: '0.4rem' }}
              >
                <option value="New">New</option>
                <option value="Active">Active</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div style={{ flex: '1 1 20%', minWidth: '120px' }}>
              <select
                name="status"
                value={quickNote.status}
                onChange={handleQuickNoteChange}
                style={{ width: '100%', fontSize: '0.85rem', padding: '0.4rem' }}
              >
                {STATUS_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: '1 1 20%', minWidth: '120px' }}>
              <select
                name="priority"
                value={quickNote.priority}
                onChange={handleQuickNoteChange}
                style={{ width: '100%', fontSize: '0.85rem', padding: '0.4rem' }}
              >
                <option value="">Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div style={{ flex: '1 1 20%', minWidth: '120px' }}>
              <select
                name="importance"
                value={quickNote.importance}
                onChange={handleQuickNoteChange}
                style={{ width: '100%', fontSize: '0.85rem', padding: '0.4rem' }}
              >
                <option value="">Importance</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div style={{ flex: '1 1 20%', minWidth: '120px' }}>
              <input
                type="url"
                name="url"
                placeholder="URL"
                value={quickNote.url}
                onChange={handleQuickNoteChange}
                style={{ width: '100%', fontSize: '0.85rem', padding: '0.4rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap', opacity: 0.6 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="radio"
                id="quickNoteTypeNote"
                name="note_type"
                value="note"
                checked={quickNote.note_type === 'note'}
                onChange={handleQuickNoteChange}
                style={{ marginRight: '0.3rem' }}
              />
              <label htmlFor="quickNoteTypeNote" style={{ fontSize: '0.85rem' }}>📝 Note</label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="radio"
                id="quickNoteTypeTask"
                name="note_type"
                value="task"
                checked={quickNote.note_type === 'task'}
                onChange={handleQuickNoteChange}
                style={{ marginRight: '0.3rem' }}
              />
              <label htmlFor="quickNoteTypeTask" style={{ fontSize: '0.85rem' }}>✅ Task</label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="radio"
                id="quickNoteTypeIdea"
                name="note_type"
                value="idea"
                checked={quickNote.note_type === 'idea'}
                onChange={handleQuickNoteChange}
                style={{ marginRight: '0.3rem' }}
              />
              <label htmlFor="quickNoteTypeIdea" style={{ fontSize: '0.85rem' }}>💡 Idea</label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="radio"
                id="quickNoteTypeEvent"
                name="note_type"
                value="event"
                checked={quickNote.note_type === 'event'}
                onChange={handleQuickNoteChange}
                style={{ marginRight: '0.3rem' }}
              />
              <label htmlFor="quickNoteTypeEvent" style={{ fontSize: '0.85rem' }}>📅 Event</label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="radio"
                id="quickNoteTypeLink"
                name="note_type"
                value="link"
                checked={quickNote.note_type === 'link'}
                onChange={handleQuickNoteChange}
                style={{ marginRight: '0.3rem' }}
              />
              <label htmlFor="quickNoteTypeLink" style={{ fontSize: '0.85rem' }}>🔗 Link</label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="radio"
                id="quickNoteTypeList"
                name="note_type"
                value="list"
                checked={quickNote.note_type === 'list'}
                onChange={handleQuickNoteChange}
                style={{ marginRight: '0.3rem' }}
              />
              <label htmlFor="quickNoteTypeList" style={{ fontSize: '0.85rem' }}>📋 List</label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="radio"
                id="quickNoteTypePrompt"
                name="note_type"
                value="prompt"
                checked={quickNote.note_type === 'prompt'}
                onChange={handleQuickNoteChange}
                style={{ marginRight: '0.3rem' }}
              />
              <label htmlFor="quickNoteTypePrompt" style={{ fontSize: '0.85rem' }}>🤖 Prompt</label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="radio"
                id="quickNoteTypeQuestion"
                name="note_type"
                value="question"
                checked={quickNote.note_type === 'question'}
                onChange={handleQuickNoteChange}
                style={{ marginRight: '0.3rem' }}
              />
              <label htmlFor="quickNoteTypeQuestion" style={{ fontSize: '0.85rem' }}>❓ Question</label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="radio"
                id="quickNoteTypeReflection"
                name="note_type"
                value="reflection"
                checked={quickNote.note_type === 'reflection'}
                onChange={handleQuickNoteChange}
                style={{ marginRight: '0.3rem' }}
              />
              <label htmlFor="quickNoteTypeReflection" style={{ fontSize: '0.85rem' }}>💭 Reflection</label>
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
        <section aria-labelledby="my-notes-heading" style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '1.5rem', marginBottom: '1rem' }}>
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
          color: colors.textSecondary,
          backgroundColor: colors.darkerBackground,
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
                color: colors.primaryHover,
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
              backgroundColor: colors.cardBackground,
              borderRadius: '0.5rem',
              boxShadow: colors.shadow,
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
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', paddingTop: '1rem', borderTop: `1px solid ${colors.border}` }}>
          <Link
            to="/archive"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.75rem 1.25rem',
              backgroundColor: colors.darkerBackground,
              color: colors.textSecondary,
              borderRadius: '0.375rem',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: '500',
              boxShadow: colors.shadow,
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
