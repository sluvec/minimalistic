import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useHotkeys } from 'react-hotkeys-hook'
import { supabase } from '../lib/supabaseClient'
import { STATUS_OPTIONS, TRIAGE_STATUS_OPTIONS, NOTE_TYPE_OPTIONS } from '../constants'
import { useDarkModeColors } from '../hooks/useDarkModeColors'

function CreateNote() {
  const colors = useDarkModeColors()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const projectIdFromUrl = searchParams.get('project')

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    type: 'Note',
    tags: '',
    start_date: '',
    end_date: '',
    due_date: '',
    url: '',
    priority: 'NA',
    importance: 'NA',
    status: 'New',
    note_type: 'note',
    triage_status: 'New',
    estimated_hours: '',
    estimated_minutes: '',
    project_id: projectIdFromUrl || '',
    space_id: '',
    checklist_id: '',
    is_checkable: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showAdvanced, setShowAdvanced] = useState(true)
  const [projects, setProjects] = useState([])
  const [spaces, setSpaces] = useState([])
  const [checklists, setChecklists] = useState([])

  useEffect(() => {
    fetchProjects()
    fetchSpaces()
    fetchChecklists()
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

  const fetchChecklists = async () => {
    try {
      const { data, error } = await supabase
        .from('checklists')
        .select('id, name, color')
        .eq('archived', false)
        .order('name')

      if (error) {
        // Table might not exist yet, silently fail
        console.log('Checklists table not ready yet')
        return
      }
      setChecklists(data || [])
    } catch (error) {
      console.log('Error fetching checklists:', error)
    }
  }

  // Ref to trigger form submission
  const submitButtonRef = useRef(null)

  // Keyboard shortcuts
  useHotkeys('cmd+s, ctrl+s', (e) => {
    e.preventDefault()
    if (submitButtonRef.current) {
      submitButtonRef.current.click()
    }
  }, [])

  useHotkeys('esc', () => {
    navigate('/')
  }, [navigate])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  // Auto-generate title from first 2 words of content if title is empty
  const generateTitleFromContent = (content) => {
    if (!content || content.trim().length === 0) {
      return 'Untitled Note - ' + new Date().toLocaleDateString()
    }
    const words = content.trim().split(/\s+/)
    if (words.length === 1) {
      return words[0]
    }
    return words.slice(0, 2).join(' ')
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
      
      // Auto-generate title if empty
      const finalTitle = formData.title.trim()
        ? formData.title
        : generateTitleFromContent(formData.content)

      // Create the note
      const { error } = await supabase
        .from('notes')
        .insert({
          title: finalTitle,
          content: formData.content,
          category: formData.category || null,
          type: formData.type || null,
          tags: processedTags,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          due_date: formData.due_date || null,
          url: formData.url || null,
          priority: formData.priority || null,
          importance: formData.importance || null,
          status: formData.status || 'New',
          triage_status: formData.triage_status || 'New',
          note_type: formData.note_type,
          isTask: formData.note_type === 'task',
          isList: formData.note_type === 'list',
          isIdea: formData.note_type === 'idea',
          estimated_hours: formData.estimated_hours ? parseInt(formData.estimated_hours) : null,
          estimated_minutes: formData.estimated_minutes ? parseInt(formData.estimated_minutes) : null,
          project_id: formData.project_id || null,
          space_id: formData.space_id || null,
          checklist_id: formData.checklist_id || null,
          is_checkable: formData.is_checkable || false,
          is_checked: false,
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

      {/* Keyboard shortcut hints */}
      <div style={{
        fontSize: '0.75rem',
        color: colors.textMuted,
        marginBottom: '1rem',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <span>💡 <strong>Cmd+S</strong> to create</span>
        <span>💡 <strong>Esc</strong> to cancel</span>
      </div>

      {error && (
        <div className="error">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
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
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Title (optional - auto-generated from content if empty)"
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
            color: colors.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hover}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.background}
        >
          <span>⚙️ Advanced Options</span>
          <span style={{ fontSize: '1.2rem' }}>{showAdvanced ? '▲' : '▼'}</span>
        </button>

        {showAdvanced && (
          <div style={{
            padding: '1.5rem',
            backgroundColor: colors.background,
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            border: `1px solid ${colors.border}`
          }}>
            {/* Note Type Selection */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ marginBottom: '0.75rem', display: 'block', fontWeight: '600' }}>Note Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
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
                    id="note_type_event"
                    name="note_type"
                    value="event"
                    checked={formData.note_type === 'event'}
                    onChange={handleChange}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <label htmlFor="note_type_event">📅 Event</label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="radio"
                    id="note_type_link"
                    name="note_type"
                    value="link"
                    checked={formData.note_type === 'link'}
                    onChange={handleChange}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <label htmlFor="note_type_link">🔗 Link</label>
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

            {/* 3-Column Layout for other fields */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {/* Column 1 - Organization */}
              <div>
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
                  <label>Check-list</label>
                  <select
                    name="checklist_id"
                    value={formData.checklist_id}
                    onChange={handleChange}
                  >
                    <option value="">No Check-list</option>
                    {checklists.map(checklist => (
                      <option key={checklist.id} value={checklist.id}>
                        {checklist.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      name="is_checkable"
                      checked={formData.is_checkable}
                      onChange={handleChange}
                    />
                    Checkable item
                  </label>
                </div>
              </div>

              {/* Column 2 - Categorization */}
              <div>
                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="Category"
                  />
                </div>

                <div className="form-group">
                  <label>Type</label>
                  <input
                    type="text"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    placeholder="Type"
                  />
                </div>

                <div className="form-group">
                  <label>Tags</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="Comma separated"
                  />
                </div>
              </div>

              {/* Column 3 - Priority & Status */}
              <div>
                <div className="form-group">
                  <label>Triage Status</label>
                  <select
                    name="triage_status"
                    value={formData.triage_status}
                    onChange={handleChange}
                  >
                    {TRIAGE_STATUS_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
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
                  <label>Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="NA">NA</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
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
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Date Fields - Full Width */}
            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label style={{ marginBottom: '1rem', display: 'block', fontWeight: '600', fontSize: '0.95rem' }}>📅 Date Information</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.875rem' }}>Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem' }}>End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem' }}>Due Date</label>
                  <input
                    type="date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleChange}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>

            {/* Estimated Duration - Full Width */}
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Estimated Duration</label>
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
          </div>
        )}

        <div className="form-actions" style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', marginTop: '2rem' }}>
          <button type="button" onClick={() => navigate('/')} className="btn secondary">
            Cancel
          </button>
          <button
            ref={submitButtonRef}
            type="submit"
            className="btn primary"
            disabled={loading}
            style={{ minWidth: '200px', fontWeight: 'bold' }}
          >
            {loading ? 'Creating...' : 'Save Note'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateNote
