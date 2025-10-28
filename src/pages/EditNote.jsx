import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useHotkeys } from 'react-hotkeys-hook'
import { supabase } from '../lib/supabaseClient'
import { useDarkModeColors } from '../hooks/useDarkModeColors'
import { useAutoSave } from '../hooks/useAutoSave'
import SaveStatusIndicator from '../components/SaveStatusIndicator'

// Constants and utilities
import { STATUS, STATUS_OPTIONS, TRIAGE_STATUS_OPTIONS, ERROR_MESSAGES, NOTE_TYPE_OPTIONS } from '../constants'
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
    triage_status: 'New',
    estimated_hours: '',
    estimated_minutes: '',
    project_id: '',
    space_id: '',
    checklist_id: '',
    is_checkable: false,
    is_checked: false
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAdvanced, setShowAdvanced] = useState(true)
  const [projects, setProjects] = useState([])
  const [spaces, setSpaces] = useState([])
  const [checklists, setChecklists] = useState([])

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
          triage_status: data.triage_status || 'New',
          estimated_hours: data.estimated_hours || '',
          estimated_minutes: data.estimated_minutes || '',
          project_id: data.project_id || '',
          space_id: data.space_id || '',
          checklist_id: data.checklist_id || '',
          is_checkable: data.is_checkable || false,
          is_checked: data.is_checked || false
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

    fetchNote()
    fetchProjects()
    fetchSpaces()
    fetchChecklists()
  }, [id])
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Modern auto-save function (no form submission needed!)
  const saveNote = useCallback(async (data) => {
    // Validate note using utility
    const validation = validateNote(data)
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0]
      throw new Error(firstError)
    }

    // Process tags using utility
    const processedTags = parseTags(data.tags)

    // Update the note
    const { error } = await supabase
      .from('notes')
      .update({
        title: data.title,
        content: data.content,
        category: data.category || null,
        type: data.type || null,
        tags: processedTags,
        due_date: data.due_date || null,
        url: data.url || null,
        priority: data.priority || null,
        importance: data.importance || null,
        status: data.status || STATUS.NEW,
        triage_status: data.triage_status || 'New',
        note_type: data.note_type,
        isTask: data.note_type === 'task',
        isList: data.note_type === 'list',
        isIdea: data.note_type === 'idea',
        estimated_hours: data.estimated_hours ? parseInt(data.estimated_hours) : null,
        estimated_minutes: data.estimated_minutes ? parseInt(data.estimated_minutes) : null,
        project_id: data.project_id || null,
        space_id: data.space_id || null,
        checklist_id: data.checklist_id || null,
        is_checkable: data.is_checkable || false,
        is_checked: data.is_checked || false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) throw error
  }, [id])

  // Auto-save hook - saves automatically after 1.5s of inactivity
  const { isSaving, lastSaved, saveNow, error: saveError } = useAutoSave(
    saveNote,
    formData,
    { delay: 1500, enabled: !loading }
  )

  // Keyboard shortcuts for power users
  useHotkeys('cmd+s, ctrl+s', (e) => {
    e.preventDefault()
    saveNow() // Immediate save on Cmd+S
  }, [saveNow])

  useHotkeys('esc', () => {
    navigate('/') // Quick exit with Esc
  }, [navigate])

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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h1 style={{ margin: 0 }}>Edit Note</h1>

        {/* Modern save status indicator */}
        <SaveStatusIndicator
          isSaving={isSaving}
          lastSaved={lastSaved}
          error={saveError}
        />
      </div>

      {error && (
        <div className="error">{error}</div>
      )}

      {/* Keyboard shortcut hints */}
      <div style={{
        fontSize: '0.75rem',
        color: colors.textMuted,
        marginBottom: '1rem',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <span>💡 <strong>Cmd+S</strong> to save</span>
        <span>💡 <strong>Esc</strong> to go back</span>
        <span>✨ <strong>Auto-saves</strong> while you type</span>
      </div>

      <form>
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
            placeholder="Title (optional)"
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
            color: colors.textPrimary,
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

                {formData.is_checkable && (
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        name="is_checked"
                        checked={formData.is_checked}
                        onChange={handleChange}
                      />
                      Checked
                    </label>
                  </div>
                )}
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

                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleChange}
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

        {/* Action buttons - no save button needed thanks to auto-save! */}
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
                cursor: 'pointer',
                transition: 'opacity 0.2s ease-in-out'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
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
                cursor: 'pointer',
                transition: 'opacity 0.2s ease-in-out'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Archive Note
            </button>
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn primary"
            style={{
              backgroundColor: colors.primary,
              padding: '0.5rem 1.5rem',
              borderRadius: '0.375rem',
              border: 'none',
              color: 'white',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.primaryHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.primary}
          >
            Done
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditNote
