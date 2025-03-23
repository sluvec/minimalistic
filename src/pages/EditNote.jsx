import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function EditNote() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saveLoading, setSaveLoading] = useState(false)
  
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('id', id)
          .single()
        
        if (error) throw error
        
        if (!data) {
          throw new Error('Note not found')
        }
        
        // Process tags for form (convert array to comma-separated string)
        const tagsString = data.tags && Array.isArray(data.tags) 
          ? data.tags.join(', ') 
          : ''
        
        setFormData({
          title: data.title || '',
          content: data.content || '',
          category: data.category || '',
          type: data.type || '',
          tags: tagsString,
          due_date: data.due_date || '',
          url: data.url || '',
          priority: data.priority || '',
          importance: data.importance || '',
          status: data.status || 'New',
          isTask: data.isTask || false,
          isList: data.isList || false,
          isIdea: data.isIdea || false
        })
        
      } catch (error) {
        console.error('Error fetching note:', error)
        setError('Failed to load note')
      } finally {
        setLoading(false)
      }
    }
    
    fetchNote()
  }, [id])
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaveLoading(true)
    setError(null)
    
    try {
      // Validate required fields
      if (!formData.content.trim()) {
        throw new Error('Content is required')
      }
      
      // Process tags if any
      let processedTags = null
      if (formData.tags.trim()) {
        processedTags = formData.tags.split(',').map(tag => tag.trim())
      }
      
      // Update the note
      const { error } = await supabase
        .from('notes')
        .update({
          title: formData.title,
          content: formData.content,
          category: formData.category || null,
          type: formData.type || null,
          tags: processedTags,
          due_date: formData.due_date || null,
          url: formData.url || null,
          priority: formData.priority || null,
          importance: formData.importance || null,
          status: formData.status || 'New',
          isTask: formData.isTask,
          isList: formData.isList,
          isIdea: formData.isIdea,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
      
      // Navigate back to dashboard
      navigate('/')
      
    } catch (error) {
      console.error('Error updating note:', error)
      setError(error.message || 'Failed to update note')
    } finally {
      setSaveLoading(false)
    }
  }
  
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return
    }
    
    try {
      setError(null)
      
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
      
      if (error) {
        throw error
      }
      
      navigate('/')
    } catch (error) {
      setError('Error deleting note: ' + error.message)
    }
  }
  
  const handleArchive = async () => {
    if (!window.confirm('Are you sure you want to archive this note?')) {
      return
    }
    
    try {
      setError(null)
      
      const { error } = await supabase
        .from('notes')
        .update({ archived: true })
        .eq('id', id)
      
      if (error) {
        throw error
      }
      
      navigate('/')
    } catch (error) {
      setError('Error archiving note: ' + error.message)
    }
  }
  
  if (loading) {
    return <div>Loading...</div>
  }
  
  return (
    <div className="edit-note">
      <h1>Edit Note</h1>
      
      {error && (
        <div className="error">{error}</div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Title (optional)"
          />
        </div>
        
        <div className="form-group">
          <label>Content*</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Enter note content"
            rows={5}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Category</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Category (optional)"
          />
        </div>
        
        <div className="form-group">
          <label>Type</label>
          <input
            type="text"
            name="type"
            value={formData.type}
            onChange={handleChange}
            placeholder="Type (optional)"
          />
        </div>
        
        <div className="form-group">
          <label>Tags</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="Tags (comma separated)"
          />
        </div>
        
        <div className="form-group">
          <label>Due Date</label>
          <input
            type="date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label>URL</label>
          <input
            type="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            placeholder="URL (optional)"
          />
        </div>
        
        <div className="form-group">
          <label>Priority</label>
          <input
            type="text"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            placeholder="Priority (optional)"
          />
        </div>
        
        <div className="form-group">
          <label>Importance</label>
          <input
            type="text"
            name="importance"
            value={formData.importance}
            onChange={handleChange}
            placeholder="Importance (optional)"
          />
        </div>
        
        <div className="form-group">
          <label>Status</label>
          <input
            type="text"
            name="status"
            value={formData.status}
            onChange={handleChange}
            placeholder="Status"
          />
        </div>
        
        <div className="form-group" style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              id="isTask"
              name="isTask"
              checked={formData.isTask}
              onChange={handleChange}
              style={{ marginRight: '0.5rem' }}
            />
            <label htmlFor="isTask">Task</label>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              id="isList"
              name="isList"
              checked={formData.isList}
              onChange={handleChange}
              style={{ marginRight: '0.5rem' }}
            />
            <label htmlFor="isList">List</label>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              id="isIdea"
              name="isIdea"
              checked={formData.isIdea}
              onChange={handleChange}
              style={{ marginRight: '0.5rem' }}
            />
            <label htmlFor="isIdea">Idea</label>
          </div>
        </div>
        
        <div className="form-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              type="button" 
              onClick={handleDelete} 
              className="btn danger"
              style={{ 
                backgroundColor: '#f56565',
                padding: '0.5rem 1.25rem',
                borderRadius: '0.375rem',
                border: 'none',
                color: 'white',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Delete Note
            </button>
            <button 
              type="button" 
              onClick={handleArchive} 
              className="btn archive"
              style={{ 
                backgroundColor: '#ed8936',
                padding: '0.5rem 1.25rem',
                borderRadius: '0.375rem',
                border: 'none',
                color: 'white',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Archive Note
            </button>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <button 
              type="button" 
              onClick={() => navigate('/')} 
              className="btn secondary"
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '0.375rem',
                border: '1px solid #e2e8f0',
                backgroundColor: '#edf2f7',
                color: '#4a5568',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn primary" 
              disabled={saveLoading}
              style={{
                backgroundColor: '#48bb78', 
                padding: '0.5rem 1.25rem',
                borderRadius: '0.375rem',
                border: 'none',
                color: 'white',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              {saveLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default EditNote
