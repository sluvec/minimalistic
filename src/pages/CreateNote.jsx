import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function CreateNote() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const projectIdFromUrl = searchParams.get('project')

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    type: 'Note',
    tags: '',
    due_date: '',
    url: '',
    priority: 'NA',
    importance: 'NA',
    status: 'New',
    note_type: 'note',
    estimated_hours: '',
    estimated_minutes: '',
    project_id: projectIdFromUrl || '',
    space_id: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [projects, setProjects] = useState([])
  const [spaces, setSpaces] = useState([])

  useEffect(() => {
    fetchProjects()
    fetchSpaces()
  }, [])

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, color')
        .eq('archived', false)
        .order('name')

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const fetchSpaces = async () => {
    try {
      const { data, error } = await supabase
        .from('spaces')
        .select('id, name, icon, color')
        .eq('archived', false)
        .order('name')

      if (error) throw error
      setSpaces(data || [])
    } catch (error) {
      console.error('Error fetching spaces:', error)
    }
  }
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
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
          note_type: formData.note_type,
          isTask: formData.note_type === 'task',
          isList: formData.note_type === 'list',
          isIdea: formData.note_type === 'idea',
          estimated_hours: formData.estimated_hours ? parseInt(formData.estimated_hours) : null,
          estimated_minutes: formData.estimated_minutes ? parseInt(formData.estimated_minutes) : null,
          project_id: formData.project_id || null,
          space_id: formData.space_id || null,
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

        {/* Toggle Advanced Options */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            width: '100%',
            padding: '0.75rem',
            marginBottom: '1rem',
            backgroundColor: '#f7fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '500',
            color: '#4a5568',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#edf2f7'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f7fafc'}
        >
          <span>⚙️ Advanced Options</span>
          <span style={{ fontSize: '1.2rem' }}>{showAdvanced ? '▲' : '▼'}</span>
        </button>

        {showAdvanced && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#f7fafc',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            border: '1px solid #e2e8f0'
          }}>
            <div className="form-group">
              <label>Project</label>
              <select
                name="project_id"
                value={formData.project_id}
                onChange={handleChange}
              >
                <option value="">No Project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Space</label>
              <select
                name="space_id"
                value={formData.space_id}
                onChange={handleChange}
              >
                <option value="">No Space</option>
                {spaces.map(space => (
                  <option key={space.id} value={space.id}>
                    {space.icon} {space.name}
                  </option>
                ))}
              </select>
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
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="NA">NA</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="form-group">
          <label>Importance</label>
          <select
            name="importance"
            value={formData.importance}
            onChange={handleChange}
          >
            <option value="NA">NA</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
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
        
        <div className="form-group">
          <label>Note Type</label>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="radio"
                id="note_type_note"
                name="note_type"
                value="note"
                checked={formData.note_type === 'note'}
                onChange={handleChange}
                style={{ marginRight: '0.5rem' }}
              />
              <label htmlFor="note_type_note">📝 Note</label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="radio"
                id="note_type_task"
                name="note_type"
                value="task"
                checked={formData.note_type === 'task'}
                onChange={handleChange}
                style={{ marginRight: '0.5rem' }}
              />
              <label htmlFor="note_type_task">✅ Task</label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="radio"
                id="note_type_idea"
                name="note_type"
                value="idea"
                checked={formData.note_type === 'idea'}
                onChange={handleChange}
                style={{ marginRight: '0.5rem' }}
              />
              <label htmlFor="note_type_idea">💡 Idea</label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="radio"
                id="note_type_list"
                name="note_type"
                value="list"
                checked={formData.note_type === 'list'}
                onChange={handleChange}
                style={{ marginRight: '0.5rem' }}
              />
              <label htmlFor="note_type_list">📋 List</label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="radio"
                id="note_type_prompt"
                name="note_type"
                value="prompt"
                checked={formData.note_type === 'prompt'}
                onChange={handleChange}
                style={{ marginRight: '0.5rem' }}
              />
              <label htmlFor="note_type_prompt">🤖 Prompt</label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="radio"
                id="note_type_question"
                name="note_type"
                value="question"
                checked={formData.note_type === 'question'}
                onChange={handleChange}
                style={{ marginRight: '0.5rem' }}
              />
              <label htmlFor="note_type_question">❓ Question</label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="radio"
                id="note_type_reflection"
                name="note_type"
                value="reflection"
                checked={formData.note_type === 'reflection'}
                onChange={handleChange}
                style={{ marginRight: '0.5rem' }}
              />
              <label htmlFor="note_type_reflection">💭 Reflection</label>
            </div>
          </div>
        </div>
          </div>
        )}

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
