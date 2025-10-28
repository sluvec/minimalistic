import { useState, useCallback, useMemo, useEffect, useTransition, useDeferredValue } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotesData } from '../hooks/useNotesData'
import { supabase } from '../lib/supabaseClient'
import { format } from 'date-fns'
import { useDarkModeColors } from '../hooks/useDarkModeColors'
import EmptyState from '../components/EmptyState'
import Skeleton from '../components/Skeleton'
import NoteCardMobile from '../components/notes/NoteCardMobile'

function Notes() {
  const navigate = useNavigate()
  const colors = useDarkModeColors()
  const { notes, loading, error: fetchError } = useNotesData(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({
    key: 'updated_at',
    direction: 'desc'
  })

  // React 18 concurrent features for smooth filtering
  const [isPending, startTransition] = useTransition()
  const deferredSearchTerm = useDeferredValue(searchTerm)

  // Filter states
  const [selectedTypes, setSelectedTypes] = useState([])
  const [selectedProjects, setSelectedProjects] = useState([])
  const [selectedSpaces, setSelectedSpaces] = useState([])
  const [selectedTriageStatuses, setSelectedTriageStatuses] = useState([])
  const [projects, setProjects] = useState([])
  const [spaces, setSpaces] = useState([])
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Note types
  const noteTypes = [
    { value: 'note', label: 'Note', icon: '📝' },
    { value: 'idea', label: 'Idea', icon: '💡' },
    { value: 'task', label: 'Task', icon: '✅' },
    { value: 'list', label: 'List', icon: '📋' },
    { value: 'prompt', label: 'Prompt', icon: '🤖' },
    { value: 'question', label: 'Question', icon: '❓' },
    { value: 'reflection', label: 'Reflection', icon: '💭' }
  ]

  // Triage statuses
  const triageStatuses = [
    { value: 'New', label: 'New', color: '#94a3b8' },
    { value: 'Active', label: 'Active', color: '#10b981' },
    { value: 'Done', label: 'Done', color: '#6366f1' }
  ]

  // Fetch projects and spaces
  useEffect(() => {
    const fetchFilterData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [projectsResult, spacesResult] = await Promise.all([
        supabase
          .from('projects')
          .select('id, name, color')
          .eq('user_id', user.id)
          .eq('archived', false)
          .order('name'),
        supabase
          .from('spaces')
          .select('id, name, icon, color')
          .eq('user_id', user.id)
          .eq('archived', false)
          .order('name')
      ])

      if (projectsResult.data) setProjects(projectsResult.data)
      if (spacesResult.data) setSpaces(spacesResult.data)
    }

    fetchFilterData()
  }, [])

  // Handle mobile resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Update existing mobile state management
  useEffect(() => {
    setIsMobile(window.innerWidth <= 768)
  }, [])

  // Helper function to get note type
  const getNoteType = (note) => {
    if (note.note_type) return note.note_type
    if (note.isTask) return 'task'
    if (note.isIdea) return 'idea'
    if (note.isList) return 'list'
    return 'note'
  }

  // Helper function to truncate content to 120 chars
  const truncateContent = (content) => {
    if (!content) return ''
    const plainText = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
    if (plainText.length <= 120) return plainText
    return plainText.substring(0, 120) + '...'
  }

  // Toggle filter selection
  const toggleTypeFilter = (type) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const toggleProjectFilter = (projectId) => {
    setSelectedProjects(prev =>
      prev.includes(projectId) ? prev.filter(p => p !== projectId) : [...prev, projectId]
    )
  }

  const toggleSpaceFilter = (spaceId) => {
    setSelectedSpaces(prev =>
      prev.includes(spaceId) ? prev.filter(s => s !== spaceId) : [...prev, spaceId]
    )
  }

  const toggleTriageFilter = (status) => {
    setSelectedTriageStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    )
  }

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedTypes([])
    setSelectedProjects([])
    setSelectedSpaces([])
    setSelectedTriageStatuses([])
    setSearchTerm('')
  }

  // Check if any filters are active
  const hasActiveFilters = selectedTypes.length > 0 || selectedProjects.length > 0 || selectedSpaces.length > 0 || selectedTriageStatuses.length > 0 || searchTerm.length > 0

  // Sorting logic
  const handleSort = useCallback((key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }))
  }, [])

  // Filter and sort notes (AND logic) - Using deferred value for smooth performance
  const filteredAndSortedNotes = useMemo(() => {
    let filtered = notes

    // Apply search filter with deferred value (React 18 concurrent feature)
    if (deferredSearchTerm) {
      const term = deferredSearchTerm.toLowerCase()
      filtered = filtered.filter(note =>
        note.title?.toLowerCase().includes(term) ||
        note.content?.toLowerCase().includes(term) ||
        note.category?.toLowerCase().includes(term) ||
        (Array.isArray(note.tags) && note.tags.some(tag => tag.toLowerCase().includes(term)))
      )
    }

    // Apply type filter (AND logic - must match selected types)
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(note => {
        const noteType = getNoteType(note)
        return selectedTypes.includes(noteType)
      })
    }

    // Apply project filter (AND logic - must match selected projects)
    if (selectedProjects.length > 0) {
      filtered = filtered.filter(note =>
        note.project_id && selectedProjects.includes(note.project_id)
      )
    }

    // Apply space filter (AND logic - must match selected spaces)
    if (selectedSpaces.length > 0) {
      filtered = filtered.filter(note =>
        note.space_id && selectedSpaces.includes(note.space_id)
      )
    }

    // Apply triage status filter (AND logic - must match selected statuses)
    if (selectedTriageStatuses.length > 0) {
      filtered = filtered.filter(note => {
        const triageStatus = note.triage_status || 'New'
        return selectedTriageStatuses.includes(triageStatus)
      })
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]

      if (!aVal && !bVal) return 0
      if (!aVal) return 1
      if (!bVal) return -1

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const comparison = aVal.localeCompare(bVal)
        return sortConfig.direction === 'asc' ? comparison : -comparison
      }

      if (sortConfig.key.includes('date') || sortConfig.key.includes('at')) {
        const dateA = new Date(aVal)
        const dateB = new Date(bVal)
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }, [notes, deferredSearchTerm, selectedTypes, selectedProjects, selectedSpaces, selectedTriageStatuses, sortConfig])

  // Handle row click
  const handleRowClick = useCallback((noteId) => {
    navigate(`/edit/${noteId}`)
  }, [navigate])

  // Render sort icon
  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <span style={{ opacity: 0.3, marginLeft: '4px' }}>↕</span>
    }
    return (
      <span style={{ marginLeft: '4px' }}>
        {sortConfig.direction === 'asc' ? '↑' : '↓'}
      </span>
    )
  }

  const styles = {
    container: {
      maxWidth: 'none',
      width: '100%',
      padding: '1rem',
      margin: '0 auto'
    },
    header: {
      marginBottom: '1rem'
    },
    searchBar: {
      width: '100%',
      maxWidth: '600px',
      padding: '0.75rem',
      fontSize: '1rem',
      border: `1px solid ${colors.border}`,
      borderRadius: '0.5rem',
      marginBottom: '1rem',
      backgroundColor: colors.cardBackground,
      color: colors.textPrimary
    },
    filterSection: {
      position: 'sticky',
      top: 0,
      zIndex: 20,
      backgroundColor: colors.cardBackground,
      padding: '1rem',
      borderRadius: '0.5rem',
      marginBottom: '1rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: `1px solid ${colors.border}`
    },
    filterRow: {
      marginBottom: '0.75rem'
    },
    filterLabel: {
      fontWeight: '600',
      fontSize: '0.875rem',
      color: colors.textSecondary,
      marginBottom: '0.5rem',
      display: 'block'
    },
    filterChips: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem'
    },
    chip: (isSelected) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.5rem 0.75rem',
      fontSize: '0.875rem',
      borderRadius: '9999px',
      border: '1px solid',
      borderColor: isSelected ? colors.primary : colors.border,
      backgroundColor: isSelected ? colors.chipBackgroundActive : colors.chipBackground,
      color: isSelected ? colors.chipTextActive : colors.chipText,
      cursor: 'pointer',
      transition: 'all 0.2s',
      userSelect: 'none'
    }),
    clearButton: {
      padding: '0.5rem 1rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#ef4444',
      backgroundColor: colors.cardBackground,
      border: '1px solid #ef4444',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    mobileToggle: {
      width: '100%',
      padding: '0.75rem',
      backgroundColor: colors.primary,
      color: colors.background,
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontSize: '0.95rem',
      fontWeight: '500',
      marginBottom: '1rem'
    },
    tableContainer: {
      width: '100%',
      overflowX: 'auto',
      backgroundColor: colors.cardBackground,
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      WebkitOverflowScrolling: 'touch'
    },
    table: {
      width: 'max-content',
      minWidth: '100%',
      borderCollapse: 'collapse',
      fontSize: '0.875rem'
    },
    th: {
      position: 'sticky',
      top: 0,
      backgroundColor: colors.tableHeaderBackground,
      padding: '0.75rem 0.5rem',
      textAlign: 'left',
      fontWeight: '600',
      color: colors.textPrimary,
      borderBottom: `2px solid ${colors.border}`,
      cursor: 'pointer',
      userSelect: 'none',
      whiteSpace: 'nowrap',
      zIndex: 10,
      fontSize: '0.8rem'
    },
    td: {
      padding: '0.75rem 0.5rem',
      borderBottom: `1px solid ${colors.border}`,
      verticalAlign: 'top',
      fontSize: '0.8rem'
    },
    tr: {
      cursor: 'pointer',
      transition: 'background-color 0.15s'
    },
    titleCell: {
      fontWeight: '500',
      minWidth: '100px',
      maxWidth: '180px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    previewCell: {
      color: colors.textMuted,
      minWidth: '150px',
      maxWidth: '250px',
      lineHeight: '1.5',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    tagBadge: {
      display: 'inline-block',
      backgroundColor: colors.darkerBackground,
      color: colors.textSecondary,
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      fontSize: '0.75rem',
      marginRight: '0.25rem',
      marginBottom: '0.25rem'
    },
    emptyState: {
      textAlign: 'center',
      padding: '3rem 1rem',
      color: colors.textMuted
    },
    statsBar: {
      marginBottom: '1rem',
      fontSize: '0.9rem',
      color: colors.textSecondary,
      backgroundColor: colors.darkerBackground,
      padding: '0.5rem 0.75rem',
      borderRadius: '0.375rem'
    }
  }

  const FilterPanel = () => (
    <div style={styles.filterSection}>
      {/* Type Filter */}
      <div style={styles.filterRow}>
        <label style={styles.filterLabel}>Type</label>
        <div style={styles.filterChips}>
          {noteTypes.map(type => (
            <button
              key={type.value}
              onClick={() => toggleTypeFilter(type.value)}
              style={styles.chip(selectedTypes.includes(type.value))}
            >
              <span>{type.icon}</span>
              <span>{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Project Filter */}
      <div style={styles.filterRow}>
        <label style={styles.filterLabel}>Project</label>
        <div style={styles.filterChips}>
          {projects.length > 0 ? (
            projects.map(project => (
              <button
                key={project.id}
                onClick={() => toggleProjectFilter(project.id)}
                style={styles.chip(selectedProjects.includes(project.id))}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: project.color,
                    display: 'inline-block'
                  }}
                />
                <span>{project.name}</span>
              </button>
            ))
          ) : (
            <span style={{ fontSize: '0.875rem', color: colors.textMuted }}>No projects available</span>
          )}
        </div>
      </div>

      {/* Space Filter */}
      <div style={styles.filterRow}>
        <label style={styles.filterLabel}>Space</label>
        <div style={styles.filterChips}>
          {spaces.length > 0 ? (
            spaces.map(space => (
              <button
                key={space.id}
                onClick={() => toggleSpaceFilter(space.id)}
                style={styles.chip(selectedSpaces.includes(space.id))}
              >
                <span>{space.icon}</span>
                <span>{space.name}</span>
              </button>
            ))
          ) : (
            <span style={{ fontSize: '0.875rem', color: colors.textMuted }}>No spaces available</span>
          )}
        </div>
      </div>

      {/* Triage Status Filter */}
      <div style={styles.filterRow}>
        <label style={styles.filterLabel}>Triage Status</label>
        <div style={styles.filterChips}>
          {triageStatuses.map(status => (
            <button
              key={status.value}
              onClick={() => toggleTriageFilter(status.value)}
              style={styles.chip(selectedTriageStatuses.includes(status.value))}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: status.color,
                  display: 'inline-block'
                }}
              />
              <span>{status.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
          <button onClick={clearAllFilters} style={styles.clearButton}>
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={{ marginBottom: '1rem' }}>All Notes</h1>

        {/* Search Bar with loading indicator */}
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            placeholder="Search notes by title, content, category, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              ...styles.searchBar,
              opacity: isPending ? 0.7 : 1,
              transition: 'opacity 0.2s ease-in-out'
            }}
          />
          {isPending && (
            <div style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '0.75rem',
              color: colors.textMuted,
              fontWeight: '500'
            }}>
              Filtering...
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Toggle */}
      {isMobile && (
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          style={styles.mobileToggle}
        >
          {showMobileFilters ? '✕ Hide Filters' : '☰ Show Filters'}
        </button>
      )}

      {/* Filter Panel */}
      {(!isMobile || showMobileFilters) && <FilterPanel />}

      {/* Stats Bar */}
      <div style={styles.statsBar}>
        Showing <strong>{filteredAndSortedNotes.length}</strong> of <strong>{notes.length}</strong> {filteredAndSortedNotes.length === 1 ? 'note' : 'notes'}
        {hasActiveFilters && ' (filtered)'}
      </div>

      {fetchError && <div className="error" role="alert">{fetchError}</div>}

      {loading ? (
        <div style={styles.tableContainer}>
          <div style={{ padding: '2rem' }}>
            <Skeleton height="40px" marginBottom="1rem" />
            <Skeleton height="60px" marginBottom="0.5rem" />
            <Skeleton height="60px" marginBottom="0.5rem" />
            <Skeleton height="60px" marginBottom="0.5rem" />
            <Skeleton height="60px" marginBottom="0.5rem" />
            <Skeleton height="60px" />
          </div>
        </div>
      ) : filteredAndSortedNotes.length === 0 ? (
        <EmptyState
          icon={hasActiveFilters ? '🔍' : '📝'}
          title={hasActiveFilters ? 'No matching notes' : 'No notes yet'}
          description={
            hasActiveFilters
              ? 'Try adjusting your filters to find what you\'re looking for.'
              : 'Start creating notes to see them here.'
          }
          actionLabel={hasActiveFilters ? 'Clear all filters' : 'Create your first note'}
          actionLink={hasActiveFilters ? null : '/create'}
          actionOnClick={hasActiveFilters ? clearAllFilters : null}
        />
      ) : isMobile ? (
        /* Mobile: Card View */
        <div style={{ padding: '0.5rem' }}>
          {filteredAndSortedNotes.map((note) => (
            <NoteCardMobile key={note.id} note={note} />
          ))}
        </div>
      ) : (
        /* Desktop: Table View */
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, ...styles.titleCell }} onClick={() => handleSort('title')}>
                  Title <SortIcon columnKey="title" />
                </th>
                <th style={{ ...styles.th, ...styles.previewCell }}>Preview</th>
                <th style={styles.th} onClick={() => handleSort('category')}>
                  Category <SortIcon columnKey="category" />
                </th>
                <th style={styles.th}>Tags</th>
                <th style={styles.th} onClick={() => handleSort('project_id')}>
                  Project <SortIcon columnKey="project_id" />
                </th>
                <th style={styles.th} onClick={() => handleSort('space_id')}>
                  Space <SortIcon columnKey="space_id" />
                </th>
                <th style={styles.th} onClick={() => handleSort('triage_status')}>
                  Triage <SortIcon columnKey="triage_status" />
                </th>
                <th style={styles.th} onClick={() => handleSort('updated_at')}>
                  Updated <SortIcon columnKey="updated_at" />
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedNotes.map((note, index) => (
                <tr
                  key={note.id}
                  style={{
                    ...styles.tr,
                    backgroundColor: index % 2 === 0 ? colors.tableRowEven : colors.tableRowOdd
                  }}
                  onClick={() => handleRowClick(note.id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.tableRowHover
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = index % 2 === 0 ? colors.tableRowEven : colors.tableRowOdd
                  }}
                >
                  <td style={{ ...styles.td, ...styles.titleCell }}>
                    {note.title || <em style={{ color: colors.textMuted }}>Untitled</em>}
                  </td>
                  <td style={{ ...styles.td, ...styles.previewCell }}>
                    {truncateContent(note.content)}
                  </td>
                  <td style={styles.td}>
                    {note.category || '-'}
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {note.tags && note.tags.length > 0 ? (
                        note.tags.slice(0, 2).map((tag, idx) => (
                          <span key={idx} style={styles.tagBadge}>{tag}</span>
                        ))
                      ) : '-'}
                      {note.tags && note.tags.length > 2 && (
                        <span style={{ ...styles.tagBadge, backgroundColor: colors.borderLight }}>
                          +{note.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={styles.td}>
                    {note.projects?.name || '-'}
                  </td>
                  <td style={styles.td}>
                    {note.spaces?.name ? `${note.spaces.icon || '📁'} ${note.spaces.name}` : '-'}
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      backgroundColor:
                        note.triage_status === 'Active' ? '#10b98140' :
                        note.triage_status === 'Done' ? '#6366f140' :
                        '#94a3b840',
                      color:
                        note.triage_status === 'Active' ? '#059669' :
                        note.triage_status === 'Done' ? '#4f46e5' :
                        '#475569'
                    }}>
                      {note.triage_status || 'New'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {note.updated_at ? format(new Date(note.updated_at), 'MMM d, yyyy') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Notes
