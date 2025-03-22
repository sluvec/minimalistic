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
    date: null,
    showWithDueDate: 'both', // 'with', 'without', 'both'
    showWithUrl: 'both' // 'with', 'without', 'both'
  })
  const [allTags, setAllTags] = useState([])
  const [allCategories, setAllCategories] = useState([])
  const [allTypes, setAllTypes] = useState([])
  const [allPriorities, setAllPriorities] = useState([])
  const [allImportances, setAllImportances] = useState([])
  const [dateWithNotes, setDatesWithNotes] = useState([])
  const [showCalendar, setShowCalendar] = useState(true)
  
  // Sorting state
  const [sorting, setSorting] = useState({
    field: 'created_at',
    direction: 'desc'
  })
  
  // Quick note creation state
  const [quickNote, setQuickNote] = useState({
    title: '',
    content: '',
    category: '',
    type: '',
    tags: '',
    due_date: '',
    url: '',
    priority: '',
    importance: ''
  })
  const [quickNoteError, setQuickNoteError] = useState(null)
  const [quickNoteSuccess, setQuickNoteSuccess] = useState(false)
  
  const navigate = useNavigate()

  useEffect(() => {
    fetchNotes()
  }, [filters])
  
  // Reset success message after 3 seconds
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
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setNotes([])
        return
      }
      
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      if (data) {
        setNotes(data)
        
        // Extract unique values for filters
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
        
        // Extract dates with notes for calendar highlighting
        const dates = data
          .filter(note => note.due_date)
          .map(note => new Date(note.due_date))
        
        setAllTags([...new Set(extractedTags)])
        setAllCategories(categories)
        setAllTypes(types)
        setAllPriorities(priorities)
        setAllImportances(importances)
        setDatesWithNotes(dates)
      }
    } catch (error) {
      console.error("Error fetching notes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteNote = async (id, e) => {
    e.stopPropagation()
    
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return
    }
    
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      setNotes(notes.filter(note => note.id !== id))
    } catch (error) {
      console.error('Error deleting note:', error)
    }
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

  const toggleFilter = (type, value) => {
    setFilters(prevFilters => {
      const currentFilters = [...prevFilters[type]]
      const index = currentFilters.indexOf(value)
      
      if (index === -1) {
        // Add filter
        return { ...prevFilters, [type]: [...currentFilters, value] }
      } else {
        // Remove filter
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
      date: null,
      showWithDueDate: 'both',
      showWithUrl: 'both'
    })
  }
  
  const handleQuickNoteChange = (e) => {
    const { name, value } = e.target
    setQuickNote(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleQuickNoteSubmit = async (e) => {
    e.preventDefault()
    
    // Clear previous errors/success
    setQuickNoteError(null)
    setQuickNoteSuccess(false)
    
    try {
      // Simple validation
      if (!quickNote.content.trim()) {
        setQuickNoteError("Content is required")
        return
      }
      
      // Process tags if any
      let processedTags = null
      if (quickNote.tags.trim()) {
        processedTags = quickNote.tags.split(',').map(tag => tag.trim())
      }
      
      // Process due date if any
      let dueDateFormatted = null
      if (quickNote.due_date) {
        // Ensure the date is in the correct format for PostgreSQL (YYYY-MM-DD)
        dueDateFormatted = quickNote.due_date
      }
      
      const user = await supabase.auth.getUser()
      if (!user.data.user) {
        setQuickNoteError("Please sign in to create a note")
        return
      }
      
      // Create the note
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
        importance: ''
      })
      
      // Show success message
      setQuickNoteSuccess(true)
      
      // Refresh notes list
      fetchNotes()
      
    } catch (error) {
      console.error('Error creating note:', error)
      setQuickNoteError('Failed to create note')
    }
  }
  
  const handleCalendarChange = (date) => {
    // Format the date to match the database format (YYYY-MM-DD)
    setFilters(prev => ({ ...prev, date }))
    
    // Also set the date in the quick note form when selected in calendar
    if (date) {
      const formattedDate = date.toISOString().split('T')[0]
      setQuickNote(prev => ({ ...prev, due_date: formattedDate }))
    }
  }
  
  const handleClearDateFilter = () => {
    setFilters(prev => ({ ...prev, date: null }))
  }
  
  // Function to determine if a date has notes (for highlighting in calendar)
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      // Check if there are any notes for this date
      const hasNotes = dateWithNotes.some(noteDate => 
        noteDate.getDate() === date.getDate() &&
        noteDate.getMonth() === date.getMonth() &&
        noteDate.getFullYear() === date.getFullYear()
      )
      
      return hasNotes ? 'has-notes' : null
    }
  }
  
  // Function to format date as dd/mm/yyyy for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    
    return `${day}/${month}/${year}`
  }

  const hasFilters = filters.tags.length > 0 || filters.categories.length > 0 || filters.types.length > 0 || filters.priorities.length > 0 || filters.importances.length > 0 || filters.date

  // Filter notes based on selected filters
  const filteredNotes = notes.filter(note => {
    // Filter by tags
    if (filters.tags.length > 0) {
      if (!note.tags || !Array.isArray(note.tags)) return false
      const hasMatchingTag = note.tags.some(tag => filters.tags.includes(tag))
      if (!hasMatchingTag) return false
    }
    
    // Filter by category
    if (filters.categories.length > 0) {
      if (!note.category || !filters.categories.includes(note.category)) return false
    }
    
    // Filter by type
    if (filters.types.length > 0) {
      if (!note.type || !filters.types.includes(note.type)) return false
    }
    
    // Filter by priority
    if (filters.priorities.length > 0) {
      if (!note.priority || !filters.priorities.includes(note.priority)) return false
    }
    
    // Filter by importance
    if (filters.importances.length > 0) {
      if (!note.importance || !filters.importances.includes(note.importance)) return false
    }
    
    // Filter by date
    if (filters.date) {
      if (!note.due_date) return false
      
      // Format both dates to YYYY-MM-DD for comparison
      const filterDate = filters.date.toISOString().split('T')[0]
      const noteDate = note.due_date
      
      if (noteDate !== filterDate) return false
    }
    
    // Filter by due date presence
    if (filters.showWithDueDate === 'with' && !note.due_date) {
      return false
    }
    if (filters.showWithDueDate === 'without' && note.due_date) {
      return false
    }
    
    // Filter by URL presence
    if (filters.showWithUrl === 'with' && !note.url) {
      return false
    }
    if (filters.showWithUrl === 'without' && note.url) {
      return false
    }
    
    return true
  }).sort((a, b) => {
    // Sort based on selected field and direction
    const { field, direction } = sorting
    
    // Handle different field types
    if (field === 'title') {
      // For title, we need to handle null/undefined values
      const titleA = a.title || ''
      const titleB = b.title || ''
      return direction === 'asc' 
        ? titleA.localeCompare(titleB)
        : titleB.localeCompare(titleA)
    } 
    else if (field === 'due_date') {
      // For due_date, we need to handle null values and date comparison
      // Null values should come last in ascending order, first in descending
      if (!a.due_date && !b.due_date) return 0
      if (!a.due_date) return direction === 'asc' ? 1 : -1
      if (!b.due_date) return direction === 'asc' ? -1 : 1
      
      // Compare dates
      const dateA = new Date(a.due_date)
      const dateB = new Date(b.due_date)
      return direction === 'asc' 
        ? dateA - dateB 
        : dateB - dateA
    } 
    else {
      // For created_at and updated_at, simple date comparison
      // (these should always have values)
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
            <div style={{ flex: '1 1 33%', minWidth: '150px' }}>
              <input
                type="text"
                name="priority"
                placeholder="Priority (optional)"
                value={quickNote.priority}
                onChange={handleQuickNoteChange}
                style={{ width: '100%' }}
              />
            </div>
            
            <div style={{ flex: '1 1 33%', minWidth: '150px' }}>
              <input
                type="text"
                name="importance"
                placeholder="Importance (optional)"
                value={quickNote.importance}
                onChange={handleQuickNoteChange}
                style={{ width: '100%' }}
              />
            </div>
            
            <div style={{ flex: '1 1 33%', minWidth: '150px' }}>
              <input
                type="url"
                name="url"
                placeholder="URL (optional)"
                value={quickNote.url}
                onChange={handleQuickNoteChange}
                style={{ width: '100%' }}
              />
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
        <h2>My Notes</h2>
      </div>
      
      {error && <div className="error">{error}</div>}
      
      <div className="filter-section" style={{ marginBottom: '1.5rem', marginTop: '1rem' }}>
        {hasFilters && (
          <div className="active-filters" style={{ marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Active Filters:</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
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
        
        {/* Tags */}
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
        
        {/* Categories */}
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
        
        {/* Types */}
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
        
        {/* Priorities */}
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
        
        {/* Importances */}
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
      </div>
      
      {/* Sorting and additional filters */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '1rem', 
        alignItems: 'center',
        padding: '0.75rem',
        backgroundColor: '#f8fafc',
        borderRadius: '4px'
      }}>
        <div>
          <label htmlFor="sort" style={{ marginRight: '0.5rem', fontWeight: 'bold' }}>Sort by:</label>
          <select 
            id="sort"
            value={`${sorting.field}-${sorting.direction}`}
            onChange={handleSortChange}
            style={{
              padding: '0.25rem 0.5rem',
              border: '1px solid #cbd5e0',
              borderRadius: '4px',
              backgroundColor: 'white'
            }}
          >
            <option value="created_at-desc">Date Created (Newest First)</option>
            <option value="created_at-asc">Date Created (Oldest First)</option>
            <option value="due_date-asc">Due Date (Earliest First)</option>
            <option value="due_date-desc">Due Date (Latest First)</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
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
      
      {/* Calendar Section */}
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
              // Show next 3 months
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
        <div className="note-list">
          {filteredNotes.map(note => (
            <div 
              key={note.id} 
              className="card note-card"
              onClick={() => navigate(`/edit/${note.id}`)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3>{note.title}</h3>
                <button 
                  onClick={(e) => handleDeleteNote(note.id, e)} 
                  className="btn btn-secondary"
                  style={{ padding: '0.25rem 0.5rem' }}
                >
                  Delete
                </button>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                {note.category && (
                  <div className="category">{note.category}</div>
                )}
                
                {note.type && (
                  <div style={{ fontStyle: 'italic', color: '#4a5568' }}>
                    {note.type}
                  </div>
                )}
                
                {note.priority && (
                  <div style={{ 
                    backgroundColor: '#fef3c7', 
                    color: '#92400e', 
                    padding: '0.1rem 0.4rem',
                    borderRadius: '3px',
                    fontSize: '0.8rem',
                  }}>
                    Priority: {note.priority}
                  </div>
                )}
                
                {note.importance && (
                  <div style={{ 
                    backgroundColor: '#e0f2fe', 
                    color: '#0369a1', 
                    padding: '0.1rem 0.4rem',
                    borderRadius: '3px',
                    fontSize: '0.8rem',
                  }}>
                    Importance: {note.importance}
                  </div>
                )}
                
                {note.due_date && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    color: '#4a5568',
                    backgroundColor: '#f0f5ff',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '3px',
                    fontSize: '0.8rem',
                  }}>
                    <span style={{ marginRight: '0.2rem' }}>📅</span>
                    {formatDateForDisplay(note.due_date)}
                  </div>
                )}
              </div>
              
              <p style={{ 
                marginTop: '0.5rem', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                display: '-webkit-box', 
                WebkitLineClamp: 3, 
                WebkitBoxOrient: 'vertical' 
              }}>
                {note.content}
              </p>
              
              {note.url && (
                <div style={{ marginTop: '0.5rem' }}>
                  <a 
                    href={note.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      color: '#4299e1',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '0.9rem',
                      width: 'fit-content'
                    }}
                  >
                    <span style={{ marginRight: '0.3rem' }}>🔗</span>
                    {note.url.length > 40 ? `${note.url.substring(0, 40)}...` : note.url}
                  </a>
                </div>
              )}
              
              {note.tags && note.tags.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  {note.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              )}
              
              <div style={{ fontSize: '0.8rem', color: '#718096', marginTop: '0.5rem' }}>
                {new Date(note.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p>No notes found. Use the quick note form above to create your first note!</p>
        </div>
      )}
    </div>
  )
}

export default Dashboard
