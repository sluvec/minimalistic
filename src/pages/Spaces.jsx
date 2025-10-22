import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'
import { useDarkModeColors } from '../hooks/useDarkModeColors'

function Spaces() {
  const colors = useDarkModeColors()
  const [spaces, setSpaces] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [editingSpace, setEditingSpace] = useState(null)
  const [showSpaceForm, setShowSpaceForm] = useState(false)
  const [spaceForm, setSpaceForm] = useState({
    name: '',
    description: '',
    color: '#6366f1',
    icon: '📁'
  })

  useEffect(() => {
    fetchSpaces()
  }, [])

  useEffect(() => {
    if (success) {
      toast.success(success)
      const timer = setTimeout(() => setSuccess(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      toast.error(error)
      const timer = setTimeout(() => setError(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const fetchSpaces = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('spaces')
        .select(`
          *,
          projects:projects(count),
          notes:notes(count)
        `)
        .eq('user_id', user.id)
        .eq('archived', false)
        .order('created_at', { ascending: false })

      if (error) throw error

      const spacesWithCounts = data.map(space => ({
        ...space,
        projectCount: space.projects?.[0]?.count || 0,
        noteCount: space.notes?.[0]?.count || 0
      }))

      setSpaces(spacesWithCounts)
    } catch (err) {
      console.error('Error fetching spaces:', err)
      setError('Failed to load spaces')
    } finally {
      setLoading(false)
    }
  }

  const handleSpaceSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (editingSpace) {
        const { error } = await supabase
          .from('spaces')
          .update({ ...spaceForm, updated_at: new Date().toISOString() })
          .eq('id', editingSpace.id)
          .eq('user_id', user.id)

        if (error) throw error
        setSuccess('Space updated successfully')
      } else {
        const { error } = await supabase
          .from('spaces')
          .insert([{ ...spaceForm, user_id: user.id }])

        if (error) throw error
        setSuccess('Space created successfully')
      }

      setSpaceForm({ name: '', description: '', color: '#6366f1', icon: '📁' })
      setEditingSpace(null)
      setShowSpaceForm(false)
      fetchSpaces()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSpaceDelete = async (id) => {
    if (!window.confirm('Are you sure you want to archive this space? Projects and notes will remain but will be unlinked from this space.')) {
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('spaces')
        .update({ archived: true })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      setSuccess('Space archived successfully')
      fetchSpaces()
    } catch (err) {
      setError(err.message)
    }
  }

  const styles = {
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: '0.5rem',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    button: {
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      border: 'none',
      fontWeight: '500',
      cursor: 'pointer',
      fontSize: '0.875rem',
      transition: 'all 0.2s'
    },
    buttonPrimary: {
      backgroundColor: colors.primary,
      color: 'white'
    },
    buttonDanger: {
      backgroundColor: colors.danger,
      color: 'white'
    },
    buttonSecondary: {
      backgroundColor: colors.secondaryButtonBackground,
      color: colors.textSecondary
    },
    input: {
      width: '100%',
      padding: '0.5rem',
      borderRadius: '0.375rem',
      border: `1px solid ${colors.border}`,
      fontSize: '0.875rem',
      backgroundColor: colors.inputBackground,
      color: colors.textPrimary
    },
    textarea: {
      width: '100%',
      padding: '0.5rem',
      borderRadius: '0.375rem',
      border: `1px solid ${colors.border}`,
      fontSize: '0.875rem',
      minHeight: '80px',
      resize: 'vertical',
      backgroundColor: colors.inputBackground,
      color: colors.textPrimary
    },
    label: {
      display: 'block',
      marginBottom: '1rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: colors.textSecondary
    },
    colorPicker: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    colorInput: {
      width: '50px',
      height: '40px',
      border: `1px solid ${colors.border}`,
      borderRadius: '0.375rem',
      cursor: 'pointer'
    },
    listItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: '1rem',
      borderBottom: `1px solid ${colors.border}`
    },
    badge: (color) => ({
      backgroundColor: color + '20',
      color: color,
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '500'
    }),
    emptyState: {
      textAlign: 'center',
      padding: '3rem 1rem',
      color: colors.textMuted
    }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '600', color: colors.textPrimary }}>Spaces Management</h1>
        <button
          onClick={() => {
            setShowSpaceForm(!showSpaceForm)
            setEditingSpace(null)
            setSpaceForm({ name: '', description: '', color: '#6366f1', icon: '📁' })
          }}
          style={{ ...styles.button, ...styles.buttonPrimary }}
        >
          {showSpaceForm ? 'Cancel' : '+ New Space'}
        </button>
      </div>

      {showSpaceForm && (
        <div style={styles.card}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600', color: colors.textPrimary }}>
            {editingSpace ? 'Edit Space' : 'Create New Space'}
          </h3>
          <form onSubmit={handleSpaceSubmit}>
            <label style={styles.label}>
              Name *
              <input
                type="text"
                value={spaceForm.name}
                onChange={(e) => setSpaceForm({ ...spaceForm, name: e.target.value })}
                style={styles.input}
                required
                placeholder="e.g., Work, Personal, Projects"
              />
            </label>

            <label style={styles.label}>
              Description
              <textarea
                value={spaceForm.description}
                onChange={(e) => setSpaceForm({ ...spaceForm, description: e.target.value })}
                style={styles.textarea}
                placeholder="Brief description of this space..."
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <label style={styles.label}>
                Icon
                <input
                  type="text"
                  value={spaceForm.icon}
                  onChange={(e) => setSpaceForm({ ...spaceForm, icon: e.target.value })}
                  style={styles.input}
                  placeholder="📁"
                  maxLength={2}
                />
              </label>

              <label style={styles.label}>
                Color
                <div style={styles.colorPicker}>
                  <input
                    type="color"
                    value={spaceForm.color}
                    onChange={(e) => setSpaceForm({ ...spaceForm, color: e.target.value })}
                    style={styles.colorInput}
                  />
                  <span style={{ color: colors.textPrimary }}>{spaceForm.color}</span>
                </div>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button type="submit" style={{ ...styles.button, ...styles.buttonPrimary }} disabled={loading}>
                {editingSpace ? 'Update Space' : 'Create Space'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSpaceForm(false)
                  setEditingSpace(null)
                  setSpaceForm({ name: '', description: '', color: '#6366f1', icon: '📁' })
                }}
                style={{ ...styles.button, ...styles.buttonSecondary }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={styles.card}>
        {loading ? (
          <div style={styles.emptyState}>
            <p>Loading spaces...</p>
          </div>
        ) : spaces.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No spaces yet. Create your first space to organize your projects and notes.</p>
          </div>
        ) : (
          spaces.map(space => (
            <div key={space.id} style={styles.listItem}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{space.icon}</span>
                  <span style={{ fontWeight: '600', fontSize: '1.125rem', color: colors.textPrimary }}>{space.name}</span>
                  <span style={styles.badge(space.color)}>{space.projectCount} projects</span>
                  <span style={styles.badge(space.color)}>{space.noteCount} notes</span>
                </div>
                {space.description && (
                  <p style={{ color: colors.textMuted, fontSize: '0.875rem', marginLeft: '2rem' }}>
                    {space.description}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    setEditingSpace(space)
                    setSpaceForm({
                      name: space.name,
                      description: space.description || '',
                      color: space.color,
                      icon: space.icon
                    })
                    setShowSpaceForm(true)
                  }}
                  style={{ ...styles.button, ...styles.buttonSecondary }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleSpaceDelete(space.id)}
                  style={{ ...styles.button, ...styles.buttonDanger }}
                >
                  Archive
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Spaces
