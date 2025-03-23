import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

function Dashboard() {
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
    status: 'New',
    isTask: false,
    isList: false,
    isIdea: false
  })
  const [quickNoteError, setQuickNoteError] = useState(null)
  const [quickNoteSuccess, setQuickNoteSuccess] = useState(false)
  
  const navigate = useNavigate()

  useEffect(() => {
    fetchNotes()
  }, [filters])
  
  useEffect(() => {
    if (quickNoteSuccess) {
      const timer = setTimeout(() => {
        setQuickNoteSuccess(false)
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [quickNoteSuccess])

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
        .eq('archived', false)
        .order('updated_at', { ascending: false })
      
      if (error) {
        throw error
      }
      
      if (data) {
        setNotes(data)
        
        const extractedTags = data.reduce((acc, note) => {
          if (note.tags && Array.isArray(note.tags)) {
            return [...acc, ...note.tags]
          }
          return acc
        }, [])
        
        const categories = data.reduce((acc, note) => {
          if (note.category && !acc.includes(note.category)) {
            return [...acc, note.category]
          }
          return acc
        }, [])
        
        const types = data.reduce((acc, note) => {
          if (note.type && !acc.includes(note.type)) {
            return [...acc, note.type]
          }
          return acc
        }, [])
        
        const priorities = data.reduce((acc, note) => {
          if (note.priority && !acc.includes(note.priority)) {
            return [...acc, note.priority]
          }
          return acc
        }, [])
        
        const importances = data.reduce((acc, note) => {
          if (note.importance && !acc.includes(note.importance)) {
            return [...acc, note.importance]
          }
          return acc
        }, [])
        
        const statuses = data.reduce((acc, note) => {
          if (note.status && !acc.includes(note.status)) {
            return [...acc, note.status]
          }
          return acc
        }, [])
        
        const dates = data
          .filter(note => note.due_date)
          .map(note => new Date(note.due_date))
        
        setAllTags([...new Set(extractedTags)])
        setAllCategories(categories)
        setAllTypes(types)
        setAllPriorities(priorities)
        setAllImportances(importances)
        setAllStatuses(statuses)
        setDatesWithNotes(dates)
      }
    } catch (error) {
      console.error("Error fetching notes:", error)
    } finally {
      setLoading(false)
    }
  }

  const archiveNote = async (id) => {
    if (!window.confirm('Are you sure you want to archive this note?')) return
    
    try {
      const { error } = await supabase
        .from('notes')
        .update({ archived: true })
        .eq('id', id)
      
      if (error) {
        throw error
      }
      
      // Remove note from state
      setNotes(notes.filter(note => note.id !== id))
      
      // Update filters if necessary
      // updateFiltersAfterNoteChange()
      
    } catch (error) {
      console.error('Error archiving note:', error.message)
      setError('Failed to archive note.')
    }
  }

  const permanentlyDeleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this note? This cannot be undone.')) return
    
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

  const handleDeleteNote = async (id, e) => {
    e.stopPropagation()
    permanentlyDeleteNote(id)
  }

  const handleTagClick = (tag) => {
    setFilters(prev => {
      if (prev.tags.includes(tag)) {
        return { ...prev, tags: prev.tags.filter(t => t !== tag) }
      } else {
        return { ...prev, tags: [...prev.tags, tag] }
      }
    })
  }
  
  const handleCategoryClick = (category) => {
    setFilters(prev => {
      if (prev.categories.includes(category)) {
        return { ...prev, categories: prev.categories.filter(c => c !== category) }
      } else {
        return { ...prev, categories: [...prev.categories, category] }
      }
    })
  }
  
  const handleTypeClick = (type) => {
    setFilters(prev => {
      if (prev.types.includes(type)) {
        return { ...prev, types: prev.types.filter(t => t !== type) }
      } else {
        return { ...prev, types: [...prev.types, type] }
      }
    })
  }
  
  const handlePriorityClick = (priority) => {
    setFilters(prev => {
      if (prev.priorities.includes(priority)) {
        return { ...prev, priorities: prev.priorities.filter(p => p !== priority) }
      } else {
        return { ...prev, priorities: [...prev.priorities, priority] }
      }
    })
  }
  
  const handleImportanceClick = (importance) => {
    setFilters(prev => {
      if (prev.importances.includes(importance)) {
        return { ...prev, importances: prev.importances.filter(i => i !== importance) }
      } else {
        return { ...prev, importances: [...prev.importances, importance] }
      }
    })
  }

  const handleStatusClick = (status) => {
    setFilters(prev => {
      if (prev.statuses.includes(status)) {
        return { ...prev, statuses: prev.statuses.filter(s => s !== status) }
      } else {
        return { ...prev, statuses: [...prev.statuses, status] }
      }
    })
  }

  const toggleFilter = (type, value) => {
    setFilters(prevFilters => {
      const currentFilters = [...prevFilters[type]]
      const index = currentFilters.indexOf(value)
      
      if (index === -1) {
        return { ...prevFilters, [type]: [...currentFilters, value] }
      } else {
        currentFilters.splice(index, 1)
        return { ...prevFilters, [type]: currentFilters }
      }
    })
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
  
  const handleQuickNoteChange = (e) => {
    const { name, value, type, checked } = e.target
    setQuickNote(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }
  
  const handleQuickNoteSubmit = async (e) => {
    e.preventDefault()
    
    setQuickNoteError(null)
    setQuickNoteSuccess(false)
    
    try {
      if (!quickNote.content.trim()) {
        setQuickNoteError("Content is required")
        return
      }
      
      let processedTags = null
      if (quickNote.tags.trim()) {
        processedTags = quickNote.tags.split(',').map(tag => tag.trim())
      }
      
      let dueDateFormatted = null
      if (quickNote.due_date) {
        dueDateFormatted = quickNote.due_date
      }
      
      const user = await supabase.auth.getUser()
      if (!user.data.user) {
        setQuickNoteError("Please sign in to create a note")
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
          due_date: dueDateFormatted,
          url: quickNote.url || null,
          priority: quickNote.priority || null,
          importance: quickNote.importance || null,
          status: quickNote.status || 'New',
          isTask: quickNote.isTask,
          isList: quickNote.isList,
          isIdea: quickNote.isIdea,
          user_id: user.data.user.id
        })
      
      if (error) throw error
      
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
        status: 'New',
        isTask: false,
        isList: false,
        isIdea: false
      })
      
      setQuickNoteSuccess(true)
      
      fetchNotes()
      
    } catch (error) {
      console.error('Error creating note:', error)
      setQuickNoteError('Failed to create note')
    }
  }

  const handleTaskFilterChange = (value) => {
    setFilters(prev => ({ ...prev, isTask: value === null ? null : value === 'true' }))
  }
  
  const handleListFilterChange = (value) => {
    setFilters(prev => ({ ...prev, isList: value === null ? null : value === 'true' }))
  }
  
  const handleIdeaFilterChange = (value) => {
    setFilters(prev => ({ ...prev, isIdea: value === null ? null : value === 'true' }))
  }

  const handleCalendarChange = (date) => {
    setFilters(prev => ({ ...prev, date }))
    
    if (date) {
      const formattedDate = date.toISOString().split('T')[0]
      setQuickNote(prev => ({ ...prev, due_date: formattedDate }))
    }
  }
  
  const handleClearDateFilter = () => {
    setFilters(prev => ({ ...prev, date: null }))
  }
  
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const hasNotes = dateWithNotes.some(noteDate => 
        noteDate.getDate() === date.getDate() &&
        noteDate.getMonth() === date.getMonth() &&
        noteDate.getFullYear() === date.getFullYear()
      )
      
      return hasNotes ? 'has-notes' : null
    }
  }
  
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    
    return `${day}/${month}/${year}`
  }

  const hasFilters = filters.tags.length > 0 || filters.categories.length > 0 || filters.types.length > 0 || 
                    filters.priorities.length > 0 || filters.importances.length > 0 || filters.statuses.length > 0 || 
                    filters.isTask !== null || filters.isList !== null || filters.isIdea !== null || 
                    filters.date || searchTerm

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    // The filtering is automatically applied via the filteredNotes computation
  }

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
    
    if (filters.categories.length > 0) {
      if (!note.category || !filters.categories.includes(note.category)) return false
    }
    
    if (filters.types.length > 0) {
      if (!note.type || !filters.types.includes(note.type)) return false
    }
    
    if (filters.priorities.length > 0) {
      if (!note.priority || !filters.priorities.includes(note.priority)) return false
    }
    
    if (filters.importances.length > 0) {
      if (!note.importance || !filters.importances.includes(note.importance)) return false
    }
    
    if (filters.statuses.length > 0) {
      if (!note.status || !filters.statuses.includes(note.status)) return false
    }
    
    if (filters.isTask !== null) {
      if (note.isTask !== filters.isTask) return false
    }
    
    if (filters.isList !== null) {
      if (note.isList !== filters.isList) return false
    }
    
    if (filters.isIdea !== null) {
      if (note.isIdea !== filters.isIdea) return false
    }

    if (filters.date) {
      if (!note.due_date) return false
      
      const filterDate = filters.date.toISOString().split('T')[0]
      const noteDate = note.due_date
      
      if (noteDate !== filterDate) return false
    }
    
    if (filters.showWithDueDate === 'with' && !note.due_date) {
      return false
    }
    if (filters.showWithDueDate === 'without' && note.due_date) {
      return false
    }
    
    if (filters.showWithUrl === 'with' && !note.url) {
      return false
    }
    if (filters.showWithUrl === 'without' && note.url) {
      return false
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

  const handleSortChange = (e) => {
    const [field, direction] = e.target.value.split('-')
    setSorting({ field, direction })
  }
  
  const handleDueDateFilterChange = (e) => {
    setFilters(prev => ({ ...prev, showWithDueDate: e.target.value }))
  }
  
  const handleUrlFilterChange = (e) => {
    setFilters(prev => ({ ...prev, showWithUrl: e.target.value }))
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2>Quick Note</h2>
        
        {quickNoteError && (
          <div className="error" style={{ marginBottom: '1rem' }}>{quickNoteError}</div>
        )}
        
        {quickNoteSuccess && (
          <div style={{ 
            backgroundColor: '#C6F6D5', 
            color: '#22543D', 
            padding: '0.5rem 1rem', 
            borderRadius: '0.25rem',
            marginBottom: '1rem'
          }}>
            Note created successfully!
          </div>
        )}
        
        <form onSubmit={handleQuickNoteSubmit} style={{ 
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
              style={{ width: '100%', marginBottom: '0.5rem' }}
            />
          </div>
          
          <div style={{ marginBottom: '0.75rem' }}>
            <textarea
              name="content"
              placeholder="Note Content"
              value={quickNote.content}
              onChange={handleQuickNoteChange}
              rows={4}
              style={{ width: '100%', marginBottom: '0.5rem' }}
            ></textarea>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 20%', minWidth: '150px' }}>
              <input
                type="text"
                name="category"
                placeholder="Category (optional)"
                value={quickNote.category}
                onChange={handleQuickNoteChange}
                style={{ width: '100%' }}
              />
            </div>
            
            <div style={{ flex: '1 1 20%', minWidth: '150px' }}>
              <input
                type="text"
                name="type"
                placeholder="Type (optional)"
                value={quickNote.type}
                onChange={handleQuickNoteChange}
                style={{ width: '100%' }}
              />
            </div>
            
            <div style={{ flex: '1 1 20%', minWidth: '150px' }}>
              <input
                type="date"
                name="due_date"
                placeholder="Due Date (optional)"
                value={quickNote.due_date}
                onChange={handleQuickNoteChange}
                style={{ width: '100%' }}
              />
            </div>
            
            <div style={{ flex: '1 1 40%', minWidth: '150px' }}>
              <input
                type="text"
                name="tags"
                placeholder="Tags (comma separated, optional)"
                value={quickNote.tags}
                onChange={handleQuickNoteChange}
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
            >
              Save Note
            </button>
          </div>
        </form>
      </div>
      
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>My Notes</h2>
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
              placeholder="Search notes by title, content, or URL..."
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
            <span>Found <strong>{filteredNotes.length}</strong> {filteredNotes.length === 1 ? 'note' : 'notes'} matching your criteria</span>
          ) : (
            <span>Showing all <strong>{notes.length}</strong> {notes.length === 1 ? 'note' : 'notes'}</span>
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
      
      <div className="filter-section" style={{ marginBottom: '1.5rem', marginTop: '1rem' }}>
        {hasFilters && (
          <div className="active-filters" style={{ marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Active Filters:</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {searchTerm && (
                <span className="active-filter">
                  Search: {searchTerm}
                  <button onClick={() => setSearchTerm('')} className="remove-filter">×</button>
                </span>
              )}
              {filters.tags.map(tag => (
                <span key={tag} className="active-filter">
                  #{tag}
                  <button onClick={() => toggleFilter('tags', tag)} className="remove-filter">×</button>
                </span>
              ))}
              {filters.categories.map(category => (
                <span key={category} className="active-filter">
                  Category: {category}
                  <button onClick={() => toggleFilter('categories', category)} className="remove-filter">×</button>
                </span>
              ))}
              {filters.types.map(type => (
                <span key={type} className="active-filter">
                  Type: {type}
                  <button onClick={() => toggleFilter('types', type)} className="remove-filter">×</button>
                </span>
              ))}
              {filters.priorities.map(priority => (
                <span key={priority} className="active-filter">
                  Priority: {priority}
                  <button onClick={() => toggleFilter('priorities', priority)} className="remove-filter">×</button>
                </span>
              ))}
              {filters.importances.map(importance => (
                <span key={importance} className="active-filter">
                  Importance: {importance}
                  <button onClick={() => toggleFilter('importances', importance)} className="remove-filter">×</button>
                </span>
              ))}
              {filters.statuses.map(status => (
                <span key={status} className="active-filter">
                  Status: {status}
                  <button onClick={() => toggleFilter('statuses', status)} className="remove-filter">×</button>
                </span>
              ))}
              {filters.isTask !== null && (
                <span className="active-filter">
                  Task: {filters.isTask ? 'Yes' : 'No'}
                  <button onClick={() => handleTaskFilterChange(null)} className="remove-filter">×</button>
                </span>
              )}
              {filters.isList !== null && (
                <span className="active-filter">
                  List: {filters.isList ? 'Yes' : 'No'}
                  <button onClick={() => handleListFilterChange(null)} className="remove-filter">×</button>
                </span>
              )}
              {filters.isIdea !== null && (
                <span className="active-filter">
                  Idea: {filters.isIdea ? 'Yes' : 'No'}
                  <button onClick={() => handleIdeaFilterChange(null)} className="remove-filter">×</button>
                </span>
              )}
              {filters.date && (
                <span className="active-filter">
                  Date: {filters.date.toLocaleDateString()}
                  <button onClick={handleClearDateFilter} className="remove-filter">×</button>
                </span>
              )}
              <button 
                onClick={clearFilters}
                style={{
                  backgroundColor: '#f56565',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.2rem 0.5rem',
                  cursor: 'pointer'
                }}
              >
                Clear All
              </button>
            </div>
          </div>
        )}
        
        {allTags.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Tags:</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleFilter('tags', tag)}
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
        
        {allCategories.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Categories:</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {allCategories.map(category => (
                <button
                  key={category}
                  onClick={() => toggleFilter('categories', category)}
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
        
        {allTypes.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Types:</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {allTypes.map(type => (
                <button
                  key={type}
                  onClick={() => toggleFilter('types', type)}
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
        
        {allPriorities.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Priorities:</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {allPriorities.map(priority => (
                <button
                  key={priority}
                  onClick={() => toggleFilter('priorities', priority)}
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
        
        {allImportances.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Importances:</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {allImportances.map(importance => (
                <button
                  key={importance}
                  onClick={() => toggleFilter('importances', importance)}
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
        
        {allStatuses.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Statuses:</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {allStatuses.map(status => (
                <button
                  key={status}
                  onClick={() => toggleFilter('statuses', status)}
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
        
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Note Type Filters:</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <div style={{ marginBottom: '0.3rem', fontWeight: '500' }}>Task:</div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleTaskFilterChange('true')}
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
                  onClick={() => handleTaskFilterChange('false')}
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
                    onClick={() => handleTaskFilterChange(null)}
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
                  onClick={() => handleListFilterChange('true')}
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
                  onClick={() => handleListFilterChange('false')}
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
                    onClick={() => handleListFilterChange(null)}
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
                  onClick={() => handleIdeaFilterChange('true')}
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
                  onClick={() => handleIdeaFilterChange('false')}
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
                    onClick={() => handleIdeaFilterChange(null)}
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

        <div>
          <label htmlFor="dueDateFilter" style={{ marginRight: '0.5rem', fontWeight: 'bold' }}>Due Date:</label>
          <select 
            id="dueDateFilter"
            value={filters.showWithDueDate}
            onChange={handleDueDateFilterChange}
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
        
        <div>
          <label htmlFor="urlFilter" style={{ marginRight: '0.5rem', fontWeight: 'bold' }}>URLs:</label>
          <select 
            id="urlFilter"
            value={filters.showWithUrl}
            onChange={handleUrlFilterChange}
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
      </div>
      
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Calendar View</h3>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowCalendar(!showCalendar)}
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
          >
            {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
          </button>
        </div>
        
        {showCalendar && (
          <div style={{ 
            marginBottom: '1.5rem',
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
                marginTop: '0.5rem',
                borderRadius: '0.25rem'
              }}>
                <strong>Filtered by date:</strong> {formatDateForDisplay(filters.date)}
                <button 
                  onClick={handleClearDateFilter}
                  style={{ 
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#4299e1',
                    fontSize: '0.8rem',
                    marginLeft: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  ⨉ Clear date filter
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="loading">Loading notes...</div>
      ) : filteredNotes.length > 0 ? (
        <div className="note-list" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '1.5rem', 
          marginTop: '1rem' 
        }}>
          {filteredNotes.map(note => (
            <div 
              key={note.id} 
              className="card note-card"
              style={{ 
                backgroundColor: 'white', 
                borderRadius: '0.5rem', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', 
                padding: '1rem', 
                display: 'flex', 
                flexDirection: 'column', 
                minHeight: '200px',
                position: 'relative',
                cursor: 'pointer'
              }}
              onClick={() => navigate(`/edit/${note.id}`)}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
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
              
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
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
                  
                  {note.priority && (
                    <span style={{ 
                      backgroundColor: '#fef3c7', 
                      color: '#92400e', 
                      padding: '0.2rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem'
                    }}>
                      Priority: {note.priority}
                    </span>
                  )}
                  
                  {note.importance && (
                    <span style={{ 
                      backgroundColor: '#e0f2fe', 
                      color: '#0369a1', 
                      padding: '0.2rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem'
                    }}>
                      Importance: {note.importance}
                    </span>
                  )}
                  
                  {note.status && (
                    <span style={{ 
                      backgroundColor: '#d1f2eb', 
                      color: '#0c6', 
                      padding: '0.2rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem'
                    }}>
                      Status: {note.status}
                    </span>
                  )}
                  
                  {note.isTask && (
                    <span style={{ backgroundColor: '#feebc8', color: '#c05621', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>
                      Task
                    </span>
                  )}
                  
                  {note.isList && (
                    <span style={{ backgroundColor: '#c6f6d5', color: '#276749', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>
                      List
                    </span>
                  )}
                  
                  {note.isIdea && (
                    <span style={{ backgroundColor: '#fefcbf', color: '#975a16', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>
                      Idea
                    </span>
                  )}
                </div>
                
                {note.due_date && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                    fontSize: '0.75rem'
                  }}>
                    <span style={{
                      backgroundColor: '#fed7d7',
                      color: '#c53030',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '0.25rem'
                    }}>
                      Due: {new Date(note.due_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
              
              <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: '#718096' }}>
                  {new Date(note.updated_at).toLocaleDateString()}
                </span>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {note.url && (
                    <a 
                      href={note.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        color: '#4299e1',
                        textDecoration: 'none',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <span>Open URL</span>
                    </a>
                  )}
                  
                  <button 
                    className="delete-button"
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
                    onClick={(e) => {
                      e.stopPropagation()
                      permanentlyDeleteNote(note.id)
                    }}
                  >
                    Delete
                  </button>
                  <button 
                    className="archive-button"
                    style={{
                      backgroundColor: '#ed8936',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.25rem',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      width: '70px',
                      textAlign: 'center'
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      archiveNote(note.id)
                    }}
                  >
                    Archive
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-notes">
          {hasFilters ? 'No notes match your filters.' : 'No notes yet. Create your first note above!'}
        </div>
      )}
      
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
    </div>
  )
}

export default Dashboard
