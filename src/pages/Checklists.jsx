import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useDarkModeColors } from '../hooks/useDarkModeColors'

function Checklists() {
  const colors = useDarkModeColors()
  const navigate = useNavigate()
  const [checklists, setChecklists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingChecklist, setEditingChecklist] = useState(null)
  const [projects, setProjects] = useState([])
  const [spaces, setSpaces] = useState([])

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#8b5cf6',
    project_id: '',
    space_id: ''
  })

  useEffect(() => {
    fetchChecklists()
    fetchProjectsAndSpaces()
  }, [])

  const fetchChecklists = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('checklists')
        .select(`
          *,
          notes(id, title, is_checked),
          projects(id, name),
          spaces(id, name)
        `)
        .eq('archived', false)
        .order('created_at', { ascending: false })

      if (error) {
        // Table might not exist yet
        console.log('Checklists table not ready:', error)
        setChecklists([])
        return
      }
      setChecklists(data || [])
    } catch (error) {
      console.error('Error fetching checklists:', error)
      setError('Failed to load checklists. Make sure to run database migrations.')
    } finally {
      setLoading(false)
    }
  }

  const fetchProjectsAndSpaces = async () => {
    try {
      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, name')
        .eq('archived', false)
        .order('name')

      const { data: spacesData } = await supabase
        .from('spaces')
        .select('id, name')
        .eq('archived', false)
        .order('name')

      setProjects(projectsData || [])
      setSpaces(spacesData || [])
    } catch (error) {
      console.error('Error fetching projects and spaces:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      if (!formData.name.trim()) {
        throw new Error('Checklist name is required')
      }

      const user = await supabase.auth.getUser()
      if (!user.data.user) {
        throw new Error('You must be logged in')
      }

      if (editingChecklist) {
        // Update existing checklist
        const { error } = await supabase
          .from('checklists')
          .update({
            name: formData.name,
            description: formData.description || null,
            color: formData.color,
            project_id: formData.project_id || null,
            space_id: formData.space_id || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingChecklist.id)

        if (error) throw error
      } else {
        // Create new checklist
        const { error } = await supabase
          .from('checklists')
          .insert({
            name: formData.name,
            description: formData.description || null,
            color: formData.color,
            project_id: formData.project_id || null,
            space_id: formData.space_id || null,
            user_id: user.data.user.id
          })

        if (error) throw error
      }

      // Reset form and refresh
      setFormData({
        name: '',
        description: '',
        color: '#8b5cf6',
        project_id: '',
        space_id: ''
      })
      setShowCreateForm(false)
      setEditingChecklist(null)
      fetchChecklists()
    } catch (error) {
      setError(error.message)
    }
  }

  const handleEdit = (checklist) => {
    setEditingChecklist(checklist)
    setFormData({
      name: checklist.name || '',
      description: checklist.description || '',
      color: checklist.color || '#8b5cf6',
      project_id: checklist.project_id || '',
      space_id: checklist.space_id || ''
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this checklist?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('checklists')
        .update({ archived: true })
        .eq('id', id)

      if (error) throw error
      fetchChecklists()
    } catch (error) {
      setError('Failed to delete checklist: ' + error.message)
    }
  }

  const handleCancel = () => {
    setShowCreateForm(false)
    setEditingChecklist(null)
    setFormData({
      name: '',
      description: '',
      color: '#8b5cf6',
      project_id: '',
      space_id: ''
    })
  }

  if (loading) {
    return <div>Loading checklists...</div>
  }

  return (
    <div className="checklists">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h1>Check Lists</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: colors.primary,
            color: '#fff',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500'
          }}
        >
          {showCreateForm ? 'Cancel' : '+ New Checklist'}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#fed7d7',
          color: '#742a2a',
          borderRadius: '0.375rem',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {showCreateForm && (
        <div style={{
          padding: '1.5rem',
          backgroundColor: colors.background,
          border: `1px solid ${colors.border}`,
          borderRadius: '0.5rem',
          marginBottom: '2rem'
        }}>
          <h2>{editingChecklist ? 'Edit Checklist' : 'Create New Checklist'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name*</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Checklist name"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Optional description"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Color</label>
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                      {space.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={handleCancel}
                className="btn secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn primary"
                style={{ minWidth: '150px', fontWeight: 'bold' }}
              >
                {editingChecklist ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {checklists.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: colors.textMuted
        }}>
          <p>No checklists yet. Create your first checklist to get started!</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {checklists.map(checklist => {
            const totalItems = checklist.notes?.length || 0
            const checkedItems = checklist.notes?.filter(n => n.is_checked).length || 0
            const progress = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0

            return (
              <div
                key={checklist.id}
                style={{
                  padding: '1.5rem',
                  backgroundColor: colors.background,
                  border: `2px solid ${checklist.color}`,
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, color: checklist.color }}>{checklist.name}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEdit(checklist)
                      }}
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.85rem',
                        backgroundColor: colors.background,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '0.25rem',
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(checklist.id)
                      }}
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.85rem',
                        backgroundColor: '#fed7d7',
                        border: '1px solid #fc8181',
                        color: '#742a2a',
                        borderRadius: '0.25rem',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {checklist.description && (
                  <p style={{ color: colors.textMuted, fontSize: '0.9rem', marginBottom: '1rem' }}>
                    {checklist.description}
                  </p>
                )}

                {checklist.projects && (
                  <div style={{ fontSize: '0.85rem', color: colors.textMuted, marginBottom: '0.5rem' }}>
                    📁 Project: {checklist.projects.name}
                  </div>
                )}

                {checklist.spaces && (
                  <div style={{ fontSize: '0.85rem', color: colors.textMuted, marginBottom: '0.5rem' }}>
                    🗂️ Space: {checklist.spaces.name}
                  </div>
                )}

                <div style={{ marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    <span>{checkedItems}/{totalItems} completed</span>
                    <span>{progress}%</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: colors.border,
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${progress}%`,
                      height: '100%',
                      backgroundColor: checklist.color,
                      transition: 'width 0.3s'
                    }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Checklists
