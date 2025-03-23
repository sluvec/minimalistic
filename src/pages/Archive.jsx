import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

function Archive() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    tags: [],
    categories: [],
    types: [],
    priorities: [],
    importances: [],
    statuses: [],
    isTask: null, 
    isList: null,
    isIdea: null,
    date: null,
    showWithDueDate: 'both', 
    showWithUrl: 'both' 
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [allTags, setAllTags] = useState([])
  const [allCategories, setAllCategories] = useState([])
  const [allTypes, setAllTypes] = useState([])
  const [allPriorities, setAllPriorities] = useState([])
  const [allImportances, setAllImportances] = useState([])
  const [allStatuses, setAllStatuses] = useState([])
  const [dateWithNotes, setDatesWithNotes] = useState([])
  const [showCalendar, setShowCalendar] = useState(true)
  
  const [sorting, setSorting] = useState({
    field: 'updated_at',
    direction: 'desc'
  })
  
  const navigate = useNavigate()
  
  useEffect(() => {
    fetchNotes()
  }, [])
  
  const fetchNotes = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setNotes([])
        return
      }
      
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('archived', true) // Only get archived notes
        .order('updated_at', { ascending: false })
      
      if (error) {
        throw error
      }
      
      if (data) {
        setNotes(data)
        
        // Extract unique tags, categories, types, etc.
        const uniqueTags = [...new Set(data.flatMap(note => note.tags || []))]
        const uniqueCategories = [...new Set(data.map(note => note.category).filter(Boolean))]
        const uniqueTypes = [...new Set(data.map(note => note.type).filter(Boolean))]
        const uniquePriorities = [...new Set(data.map(note => note.priority).filter(Boolean))]
        const uniqueImportances = [...new Set(data.map(note => note.importance).filter(Boolean))]
        const uniqueStatuses = [...new Set(data.map(note => note.status).filter(Boolean))]
        
        setAllTags(uniqueTags)
        setAllCategories(uniqueCategories)
        setAllTypes(uniqueTypes)
        setAllPriorities(uniquePriorities)
        setAllImportances(uniqueImportances)
        setAllStatuses(uniqueStatuses)
        
        // Get all dates that have notes
        const dates = data
          .filter(note => note.due_date)
          .map(note => new Date(note.due_date))
        setDatesWithNotes(dates)
      }
    } catch (error) {
      console.error('Error fetching notes:', error.message)
      setError('Failed to fetch notes.')
    } finally {
      setLoading(false)
    }
  }

  const permanentlyDeleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY delete this note? This cannot be undone.')) return
    
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
      
      if (error) {
        throw error
      }
      
      // Remove note from state
      setNotes(notes.filter(note => note.id !== id))
      
    } catch (error) {
      console.error('Error deleting note:', error.message)
      setError('Failed to delete note.')
    }
  }

  const restoreNote = async (id) => {
    if (!window.confirm('Are you sure you want to restore this note?')) return
    
    try {
      const { error } = await supabase
        .from('notes')
        .update({ archived: false })
        .eq('id', id)
      
      if (error) {
        throw error
      }
      
      // Remove note from state
      setNotes(notes.filter(note => note.id !== id))
      
    } catch (error) {
      console.error('Error restoring note:', error.message)
      setError('Failed to restore note.')
    }
  }

  const handleTagClick = (tag) => {
    setFilters(prev => {
      if (prev.tags.includes(tag)) {
        return {
          ...prev,
          tags: prev.tags.filter(t => t !== tag)
        }
      } else {
        return {
          ...prev,
          tags: [...prev.tags, tag]
        }
      }
    })
  }

  const handleCategoryClick = (category) => {
    setFilters(prev => {
      if (prev.categories.includes(category)) {
        return {
          ...prev,
          categories: prev.categories.filter(c => c !== category)
        }
      } else {
        return {
          ...prev,
          categories: [...prev.categories, category]
        }
      }
    })
  }

  const handleTypeClick = (type) => {
    setFilters(prev => {
      if (prev.types.includes(type)) {
        return {
          ...prev,
          types: prev.types.filter(t => t !== type)
        }
      } else {
        return {
          ...prev,
          types: [...prev.types, type]
        }
      }
    })
  }

  const handlePriorityClick = (priority) => {
    setFilters(prev => {
      if (prev.priorities.includes(priority)) {
        return {
          ...prev,
          priorities: prev.priorities.filter(p => p !== priority)
        }
      } else {
        return {
          ...prev,
          priorities: [...prev.priorities, priority]
        }
      }
    })
  }

  const handleImportanceClick = (importance) => {
    setFilters(prev => {
      if (prev.importances.includes(importance)) {
        return {
          ...prev,
          importances: prev.importances.filter(i => i !== importance)
        }
      } else {
        return {
          ...prev,
          importances: [...prev.importances, importance]
        }
      }
    })
  }

  const handleStatusClick = (status) => {
    setFilters(prev => {
      if (prev.statuses.includes(status)) {
        return {
          ...prev,
          statuses: prev.statuses.filter(s => s !== status)
        }
      } else {
        return {
          ...prev,
          statuses: [...prev.statuses, status]
        }
      }
    })
  }

  const handleIsTaskChange = (value) => {
    setFilters(prev => ({
      ...prev,
      isTask: prev.isTask === value ? null : value
    }))
  }

  const handleIsListChange = (value) => {
    setFilters(prev => ({
      ...prev,
      isList: prev.isList === value ? null : value
    }))
  }

  const handleIsIdeaChange = (value) => {
    setFilters(prev => ({
      ...prev,
      isIdea: prev.isIdea === value ? null : value
    }))
  }

  const handleCalendarClick = (date) => {
    // Toggle selected date or select new date
    setFilters(prev => ({
      ...prev,
      date: prev.date && prev.date.toDateString() === date.toDateString() ? null : date
    }))
  }

  const clearFilters = () => {
    setFilters({ 
      tags: [], 
      categories: [], 
      types: [], 
      priorities: [], 
      importances: [],
      statuses: [],
      isTask: null,
      isList: null,
      isIdea: null,
      date: null,
      showWithDueDate: 'both',
      showWithUrl: 'both'
    })
    setSearchTerm('')
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
  }

  const hasFilters = filters.tags.length > 0 || filters.categories.length > 0 || filters.types.length > 0 || 
                    filters.priorities.length > 0 || filters.importances.length > 0 || filters.statuses.length > 0 || 
                    filters.isTask !== null || filters.isList !== null || filters.isIdea !== null || 
                    filters.date || searchTerm

  const filteredNotes = notes.filter(note => {
    // Search functionality
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      const titleMatch = note.title && note.title.toLowerCase().includes(search)
      const contentMatch = note.content && note.content.toLowerCase().includes(search)
      const urlMatch = note.url && note.url.toLowerCase().includes(search)
      
      if (!titleMatch && !contentMatch && !urlMatch) return false
    }
    
    // Filter by tags
    if (filters.tags.length > 0) {
      if (!note.tags || !Array.isArray(note.tags)) return false
      const hasMatchingTag = note.tags.some(tag => filters.tags.includes(tag))
      if (!hasMatchingTag) return false
    }
    
    // Filter by category
    if (filters.categories.length > 0) {
      if (!filters.categories.includes(note.category)) return false
    }
    
    // Filter by type
    if (filters.types.length > 0) {
      if (!filters.types.includes(note.type)) return false
    }
    
    // Filter by priority
    if (filters.priorities.length > 0) {
      if (!filters.priorities.includes(note.priority)) return false
    }
    
    // Filter by importance
    if (filters.importances.length > 0) {
      if (!filters.importances.includes(note.importance)) return false
    }
    
    // Filter by status
    if (filters.statuses.length > 0) {
      if (!filters.statuses.includes(note.status)) return false
    }

    // Filter by isTask
    if (filters.isTask !== null) {
      if (note.isTask !== filters.isTask) return false
    }
    
    // Filter by isList
    if (filters.isList !== null) {
      if (note.isList !== filters.isList) return false
    }
    
    // Filter by isIdea
    if (filters.isIdea !== null) {
      if (note.isIdea !== filters.isIdea) return false
    }
    
    // Filter by date
    if (filters.date) {
      if (!note.due_date) return false
      
      const noteDate = new Date(note.due_date)
      const filterDate = new Date(filters.date)
      
      if (noteDate.toDateString() !== filterDate.toDateString()) return false
    }
    
    // Filter by has due date
    if (filters.showWithDueDate === 'with') {
      if (!note.due_date) return false
    } else if (filters.showWithDueDate === 'without') {
      if (note.due_date) return false
    }
    
    // Filter by has URL
    if (filters.showWithUrl === 'with') {
      if (!note.url) return false
    } else if (filters.showWithUrl === 'without') {
      if (note.url) return false
    }
    
    return true
  }).sort((a, b) => {
    const { field, direction } = sorting
    
    if (field === 'title' || field === 'status') {
      const valueA = a[field] || ''
      const valueB = b[field] || ''
      return direction === 'asc' 
        ? valueA.localeCompare(valueB) 
        : valueB.localeCompare(valueA)
    } 
    else if (field === 'due_date') {
      if (!a.due_date && !b.due_date) return 0
      if (!a.due_date) return direction === 'asc' ? 1 : -1
      if (!b.due_date) return direction === 'asc' ? -1 : 1
      
      const dateA = new Date(a.due_date)
      const dateB = new Date(b.due_date)
      return direction === 'asc' 
        ? dateA - dateB 
        : dateB - dateA
    } 
    else {
      const dateA = new Date(a[field])
      const dateB = new Date(b[field])
      return direction === 'asc' 
        ? dateA - dateB 
        : dateB - dateA
    }
  })

  return (
    <div>
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
      
      {error && <div className="error">{error}</div>}
      
      {/* Search box */}
      <div style={{ marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search archived notes by title, content, or URL..."
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
              style={{
                backgroundColor: '#4299e1',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                padding: '0.5rem 1rem',
                cursor: 'pointer'
              }}
            >
              Search
            </button>
            {searchTerm && (
              <button 
                type="button"
                onClick={() => setSearchTerm('')}
                style={{
                  backgroundColor: '#f56565',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer'
                }}
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* Note count display */}
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
          {hasFilters ? (
            <span>Found <strong>{filteredNotes.length}</strong> {filteredNotes.length === 1 ? 'archived note' : 'archived notes'} matching your criteria</span>
          ) : (
            <span>Showing all <strong>{notes.length}</strong> {notes.length === 1 ? 'archived note' : 'archived notes'}</span>
          )}
        </div>
        {hasFilters && (
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
      
      {/* Filter section - include all your existing filters here */}
      <div className="filter-section" style={{ marginBottom: '1.5rem', marginTop: '1rem' }}>
        {/* Filters from Dashboard component would go here */}
      </div>
      
      {/* Sorting and additional filters */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        padding: '0.75rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '0.5rem'
      }}>
        <div>
          <span style={{ fontWeight: '500', marginRight: '0.5rem' }}>Sort by:</span>
          <select 
            value={sorting.field} 
            onChange={(e) => setSorting(prev => ({ ...prev, field: e.target.value }))}
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
            onChange={(e) => setSorting(prev => ({ ...prev, direction: e.target.value }))}
            style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Loading...</div>
      ) : filteredNotes.length === 0 ? (
        <div className="no-notes">
          {hasFilters ? 'No archived notes match your filters.' : 'No archived notes yet.'}
        </div>
      ) : (
        <div className="note-list" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '1.5rem', 
          marginTop: '1rem' 
        }}>
          {filteredNotes.map(note => (
            <div 
              key={note.id} 
              style={{ 
                backgroundColor: 'rgba(0,0,0,0.02)', 
                padding: '1rem', 
                marginBottom: '1rem',
                borderRadius: '0.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '200px'
              }} onClick={() => navigate(`/edit/${note.id}`)}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{note.title}</h3>
                </div>
                <p className="note-content" style={{ marginBottom: '0.75rem', fontSize: '0.875rem', color: '#4a5568' }}>
                  {note.content.length > 100 
                    ? `${note.content.substring(0, 100)}...` 
                    : note.content}
                </p>
                
                {note.tags && note.tags.length > 0 && (
                  <div className="note-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    {note.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="tag"
                        style={{
                          backgroundColor: '#e2e8f0',
                          color: '#4a5568',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem'
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTagClick(tag)
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="note-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {note.category && (
                    <span 
                      className="category" 
                      style={{
                        backgroundColor: '#bee3f8',
                        color: '#2b6cb0',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem'
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCategoryClick(note.category)
                      }}
                    >
                      {note.category}
                    </span>
                  )}
                  
                  {note.type && (
                    <span 
                      className="type"
                      style={{
                        backgroundColor: '#e9d8fd',
                        color: '#6b46c1',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem'
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTypeClick(note.type)
                      }}
                    >
                      {note.type}
                    </span>
                  )}
                  
                  {note.due_date && (
                    <span className="due-date" style={{
                      backgroundColor: '#fed7d7',
                      color: '#c53030',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem'
                    }}>
                      Due: {new Date(note.due_date).toLocaleDateString()}
                    </span>
                  )}
                  
                  {note.isTask && <span className="badge" style={{ backgroundColor: '#feebc8', color: '#c05621', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>Task</span>}
                  {note.isList && <span className="badge" style={{ backgroundColor: '#c6f6d5', color: '#276749', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>List</span>}
                  {note.isIdea && <span className="badge" style={{ backgroundColor: '#fefcbf', color: '#975a16', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>Idea</span>}
                </div>
              </div>
              
              <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: '#718096' }}>
                  {new Date(note.updated_at).toLocaleDateString()}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="restore-button" 
                    onClick={(e) => {
                      e.stopPropagation()
                      restoreNote(note.id)
                    }}
                    style={{
                      backgroundColor: '#48bb78',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.25rem',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      width: '70px',
                      textAlign: 'center'
                    }}
                  >
                    Restore
                  </button>
                  <button 
                    className="delete-button" 
                    onClick={(e) => {
                      e.stopPropagation()
                      permanentlyDeleteNote(note.id)
                    }}
                    style={{
                      backgroundColor: '#f56565',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.25rem',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      width: '70px',
                      textAlign: 'center'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Archive
