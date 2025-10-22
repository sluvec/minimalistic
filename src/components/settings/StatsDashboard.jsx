import { useState, useEffect, memo } from 'react'
import PropTypes from 'prop-types'
import { supabase } from '../../lib/supabaseClient'
import './StatsDashboard.css'

/**
 * StatsDashboard Component
 * Displays user statistics in a card-based layout
 * Demonstrates:
 * - React.memo for performance optimization
 * - PropTypes validation
 * - Error handling
 * - Loading states
 */
const StatsDashboard = memo(function StatsDashboard({ refreshTrigger }) {
  const [stats, setStats] = useState({
    totalNotes: 0,
    taskNotes: 0,
    ideaNotes: 0,
    regularNotes: 0,
    totalProjects: 0,
    totalSpaces: 0,
    totalCategories: 0,
    totalTags: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStats()
  }, [refreshTrigger])

  const fetchStats = async () => {
    setLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError('Not authenticated')
        return
      }

      const [notesResult, projectsResult, spacesResult, categoriesResult, tagsResult] =
        await Promise.all([
          supabase.from('notes').select('type', { count: 'exact' }).eq('user_id', user.id),
          supabase
            .from('projects')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id),
          supabase
            .from('spaces')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('archived', false),
          supabase
            .from('categories')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('archived', false),
          supabase
            .from('tags')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('archived', false),
        ])

      const notes = notesResult.data || []
      const taskNotes = notes.filter((n) => n.type === 'task').length
      const ideaNotes = notes.filter((n) => n.type === 'idea').length
      const regularNotes = notes.filter((n) => !n.type || n.type === 'note').length

      setStats({
        totalNotes: notesResult.count || 0,
        taskNotes,
        ideaNotes,
        regularNotes,
        totalProjects: projectsResult.count || 0,
        totalSpaces: spacesResult.count || 0,
        totalCategories: categoriesResult.count || 0,
        totalTags: tagsResult.count || 0,
      })
    } catch (err) {
      console.error('Error fetching stats:', err)
      setError('Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="stats-loading">Loading statistics...</div>
  }

  if (error) {
    return <div className="stats-error">{error}</div>
  }

  const statCards = [
    {
      title: 'Total Notes',
      value: stats.totalNotes,
      icon: '📝',
      color: '#6366f1',
      subtitle: 'All your notes',
    },
    {
      title: 'Tasks',
      value: stats.taskNotes,
      icon: '✅',
      color: '#10b981',
      subtitle: 'Task notes',
    },
    {
      title: 'Ideas',
      value: stats.ideaNotes,
      icon: '💡',
      color: '#f59e0b',
      subtitle: 'Idea notes',
    },
    {
      title: 'Regular Notes',
      value: stats.regularNotes,
      icon: '📄',
      color: '#8b5cf6',
      subtitle: 'Standard notes',
    },
    {
      title: 'Projects',
      value: stats.totalProjects,
      icon: '📁',
      color: '#3b82f6',
      subtitle: 'Active projects',
    },
    {
      title: 'Spaces',
      value: stats.totalSpaces,
      icon: '🏠',
      color: '#ec4899',
      subtitle: 'Workspaces',
    },
    {
      title: 'Categories',
      value: stats.totalCategories,
      icon: '🏷️',
      color: '#14b8a6',
      subtitle: 'Note categories',
    },
    {
      title: 'Tags',
      value: stats.totalTags,
      icon: '🔖',
      color: '#f43f5e',
      subtitle: 'Available tags',
    },
  ]

  return (
    <div className="stats-dashboard">
      <div className="stats-header">
        <h3>Your Statistics</h3>
        <button onClick={fetchStats} className="btn-refresh" title="Refresh statistics">
          🔄
        </button>
      </div>

      <div className="stats-grid">
        {statCards.map((card) => (
          <div key={card.title} className="stat-card" style={{ borderLeftColor: card.color }}>
            <div className="stat-icon" style={{ backgroundColor: `${card.color}20` }}>
              {card.icon}
            </div>
            <div className="stat-content">
              <h4 className="stat-value">{card.value}</h4>
              <p className="stat-title">{card.title}</p>
              <p className="stat-subtitle">{card.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})

StatsDashboard.propTypes = {
  refreshTrigger: PropTypes.number,
}

StatsDashboard.defaultProps = {
  refreshTrigger: 0,
}

export default StatsDashboard
