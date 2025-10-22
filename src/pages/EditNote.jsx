import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useDarkModeColors } from '../hooks/useDarkModeColors'

// Constants and utilities
import { STATUS, STATUS_OPTIONS, ERROR_MESSAGES } from '../constants'
import { parseTags, tagsToString } from '../utils/tagHelpers'
import { validateNote } from '../utils/validation'

function EditNote() {
  const colors = useDarkModeColors()
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
    status: STATUS.NEW,
    note_type: 'note',
    estimated_hours: '',
    estimated_minutes: '',
    project_id: '',
    space_id: ''
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saveLoading, setSaveLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(true)
  const [projects, setProjects] = useState([])
  const [spaces, setSpaces] = useState([])

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
          throw new Error(ERROR_MESSAGES.NOT_FOUND)
        }

        // Process tags for form using utility
        const tagsString = tagsToString(data.tags)

        // Infer note_type from existing data
        let noteType = data.note_type || 'note'
        if (!data.note_type) {
          // Backward compatibility: infer from boolean flags
          if (data.isTask) {
            noteType = 'task'
          } else if (data.isIdea) {
            noteType = 'idea'
          } else if (data.isList) {
            noteType = 'list'
          }
        }

        setFormData({
          title: data.title || '',
          content: data.content || '',
          category: data.category || '',
          type: data.type || '',
          tags: tagsString,
          due_date: data.due_date || '',
          url: data.url || '',
          priority: data.priority || 'NA',
          importance: data.importance || 'NA',
          status: data.status || STATUS.NEW,
          note_type: noteType,
          estimated_hours: data.estimated_hours || '',
          estimated_minutes: data.estimated_minutes || '',
          project_id: data.project_id || '',
          space_id: data.space_id || ''
        })

      } catch (error) {
        console.error('Error fetching note:', error)
        setError('Failed to load note')
      } finally {
        setLoading(false)
      }
    }

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

    fetchNote()
    fetchProjects()
    fetchSpaces()
  }, [id])
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Prevent double submission
    if (saveLoading) return

    setSaveLoading(true)
    setError(null)

    try {
      // Validate note using utility
      const validation = validateNote(formData)
      if (!validation.valid) {
        const firstError = Object.values(validation.errors)[0]
        throw new Error(firstError)
      }

      // Process tags using utility
      const processedTags = parseTags(formData.tags)

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
          status: formData.status || STATUS.NEW,
          note_type: formData.note_type,
          isTask: formData.note_type === 'task',
          isList: formData.note_type === 'list',
          isIdea: formData.note_type === 'idea',
          estimated_hours: formData.estimated_hours ? parseInt(formData.estimated_hours) : null,
          estimated_minutes: formData.estimated_minutes ? parseInt(formData.estimated_minutes) : null,
          project_id: formData.project_id || null,
          space_id: formData.space_id || null,
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
            backgroundColor: colors.background,
            border: `1px solid ${colors.border}`,
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '500',
            color: colors.textSecondary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hoverBackground}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.background}
        >
          <span>⚙️ Advanced Options</span>
          <span style={{ fontSize: '1.2rem' }}>{showAdvanced ? '▲' : '▼'}</span>
        </button>

        {showAdvanced && (
          <div style={{
            padding: '1rem',
            backgroundColor: colors.background,
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            border: `1px solid ${colors.border}`
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
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            {STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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

        <div className="form-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={handleDelete}
              className="btn danger"
              style={{
                backgroundColor: colors.danger,
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
                backgroundColor: colors.warning,
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
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.darkerBackground,
                color: colors.textSecondary,
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
                backgroundColor: colors.success,
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
