import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useDarkModeColors } from '../hooks/useDarkModeColors'

function Projects() {
  const colors = useDarkModeColors()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    progress: 0,
    deadline: '',
    category_id: '',
    tag_ids: []
  })

  useEffect(() => {
    fetchProjects()
    fetchCategoriesAndTags()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          notes(id),
          categories(id, name, color),
          project_tags(tag_id, tags(id, name, color))
        `)
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

  const fetchCategoriesAndTags = async () => {
    try {
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('id, name, color')
        .eq('archived', false)
        .order('name')

      const { data: tagsData } = await supabase
        .from('tags')
        .select('id, name, color')
        .eq('archived', false)
        .order('name')

      setCategories(categoriesData || [])
      setTags(tagsData || [])
    } catch (error) {
      console.error('Error fetching categories and tags:', error)
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
            category_id: formData.category_id || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingProject.id)

        if (error) throw error

        // Update project tags
        // First, delete existing tags
        await supabase
          .from('project_tags')
          .delete()
          .eq('project_id', editingProject.id)

        // Then insert new tags
        if (formData.tag_ids.length > 0) {
          const projectTags = formData.tag_ids.map(tag_id => ({
            project_id: editingProject.id,
            tag_id: tag_id
          }))
          await supabase.from('project_tags').insert(projectTags)
        }
      } else {
        // Create new project
        const { data: project, error } = await supabase
          .from('projects')
          .insert({
            name: formData.name,
            description: formData.description || null,
            color: formData.color,
            progress: parseInt(formData.progress),
            deadline: formData.deadline || null,
            category_id: formData.category_id || null,
            user_id: user.data.user.id
          })
          .select()
          .single()

        if (error) throw error

        // Save project_tags (if tags selected)
        if (formData.tag_ids.length > 0 && project) {
          const projectTags = formData.tag_ids.map(tag_id => ({
            project_id: project.id,
            tag_id: tag_id
          }))
          await supabase.from('project_tags').insert(projectTags)
        }
      }

      // Reset form and refresh
      setFormData({ name: '', description: '', color: '#3b82f6', progress: 0, deadline: '', category_id: '', tag_ids: [] })
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
      deadline: project.deadline || '',
      category_id: project.category_id || '',
      tag_ids: project.project_tags?.map(pt => pt.tag_id) || []
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
    setFormData({ name: '', description: '', color: '#3b82f6', progress: 0, deadline: '', category_id: '', tag_ids: [] })
    setShowCreateForm(false)
    setEditingProject(null)
  }

  if (loading) {
    return <div style={{ padding: '2rem', color: colors.textPrimary }}>Loading projects...</div>
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: colors.textPrimary }}>Projects</h1>
        {showCreateForm ? (
          <button
            type="submit"
            form="project-form"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#48bb78',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Save
          </button>
        ) : (
          <button
            onClick={() => setShowCreateForm(true)}
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
            + New Project
          </button>
        )}
      </div>

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: colors.errorBackground,
          color: colors.errorText,
          borderRadius: '0.375rem',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div style={{
          backgroundColor: colors.cardBackground,
          padding: '1.5rem',
          borderRadius: '0.5rem',
          marginBottom: '2rem',
          border: `1px solid ${colors.border}`
        }}>
          <h2 style={{ color: colors.textPrimary }}>{editingProject ? 'Edit Project' : 'Create New Project'}</h2>
          <form id="project-form" onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: colors.textPrimary }}>
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
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.375rem',
                  backgroundColor: colors.inputBackground,
                  color: colors.textPrimary
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: colors.textPrimary }}>
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
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.375rem',
                  backgroundColor: colors.inputBackground,
                  color: colors.textPrimary
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: colors.textPrimary }}>
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
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.375rem'
                  }}
                />
              </div>

              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: colors.textPrimary }}>
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: colors.textPrimary }}>
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
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.375rem',
                    backgroundColor: colors.inputBackground,
                    color: colors.textPrimary
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: colors.textPrimary }}>
                Category
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.375rem',
                  backgroundColor: colors.inputBackground,
                  color: colors.textPrimary
                }}
              >
                <option value="">No Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: colors.textPrimary }}>
                Tags
              </label>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.75rem',
                padding: '0.75rem',
                border: `1px solid ${colors.border}`,
                borderRadius: '0.375rem',
                backgroundColor: colors.background
              }}>
                {tags.length === 0 ? (
                  <span style={{ color: colors.textMuted, fontSize: '0.875rem' }}>No tags available</span>
                ) : (
                  tags.map(tag => (
                    <label
                      key={tag.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        padding: '0.375rem 0.75rem',
                        borderRadius: '0.25rem',
                        backgroundColor: formData.tag_ids.includes(tag.id) ? tag.color + '20' : colors.cardBackground,
                        border: `1px solid ${formData.tag_ids.includes(tag.id) ? tag.color : colors.border}`,
                        transition: 'all 0.2s'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.tag_ids.includes(tag.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({...formData, tag_ids: [...formData.tag_ids, tag.id]})
                          } else {
                            setFormData({...formData, tag_ids: formData.tag_ids.filter(id => id !== tag.id)})
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: formData.tag_ids.includes(tag.id) ? tag.color : colors.textSecondary
                      }}>
                        {tag.name}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', marginTop: '2rem' }}>
              <button
                type="button"
                onClick={cancelEdit}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: colors.secondaryButtonBackground,
                  color: colors.textSecondary,
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#48bb78',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontWeight: '600',
                  minWidth: '200px'
                }}
              >
                {editingProject ? 'Update Project' : 'Save'}
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
          backgroundColor: colors.cardBackground,
          borderRadius: '0.5rem',
          color: colors.textMuted
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
                backgroundColor: colors.cardBackground,
                border: `1px solid ${colors.border}`,
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
                  color: colors.textMuted,
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
                  fontSize: '0.875rem',
                  color: colors.textPrimary
                }}>
                  <span>Progress</span>
                  <span style={{ fontWeight: '600' }}>{project.progress}%</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: colors.progressBackground,
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

              {(project.categories || project.project_tags?.length > 0) && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  {project.categories && (
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      backgroundColor: project.categories.color + '20',
                      color: project.categories.color,
                      border: `1px solid ${project.categories.color}`
                    }}>
                      {project.categories.name}
                    </span>
                  )}
                  {project.project_tags?.map(pt => pt.tags && (
                    <span
                      key={pt.tag_id}
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        backgroundColor: pt.tags.color + '20',
                        color: pt.tags.color,
                        border: `1px solid ${pt.tags.color}`
                      }}
                    >
                      {pt.tags.name}
                    </span>
                  ))}
                </div>
              )}

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.875rem',
                color: colors.textMuted,
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
                    backgroundColor: colors.secondaryButtonBackground,
                    color: colors.textPrimary,
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
                    backgroundColor: colors.dangerButtonBackground,
                    color: colors.dangerButtonText,
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
