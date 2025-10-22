import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function CreateNote() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    type: 'Note',
    tags: '',
    due_date: '',
    url: '',
    priority: '',
    importance: '',
    status: 'New',
    isTask: false,
    isList: false,
    isIdea: false,
    estimated_hours: '',
    estimated_minutes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
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
      
      const user = await supabase.auth.getUser()
      if (!user.data.user) {
        throw new Error('You must be logged in to create a note')
      }
      
      // Create the note
      const { error } = await supabase
        .from('notes')
        .insert({
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
          estimated_hours: formData.estimated_hours ? parseInt(formData.estimated_hours) : null,
          estimated_minutes: formData.estimated_minutes ? parseInt(formData.estimated_minutes) : null,
          user_id: user.data.user.id
        })
      
      if (error) throw error
      
      // Navigate back to dashboard
      navigate('/')
      
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="create-note">
      <h1>Create New Note</h1>
      
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
            rows={10}
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
          <label>Estimated Duration (optional)</label>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="number"
                name="estimated_hours"
                value={formData.estimated_hours}
                onChange={handleChange}
                placeholder="0"
                min="0"
                max="999"
                style={{ width: '80px' }}
              />
              <span>hours</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="number"
                name="estimated_minutes"
                value={formData.estimated_minutes}
                onChange={handleChange}
                placeholder="0"
                min="0"
                max="59"
                style={{ width: '80px' }}
              />
              <span>minutes</span>
            </div>
          </div>
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
        
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/')} className="btn secondary">
            Cancel
          </button>
          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Note'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateNote
