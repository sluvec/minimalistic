import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function Projects() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingProject, setEditingProject] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    progress: 0,
    deadline: ''
  })

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select('*, notes(id)')
        .eq('archived', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
      setError('Failed to load projects')
    } finally {
      setLoading(false)
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
        throw new Error('Project name is required')
      }

      const user = await supabase.auth.getUser()
      if (!user.data.user) {
        throw new Error('You must be logged in')
      }

      if (editingProject) {
        // Update existing project
        const { error } = await supabase
          .from('projects')
          .update({
            name: formData.name,
            description: formData.description || null,
            color: formData.color,
            progress: parseInt(formData.progress),
            deadline: formData.deadline || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingProject.id)

        if (error) throw error
      } else {
        // Create new project
        const { error } = await supabase
          .from('projects')
          .insert({
            name: formData.name,
            description: formData.description || null,
            color: formData.color,
            progress: parseInt(formData.progress),
            deadline: formData.deadline || null,
            user_id: user.data.user.id
          })

        if (error) throw error
      }

      // Reset form and refresh
      setFormData({ name: '', description: '', color: '#3b82f6', progress: 0, deadline: '' })
      setShowCreateForm(false)
      setEditingProject(null)
      fetchProjects()
    } catch (error) {
      console.error('Error saving project:', error)
      setError(error.message)
    }
  }

  const handleEdit = (project) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      description: project.description || '',
      color: project.color || '#3b82f6',
      progress: project.progress || 0,
      deadline: project.deadline || ''
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? Notes will not be deleted, only unlinked.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (error) throw error
      fetchProjects()
    } catch (error) {
      console.error('Error deleting project:', error)
      setError('Failed to delete project')
    }
  }

  const handleArchive = async (projectId) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ archived: true })
        .eq('id', projectId)

      if (error) throw error
      fetchProjects()
    } catch (error) {
      console.error('Error archiving project:', error)
      setError('Failed to archive project')
    }
  }

  const cancelEdit = () => {
    setFormData({ name: '', description: '', color: '#3b82f6', progress: 0, deadline: '' })
    setShowCreateForm(false)
    setEditingProject(null)
  }

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading projects...</div>
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Projects</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#48bb78',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          {showCreateForm ? 'Cancel' : '+ New Project'}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#fed7d7',
          color: '#c53030',
          borderRadius: '0.375rem',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div style={{
          backgroundColor: '#f7fafc',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          marginBottom: '2rem',
          border: '1px solid #e2e8f0'
        }}>
          <h2>{editingProject ? 'Edit Project' : 'Create New Project'}</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Project Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.375rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.375rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Color
                </label>
                <input
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    height: '40px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.375rem'
                  }}
                />
              </div>

              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Progress: {formData.progress}%
                </label>
                <input
                  type="range"
                  name="progress"
                  value={formData.progress}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Deadline
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.375rem'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#48bb78',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                {editingProject ? 'Update Project' : 'Create Project'}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#e2e8f0',
                  color: '#4a5568',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects List */}
      {projects.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          backgroundColor: '#f7fafc',
          borderRadius: '0.5rem',
          color: '#718096'
        }}>
          <p>No projects yet. Create your first project to get started!</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {projects.map(project => (
            <div
              key={project.id}
              style={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                borderTop: `4px solid ${project.color}`,
                cursor: 'pointer',
                transition: 'box-shadow 0.2s'
              }}
              onClick={() => navigate(`/project/${project.id}`)}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
            >
              <h3 style={{ marginBottom: '0.5rem', color: project.color }}>{project.name}</h3>

              {project.description && (
                <p style={{
                  fontSize: '0.9rem',
                  color: '#718096',
                  marginBottom: '1rem',
                  lineHeight: '1.5'
                }}>
                  {project.description}
                </p>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem'
                }}>
                  <span>Progress</span>
                  <span style={{ fontWeight: '600' }}>{project.progress}%</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#e2e8f0',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${project.progress}%`,
                    height: '100%',
                    backgroundColor: project.color,
                    transition: 'width 0.3s'
                  }}></div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.875rem',
                color: '#718096',
                marginBottom: '1rem'
              }}>
                <span>{project.notes?.length || 0} items</span>
                {project.deadline && (
                  <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                )}
              </div>

              <div
                style={{ display: 'flex', gap: '0.5rem' }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => handleEdit(project)}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    backgroundColor: '#edf2f7',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleArchive(project.id)}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    backgroundColor: '#fed7d7',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Archive
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Projects
