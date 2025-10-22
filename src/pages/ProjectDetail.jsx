import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProjectDetails()
  }, [id])

  const fetchProjectDetails = async () => {
    try {
      setLoading(true)

      // Fetch project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

      if (projectError) throw projectError

      // Fetch notes in this project
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .eq('project_id', id)
        .eq('archived', false)
        .order('created_at', { ascending: false })

      if (notesError) throw notesError

      setProject(projectData)
      setNotes(notesData || [])
    } catch (error) {
      console.error('Error fetching project details:', error)
      setError('Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const handleProgressChange = async (newProgress) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          progress: parseInt(newProgress),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      setProject({ ...project, progress: parseInt(newProgress) })
    } catch (error) {
      console.error('Error updating progress:', error)
      setError('Failed to update progress')
    }
  }

  const handleRemoveNote = async (noteId) => {
    if (!window.confirm('Remove this item from the project? The note will not be deleted.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('notes')
        .update({ project_id: null })
        .eq('id', noteId)

      if (error) throw error

      setNotes(notes.filter(n => n.id !== noteId))
    } catch (error) {
      console.error('Error removing note:', error)
      setError('Failed to remove note')
    }
  }

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'done': return { bg: '#c6f6d5', color: '#22543d' }
      case 'in progress': return { bg: '#feebc8', color: '#7c2d12' }
      case 'new': return { bg: '#bee3f8', color: '#2c5282' }
      default: return { bg: '#e2e8f0', color: '#4a5568' }
    }
  }

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading project...</div>
  }

  if (error || !project) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ color: '#e53e3e' }}>{error || 'Project not found'}</div>
        <button onClick={() => navigate('/projects')} style={{ marginTop: '1rem' }}>
          Back to Projects
        </button>
      </div>
    )
  }

  const tasks = notes.filter(n => n.isTask)
  const completedTasks = tasks.filter(n => n.status === 'Done')

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => navigate('/projects')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#edf2f7',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            marginBottom: '1rem'
          }}
        >
          ← Back to Projects
        </button>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '2rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: project.color
              }}></div>
              <h1 style={{ margin: 0 }}>{project.name}</h1>
            </div>
            {project.description && (
              <p style={{ color: '#718096', marginTop: '0.5rem' }}>{project.description}</p>
            )}
          </div>

          <button
            onClick={() => navigate(`/projects`)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Edit Project
          </button>
        </div>
      </div>

      {/* Progress Section */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        border: '1px solid #e2e8f0',
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>Project Progress</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: project.color }}>
              {project.progress}%
            </div>
          </div>

          {project.deadline && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', color: '#718096' }}>Deadline</div>
              <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                {new Date(project.deadline).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <input
            type="range"
            value={project.progress}
            onChange={(e) => handleProgressChange(e.target.value)}
            min="0"
            max="100"
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>

        <div style={{
          display: 'flex',
          gap: '2rem',
          fontSize: '0.875rem',
          color: '#718096',
          flexWrap: 'wrap'
        }}>
          <div>
            <span style={{ fontWeight: '600' }}>{notes.length}</span> total items
          </div>
          <div>
            <span style={{ fontWeight: '600' }}>{tasks.length}</span> tasks
          </div>
          <div>
            <span style={{ fontWeight: '600' }}>{completedTasks.length}</span> completed
          </div>
          {tasks.length > 0 && (
            <div>
              <span style={{ fontWeight: '600' }}>
                {Math.round((completedTasks.length / tasks.length) * 100)}%
              </span> task completion
            </div>
          )}
        </div>
      </div>

      {/* Notes List */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h2>Project Items ({notes.length})</h2>
          <Link
            to={`/create?project=${id}`}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#48bb78',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              textDecoration: 'none',
              fontWeight: '500'
            }}
          >
            + Add Item
          </Link>
        </div>

        {notes.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: '#f7fafc',
            borderRadius: '0.5rem',
            color: '#718096'
          }}>
            <p>No items in this project yet.</p>
            <p>Add notes, tasks, or ideas to get started!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notes.map(note => {
              const statusColors = getStatusBadgeColor(note.status)
              return (
                <div
                  key={note.id}
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s'
                  }}
                  onClick={() => navigate(`/edit/${note.id}`)}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      {note.title && (
                        <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>{note.title}</h3>
                      )}
                      <p style={{
                        margin: 0,
                        color: '#4a5568',
                        lineHeight: '1.5',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {note.content.length > 200
                          ? note.content.substring(0, 200) + '...'
                          : note.content
                        }
                      </p>

                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        marginTop: '1rem',
                        alignItems: 'center'
                      }}>
                        {note.status && (
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            backgroundColor: statusColors.bg,
                            color: statusColors.color
                          }}>
                            {note.status}
                          </span>
                        )}

                        {note.isTask && (
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.875rem',
                            backgroundColor: '#bee3f8',
                            color: '#2c5282'
                          }}>
                            Task
                          </span>
                        )}

                        {note.isIdea && (
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.875rem',
                            backgroundColor: '#fef5e7',
                            color: '#975a16'
                          }}>
                            Idea
                          </span>
                        )}

                        {note.isList && (
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.875rem',
                            backgroundColor: '#e9d8fd',
                            color: '#553c9a'
                          }}>
                            List
                          </span>
                        )}

                        {note.priority && note.priority !== 'NA' && (
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.875rem',
                            backgroundColor: '#fed7d7',
                            color: '#742a2a'
                          }}>
                            {note.priority} priority
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                    >
                      <button
                        onClick={() => navigate(`/edit/${note.id}`)}
                        style={{
                          padding: '0.5rem 1rem',
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
                        onClick={() => handleRemoveNote(note.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#fed7d7',
                          border: 'none',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectDetail
