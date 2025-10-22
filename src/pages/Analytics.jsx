import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useDarkModeColors } from '../hooks/useDarkModeColors'

function Analytics() {
  const colors = useDarkModeColors()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    projects: [],
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalNotes: 0,
    totalIdeas: 0,
    totalLists: 0
  })

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)

      // Fetch projects with their notes
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          notes (
            id,
            isTask,
            isIdea,
            isList,
            status
          )
        `)
        .eq('archived', false)
        .order('created_at', { ascending: false })

      if (projectsError) throw projectsError

      // Fetch all notes
      const { data: allNotes, error: notesError } = await supabase
        .from('notes')
        .select('id, isTask, isIdea, isList, status')
        .eq('archived', false)

      if (notesError) throw notesError

      // Calculate statistics
      const totalTasks = allNotes.filter(n => n.isTask).length
      const completedTasks = allNotes.filter(n => n.isTask && n.status === 'Done').length
      const totalIdeas = allNotes.filter(n => n.isIdea).length
      const totalLists = allNotes.filter(n => n.isList).length

      // Add computed stats to each project
      const projectsWithStats = projects.map(project => {
        const projectNotes = project.notes || []
        const projectTasks = projectNotes.filter(n => n.isTask)
        const completedProjectTasks = projectTasks.filter(n => n.status === 'Done')

        return {
          ...project,
          totalItems: projectNotes.length,
          totalTasks: projectTasks.length,
          completedTasks: completedProjectTasks.length,
          completionRate: projectTasks.length > 0
            ? Math.round((completedProjectTasks.length / projectTasks.length) * 100)
            : 0
        }
      })

      setStats({
        projects: projectsWithStats,
        totalProjects: projects.length,
        totalTasks,
        completedTasks,
        totalNotes: allNotes.length,
        totalIdeas,
        totalLists
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDeadlineStatus = (deadline) => {
    if (!deadline) return null
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const daysUntil = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24))

    if (daysUntil < 0) return { text: 'Overdue', color: '#f56565' }
    if (daysUntil === 0) return { text: 'Today', color: '#ed8936' }
    if (daysUntil <= 7) return { text: `${daysUntil} days left`, color: '#ecc94b' }
    return { text: `${daysUntil} days left`, color: '#48bb78' }
  }

  if (loading) {
    return <div style={{ padding: '2rem', color: colors.textPrimary }}>Loading analytics...</div>
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', color: colors.textPrimary }}>Analytics & Statistics</h1>

      {/* Overview Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '3rem'
      }}>
        <div style={{
          backgroundColor: colors.cardBackground,
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: `1px solid ${colors.border}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
            {stats.totalProjects}
          </div>
          <div style={{ color: colors.textMuted, marginTop: '0.5rem' }}>Total Projects</div>
        </div>

        <div style={{
          backgroundColor: colors.cardBackground,
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: `1px solid ${colors.border}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#48bb78' }}>
            {stats.totalNotes}
          </div>
          <div style={{ color: colors.textMuted, marginTop: '0.5rem' }}>Total Items</div>
        </div>

        <div style={{
          backgroundColor: colors.cardBackground,
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: `1px solid ${colors.border}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ed8936' }}>
            {stats.completedTasks}/{stats.totalTasks}
          </div>
          <div style={{ color: colors.textMuted, marginTop: '0.5rem' }}>Tasks Completed</div>
        </div>

        <div style={{
          backgroundColor: colors.cardBackground,
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: `1px solid ${colors.border}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#9f7aea' }}>
            {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
          </div>
          <div style={{ color: colors.textMuted, marginTop: '0.5rem' }}>Completion Rate</div>
        </div>
      </div>

      {/* Additional Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '3rem'
      }}>
        <div style={{
          backgroundColor: colors.cardBackground,
          padding: '1rem',
          borderRadius: '0.375rem',
          textAlign: 'center',
          border: `1px solid ${colors.border}`
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '600', color: colors.textPrimary }}>{stats.totalIdeas}</div>
          <div style={{ fontSize: '0.875rem', color: colors.textMuted }}>Ideas</div>
        </div>

        <div style={{
          backgroundColor: colors.cardBackground,
          padding: '1rem',
          borderRadius: '0.375rem',
          textAlign: 'center',
          border: `1px solid ${colors.border}`
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '600', color: colors.textPrimary }}>{stats.totalLists}</div>
          <div style={{ fontSize: '0.875rem', color: colors.textMuted }}>Lists</div>
        </div>

        <div style={{
          backgroundColor: colors.cardBackground,
          padding: '1rem',
          borderRadius: '0.375rem',
          textAlign: 'center',
          border: `1px solid ${colors.border}`
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '600', color: colors.textPrimary }}>{stats.totalTasks}</div>
          <div style={{ fontSize: '0.875rem', color: colors.textMuted }}>Total Tasks</div>
        </div>
      </div>

      {/* Projects Detailed Table */}
      <div style={{
        backgroundColor: colors.cardBackground,
        borderRadius: '0.5rem',
        border: `1px solid ${colors.border}`,
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: `1px solid ${colors.border}`,
          backgroundColor: colors.background
        }}>
          <h2 style={{ margin: 0, color: colors.textPrimary }}>Projects Overview</h2>
        </div>

        {stats.projects.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: colors.textMuted }}>
            No projects to display. Create your first project to see analytics!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: colors.background }}>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: `1px solid ${colors.border}`, color: colors.textPrimary }}>
                    Project
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', borderBottom: `1px solid ${colors.border}`, color: colors.textPrimary }}>
                    Progress
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', borderBottom: `1px solid ${colors.border}`, color: colors.textPrimary }}>
                    Total Items
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', borderBottom: `1px solid ${colors.border}`, color: colors.textPrimary }}>
                    Tasks
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', borderBottom: `1px solid ${colors.border}`, color: colors.textPrimary }}>
                    Completed
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', borderBottom: `1px solid ${colors.border}`, color: colors.textPrimary }}>
                    Completion
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', borderBottom: `1px solid ${colors.border}`, color: colors.textPrimary }}>
                    Deadline
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', borderBottom: `1px solid ${colors.border}`, color: colors.textPrimary }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.projects.map(project => {
                  const deadlineStatus = getDeadlineStatus(project.deadline)
                  return (
                    <tr key={project.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                      <td style={{ padding: '1rem', color: colors.textPrimary }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: project.color
                          }}></div>
                          <span style={{ fontWeight: '500', color: colors.textPrimary }}>{project.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', color: colors.textPrimary }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                          <div style={{
                            width: '100px',
                            height: '8px',
                            backgroundColor: colors.progressBackground,
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${project.progress}%`,
                              height: '100%',
                              backgroundColor: project.color
                            }}></div>
                          </div>
                          <span style={{ fontSize: '0.875rem', fontWeight: '600', color: colors.textPrimary }}>
                            {project.progress}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', color: colors.textPrimary }}>
                        {project.totalItems}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', color: colors.textPrimary }}>
                        {project.totalTasks}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', color: colors.textPrimary }}>
                        {project.completedTasks}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          backgroundColor: project.completionRate === 100 ? '#c6f6d5' : '#fed7d7',
                          color: project.completionRate === 100 ? '#22543d' : '#742a2a'
                        }}>
                          {project.completionRate}%
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        {deadlineStatus ? (
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.875rem',
                            backgroundColor: deadlineStatus.color + '20',
                            color: deadlineStatus.color,
                            fontWeight: '500'
                          }}>
                            {deadlineStatus.text}
                          </span>
                        ) : (
                          <span style={{ color: colors.textMuted }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <button
                          onClick={() => navigate(`/project/${project.id}`)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: colors.secondaryButtonBackground,
                            color: colors.textPrimary,
                            border: 'none',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Analytics
