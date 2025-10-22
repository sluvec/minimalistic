import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotesData } from '../hooks/useNotesData'
import { format } from 'date-fns'

function Notes() {
  const navigate = useNavigate()
  const { notes, loading, error: fetchError } = useNotesData(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({
    key: 'updated_at',
    direction: 'desc'
  })

  // Helper function to get note type icon
  const getNoteTypeIcon = (note) => {
    if (note.note_type === 'task' || note.isTask) return '✅'
    if (note.note_type === 'idea' || note.isIdea) return '💡'
    if (note.note_type === 'list' || note.isList) return '📋'
    if (note.note_type === 'prompt') return '🤖'
    if (note.note_type === 'question') return '❓'
    if (note.note_type === 'reflection') return '💭'
    return '📝'
  }

  // Helper function to truncate content to 120 chars
  const truncateContent = (content) => {
    if (!content) return ''
    const plainText = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
    if (plainText.length <= 120) return plainText
    return plainText.substring(0, 120) + '...'
  }

  // Helper function to format tags
  const formatTags = (tags) => {
    if (!tags || tags.length === 0) return '-'
    if (Array.isArray(tags)) {
      return tags.slice(0, 3).join(', ') + (tags.length > 3 ? '...' : '')
    }
    return tags
  }

  // Sorting logic
  const handleSort = useCallback((key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }))
  }, [])

  // Filter and sort notes
  const filteredAndSortedNotes = useMemo(() => {
    let filtered = notes

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(note =>
        note.title?.toLowerCase().includes(term) ||
        note.content?.toLowerCase().includes(term) ||
        note.category?.toLowerCase().includes(term) ||
        (Array.isArray(note.tags) && note.tags.some(tag => tag.toLowerCase().includes(term)))
      )
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]

      // Handle null/undefined values
      if (!aVal && !bVal) return 0
      if (!aVal) return 1
      if (!bVal) return -1

      // String comparison
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const comparison = aVal.localeCompare(bVal)
        return sortConfig.direction === 'asc' ? comparison : -comparison
      }

      // Date comparison
      if (sortConfig.key.includes('date') || sortConfig.key.includes('at')) {
        const dateA = new Date(aVal)
        const dateB = new Date(bVal)
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA
      }

      // Default comparison
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }, [notes, searchTerm, sortConfig])

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
      maxWidth: '100%',
      padding: '1.5rem',
      margin: '0 auto'
    },
    header: {
      marginBottom: '1.5rem'
    },
    searchBar: {
      width: '100%',
      maxWidth: '600px',
      padding: '0.75rem',
      fontSize: '1rem',
      border: '1px solid #e2e8f0',
      borderRadius: '0.5rem',
      marginBottom: '1rem'
    },
    tableContainer: {
      overflowX: 'auto',
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '0.875rem'
    },
    th: {
      position: 'sticky',
      top: 0,
      backgroundColor: '#f7fafc',
      padding: '1rem 0.75rem',
      textAlign: 'left',
      fontWeight: '600',
      color: '#2d3748',
      borderBottom: '2px solid #e2e8f0',
      cursor: 'pointer',
      userSelect: 'none',
      whiteSpace: 'nowrap',
      zIndex: 10
    },
    td: {
      padding: '0.75rem',
      borderBottom: '1px solid #e2e8f0',
      verticalAlign: 'top'
    },
    tr: {
      cursor: 'pointer',
      transition: 'background-color 0.15s'
    },
    typeCell: {
      fontSize: '1.2rem',
      width: '40px',
      textAlign: 'center'
    },
    titleCell: {
      fontWeight: '500',
      minWidth: '150px',
      maxWidth: '250px'
    },
    previewCell: {
      color: '#718096',
      minWidth: '300px',
      maxWidth: '400px',
      lineHeight: '1.5'
    },
    tagBadge: {
      display: 'inline-block',
      backgroundColor: '#edf2f7',
      color: '#4a5568',
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      fontSize: '0.75rem',
      marginRight: '0.25rem',
      marginBottom: '0.25rem'
    },
    emptyState: {
      textAlign: 'center',
      padding: '3rem 1rem',
      color: '#718096'
    },
    statsBar: {
      marginBottom: '1rem',
      fontSize: '0.9rem',
      color: '#4a5568',
      backgroundColor: '#edf2f7',
      padding: '0.5rem 0.75rem',
      borderRadius: '0.375rem'
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={{ marginBottom: '1rem' }}>All Notes</h1>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search notes by title, content, category, or tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchBar}
        />

        {/* Stats Bar */}
        <div style={styles.statsBar}>
          Showing <strong>{filteredAndSortedNotes.length}</strong> {filteredAndSortedNotes.length === 1 ? 'note' : 'notes'}
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
      </div>

      {fetchError && <div className="error" role="alert">{fetchError}</div>}

      {loading ? (
        <div className="loading" style={{ textAlign: 'center', padding: '2rem' }}>
          Loading notes...
        </div>
      ) : filteredAndSortedNotes.length === 0 ? (
        <div style={styles.emptyState}>
          {searchTerm ? `No notes match "${searchTerm}"` : 'No notes yet.'}
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, ...styles.typeCell }}>Type</th>
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
                    backgroundColor: index % 2 === 0 ? 'white' : '#f7fafc'
                  }}
                  onClick={() => handleRowClick(note.id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#edf2f7'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#f7fafc'
                  }}
                >
                  <td style={{ ...styles.td, ...styles.typeCell }}>
                    {getNoteTypeIcon(note)}
                  </td>
                  <td style={{ ...styles.td, ...styles.titleCell }}>
                    {note.title || <em style={{ color: '#a0aec0' }}>Untitled</em>}
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
                        <span style={{ ...styles.tagBadge, backgroundColor: '#cbd5e0' }}>
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
