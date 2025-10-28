import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useDarkModeColors } from '../hooks/useDarkModeColors'

function Settings() {
  const colors = useDarkModeColors()
  // State for active tab
  const [activeTab, setActiveTab] = useState('stats')

  // State for loading and messages
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // State for statistics
  const [stats, setStats] = useState({
    totalNotes: 0,
    taskNotes: 0,
    ideaNotes: 0,
    regularNotes: 0,
    totalProjects: 0,
    totalSpaces: 0,
    totalCategories: 0,
    totalTags: 0
  })

  // State for entities
  const [spaces, setSpaces] = useState([])
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [projects, setProjects] = useState([])

  // State for forms
  const [editingSpace, setEditingSpace] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)
  const [editingTag, setEditingTag] = useState(null)
  const [editingProject, setEditingProject] = useState(null)
  const [showSpaceForm, setShowSpaceForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showTagForm, setShowTagForm] = useState(false)
  const [showProjectForm, setShowProjectForm] = useState(false)

  // State for export
  const [exportFormat, setExportFormat] = useState('json')

  // Form data
  const [spaceForm, setSpaceForm] = useState({ name: '', description: '', color: '#6366f1', icon: '📁' })
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', color: '#10b981' })
  const [tagForm, setTagForm] = useState({ name: '', color: '#8b5cf6' })
  const [projectForm, setProjectForm] = useState({ name: '', description: '', color: '#3b82f6', space_id: '' })

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchStats(),
        fetchSpaces(),
        fetchCategories(),
        fetchTags(),
        fetchProjects()
      ])
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [notesResult, projectsResult, spacesResult, categoriesResult, tagsResult] = await Promise.all([
        supabase.from('notes').select('type', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('projects').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('spaces').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('archived', false),
        supabase.from('categories').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('archived', false),
        supabase.from('tags').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('archived', false)
      ])

      const notes = notesResult.data || []
      const taskNotes = notes.filter(n => n.type === 'task').length
      const ideaNotes = notes.filter(n => n.type === 'idea').length
      const regularNotes = notes.filter(n => !n.type || n.type === 'note').length

      setStats({
        totalNotes: notesResult.count || 0,
        taskNotes,
        ideaNotes,
        regularNotes,
        totalProjects: projectsResult.count || 0,
        totalSpaces: spacesResult.count || 0,
        totalCategories: categoriesResult.count || 0,
        totalTags: tagsResult.count || 0
      })
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  const fetchSpaces = async () => {
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

      // Process the counts
      const spacesWithCounts = data.map(space => ({
        ...space,
        projectCount: space.projects?.[0]?.count || 0,
        noteCount: space.notes?.[0]?.count || 0
      }))

      setSpaces(spacesWithCounts)
    } catch (err) {
      console.error('Error fetching spaces:', err)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('archived', false)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Get note counts for each category
      const categoriesWithCounts = await Promise.all(
        (data || []).map(async (category) => {
          const { count } = await supabase
            .from('notes')
            .select('id', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .eq('user_id', user.id)

          return { ...category, noteCount: count || 0 }
        })
      )

      setCategories(categoriesWithCounts)
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const fetchTags = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', user.id)
        .eq('archived', false)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Get note counts for each tag
      const tagsWithCounts = await Promise.all(
        (data || []).map(async (tag) => {
          const { count } = await supabase
            .from('note_tags')
            .select('note_id', { count: 'exact', head: true })
            .eq('tag_id', tag.id)

          return { ...tag, noteCount: count || 0 }
        })
      )

      setTags(tagsWithCounts)
    } catch (err) {
      console.error('Error fetching tags:', err)
    }
  }

  const fetchProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('projects')
        .select('*, spaces(name)')
        .eq('user_id', user.id)
        .eq('archived', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (err) {
      console.error('Error fetching projects:', err)
    }
  }

  // Space CRUD operations
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
      fetchStats()
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
      fetchStats()
    } catch (err) {
      setError(err.message)
    }
  }

  // Category CRUD operations
  const handleCategorySubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update({ ...categoryForm, updated_at: new Date().toISOString() })
          .eq('id', editingCategory.id)
          .eq('user_id', user.id)

        if (error) throw error
        setSuccess('Category updated successfully')
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([{ ...categoryForm, user_id: user.id }])

        if (error) throw error
        setSuccess('Category created successfully')
      }

      setCategoryForm({ name: '', description: '', color: '#10b981' })
      setEditingCategory(null)
      setShowCategoryForm(false)
      fetchCategories()
      fetchStats()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryDelete = async (id) => {
    if (!window.confirm('Are you sure you want to archive this category? Notes using this category will have their category cleared.')) {
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('categories')
        .update({ archived: true })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      setSuccess('Category archived successfully')
      fetchCategories()
      fetchStats()
    } catch (err) {
      setError(err.message)
    }
  }

  // Tag CRUD operations
  const handleTagSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (editingTag) {
        const { error } = await supabase
          .from('tags')
          .update({ ...tagForm, updated_at: new Date().toISOString() })
          .eq('id', editingTag.id)
          .eq('user_id', user.id)

        if (error) throw error
        setSuccess('Tag updated successfully')
      } else {
        const { error } = await supabase
          .from('tags')
          .insert([{ ...tagForm, user_id: user.id }])

        if (error) throw error
        setSuccess('Tag created successfully')
      }

      setTagForm({ name: '', color: '#8b5cf6' })
      setEditingTag(null)
      setShowTagForm(false)
      fetchTags()
      fetchStats()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTagDelete = async (id) => {
    if (!window.confirm('Are you sure you want to archive this tag? It will be removed from all notes.')) {
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('tags')
        .update({ archived: true })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      setSuccess('Tag archived successfully')
      fetchTags()
      fetchStats()
    } catch (err) {
      setError(err.message)
    }
  }

  // Project CRUD operations
  const handleProjectSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const projectData = {
        ...projectForm,
        space_id: projectForm.space_id || null
      }

      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update({ ...projectData, updated_at: new Date().toISOString() })
          .eq('id', editingProject.id)
          .eq('user_id', user.id)

        if (error) throw error
        setSuccess('Project updated successfully')
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([{ ...projectData, user_id: user.id }])

        if (error) throw error
        setSuccess('Project created successfully')
      }

      setProjectForm({ name: '', description: '', color: '#3b82f6', space_id: '' })
      setEditingProject(null)
      setShowProjectForm(false)
      fetchProjects()
      fetchStats()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleProjectDelete = async (id) => {
    if (!window.confirm('Are you sure you want to archive this project? Notes in this project will remain but will be unlinked.')) {
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('projects')
        .update({ archived: true })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      setSuccess('Project archived successfully')
      fetchProjects()
      fetchStats()
    } catch (err) {
      setError(err.message)
    }
  }

  // Export functionality
  const fetchExportData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const [notesResult, projectsResult] = await Promise.all([
        supabase
          .from('notes')
          .select('*, projects(id, name, color)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ])

      if (notesResult.error) throw notesResult.error
      if (projectsResult.error) throw projectsResult.error

      return {
        notes: notesResult.data || [],
        projects: projectsResult.data || []
      }
    } catch (error) {
      throw error
    }
  }

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportToJSON = (data) => {
    const content = JSON.stringify(data, null, 2)
    const timestamp = new Date().toISOString().split('T')[0]
    downloadFile(content, `minimalistic-notes-export-${timestamp}.json`, 'application/json')
  }

  const exportToCSV = (data) => {
    const { notes, projects } = data
    let csvContent = 'Notes\n'
    csvContent += 'ID,Title,Content,Category,Type,Tags,Status,Priority,Importance,Due Date,Created At,Project Name\n'

    notes.forEach(note => {
      const row = [
        note.id,
        `"${(note.title || '').replace(/"/g, '""')}"`,
        `"${(note.content || '').replace(/"/g, '""')}"`,
        note.category || '',
        note.type || '',
        `"${Array.isArray(note.tags) ? note.tags.join(', ') : ''}"`,
        note.status || '',
        note.priority || '',
        note.importance || '',
        note.due_date || '',
        note.created_at || '',
        note.projects?.name || ''
      ]
      csvContent += row.join(',') + '\n'
    })

    csvContent += '\n\nProjects\n'
    csvContent += 'ID,Name,Description,Color,Progress,Deadline,Created At\n'

    projects.forEach(project => {
      const row = [
        project.id,
        `"${(project.name || '').replace(/"/g, '""')}"`,
        `"${(project.description || '').replace(/"/g, '""')}"`,
        project.color || '',
        project.progress || 0,
        project.deadline || '',
        project.created_at || ''
      ]
      csvContent += row.join(',') + '\n'
    })

    const timestamp = new Date().toISOString().split('T')[0]
    downloadFile(csvContent, `minimalistic-notes-export-${timestamp}.csv`, 'text/csv')
  }

  const exportToText = (data) => {
    const { notes, projects } = data
    let textContent = '='.repeat(80) + '\n'
    textContent += 'MINIMALISTIC NOTES EXPORT\n'
    textContent += `Export Date: ${new Date().toLocaleString()}\n`
    textContent += '='.repeat(80) + '\n\n'

    textContent += `PROJECTS (${projects.length})\n`
    textContent += '='.repeat(80) + '\n\n'

    projects.forEach((project, index) => {
      textContent += `${index + 1}. ${project.name}\n`
      if (project.description) textContent += `   Description: ${project.description}\n`
      textContent += `   Progress: ${project.progress}%\n`
      if (project.deadline) textContent += `   Deadline: ${project.deadline}\n`
      textContent += `   Created: ${new Date(project.created_at).toLocaleString()}\n`
      textContent += '\n'
    })

    textContent += '\n' + '='.repeat(80) + '\n'
    textContent += `NOTES (${notes.length})\n`
    textContent += '='.repeat(80) + '\n\n'

    notes.forEach((note, index) => {
      textContent += `${index + 1}. ${note.title || '(No Title)'}\n`
      textContent += '-'.repeat(80) + '\n'
      textContent += `${note.content}\n\n`

      if (note.projects) textContent += `Project: ${note.projects.name}\n`
      if (note.category) textContent += `Category: ${note.category}\n`
      if (note.type) textContent += `Type: ${note.type}\n`
      if (note.tags && note.tags.length > 0) textContent += `Tags: ${note.tags.join(', ')}\n`
      if (note.status) textContent += `Status: ${note.status}\n`
      if (note.priority && note.priority !== 'NA') textContent += `Priority: ${note.priority}\n`
      if (note.importance && note.importance !== 'NA') textContent += `Importance: ${note.importance}\n`
      if (note.due_date) textContent += `Due Date: ${note.due_date}\n`

      textContent += `Created: ${new Date(note.created_at).toLocaleString()}\n`
      textContent += '\n'
    })

    const timestamp = new Date().toISOString().split('T')[0]
    downloadFile(textContent, `minimalistic-notes-export-${timestamp}.txt`, 'text/plain')
  }

  const exportToMarkdown = (data) => {
    const { notes, projects } = data
    let mdContent = '# Minimalistic Notes Export\n\n'
    mdContent += `**Export Date:** ${new Date().toLocaleString()}\n\n`
    mdContent += '---\n\n'

    mdContent += `## Projects (${projects.length})\n\n`

    projects.forEach((project) => {
      mdContent += `### ${project.name}\n\n`
      if (project.description) mdContent += `${project.description}\n\n`
      mdContent += `- **Progress:** ${project.progress}%\n`
      if (project.deadline) mdContent += `- **Deadline:** ${project.deadline}\n`
      mdContent += `- **Created:** ${new Date(project.created_at).toLocaleString()}\n\n`
    })

    mdContent += '---\n\n'
    mdContent += `## Notes (${notes.length})\n\n`

    notes.forEach((note) => {
      mdContent += `### ${note.title || '(No Title)'}\n\n`
      mdContent += `${note.content}\n\n`

      mdContent += '**Details:**\n\n'
      if (note.projects) mdContent += `- **Project:** ${note.projects.name}\n`
      if (note.category) mdContent += `- **Category:** ${note.category}\n`
      if (note.type) mdContent += `- **Type:** ${note.type}\n`
      if (note.tags && note.tags.length > 0) mdContent += `- **Tags:** ${note.tags.join(', ')}\n`
      if (note.status) mdContent += `- **Status:** ${note.status}\n`
      if (note.priority && note.priority !== 'NA') mdContent += `- **Priority:** ${note.priority}\n`
      if (note.importance && note.importance !== 'NA') mdContent += `- **Importance:** ${note.importance}\n`
      if (note.due_date) mdContent += `- **Due Date:** ${note.due_date}\n`

      mdContent += `- **Created:** ${new Date(note.created_at).toLocaleString()}\n\n`
      mdContent += '---\n\n'
    })

    const timestamp = new Date().toISOString().split('T')[0]
    downloadFile(mdContent, `minimalistic-notes-export-${timestamp}.md`, 'text/markdown')
  }

  const handleExport = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const data = await fetchExportData()

      switch (exportFormat) {
        case 'json':
          exportToJSON(data)
          break
        case 'csv':
          exportToCSV(data)
          break
        case 'text':
          exportToText(data)
          break
        case 'markdown':
          exportToMarkdown(data)
          break
        default:
          throw new Error('Invalid export format')
      }

      setSuccess(`Successfully exported ${data.notes.length} notes and ${data.projects.length} projects as ${exportFormat.toUpperCase()}`)
    } catch (error) {
      console.error('Export error:', error)
      setError('Failed to export data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Styles
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem'
    },
    header: {
      marginBottom: '2rem'
    },
    title: {
      fontSize: '2rem',
      fontWeight: '600',
      marginBottom: '0.5rem',
      color: colors.textPrimary
    },
    subtitle: {
      color: colors.textMuted,
      fontSize: '1rem'
    },
    tabs: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '2rem',
      borderBottom: `2px solid ${colors.border}`,
      overflowX: 'auto'
    },
    tab: (active) => ({
      padding: '0.75rem 1.5rem',
      backgroundColor: 'transparent',
      border: 'none',
      borderBottom: active ? `2px solid ${colors.primary}` : '2px solid transparent',
      color: active ? colors.primary : colors.textMuted,
      fontWeight: active ? '600' : '500',
      cursor: 'pointer',
      fontSize: '0.95rem',
      transition: 'all 0.2s',
      whiteSpace: 'nowrap'
    }),
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: '0.5rem',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    },
    statCard: (color) => ({
      backgroundColor: colors.cardBackground,
      borderRadius: '0.5rem',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      borderLeft: `4px solid ${color}`
    }),
    statLabel: {
      fontSize: '0.875rem',
      color: colors.textMuted,
      marginBottom: '0.5rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    statValue: {
      fontSize: '2rem',
      fontWeight: '700',
      color: colors.textPrimary
    },
    statSubtext: {
      fontSize: '0.75rem',
      color: colors.textMuted,
      marginTop: '0.25rem'
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
    buttonSuccess: {
      backgroundColor: colors.success,
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
      padding: '0.75rem',
      border: `1px solid ${colors.border}`,
      borderRadius: '0.375rem',
      fontSize: '1rem',
      marginBottom: '1rem',
      backgroundColor: colors.inputBackground,
      color: colors.textPrimary
    },
    textarea: {
      width: '100%',
      padding: '0.75rem',
      border: `1px solid ${colors.border}`,
      borderRadius: '0.375rem',
      fontSize: '1rem',
      marginBottom: '1rem',
      minHeight: '80px',
      fontFamily: 'inherit',
      backgroundColor: colors.inputBackground,
      color: colors.textPrimary
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: '500',
      color: colors.textSecondary,
      fontSize: '0.875rem'
    },
    listItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem',
      borderBottom: `1px solid ${colors.border}`,
      gap: '1rem'
    },
    badge: (color) => ({
      display: 'inline-block',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600',
      backgroundColor: color + '20',
      color: color
    }),
    message: (type) => ({
      padding: '1rem',
      borderRadius: '0.375rem',
      marginBottom: '1rem',
      backgroundColor: type === 'error' ? colors.errorBackground : colors.successBackground,
      color: type === 'error' ? colors.errorText : colors.successText
    }),
    emptyState: {
      textAlign: 'center',
      padding: '3rem',
      color: colors.textMuted
    },
    colorPicker: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    colorInput: {
      width: '60px',
      height: '40px',
      border: `1px solid ${colors.border}`,
      borderRadius: '0.375rem',
      cursor: 'pointer'
    }
  }

  // Render Statistics Dashboard
  const renderStats = () => (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: colors.textPrimary }}>
        Statistics Dashboard
      </h2>

      <div style={styles.statsGrid}>
        <div style={styles.statCard('#3b82f6')}>
          <div style={styles.statLabel}>Total Notes</div>
          <div style={styles.statValue}>{stats.totalNotes}</div>
          <div style={styles.statSubtext}>
            {stats.taskNotes} tasks • {stats.ideaNotes} ideas • {stats.regularNotes} notes
          </div>
        </div>

        <div style={styles.statCard('#10b981')}>
          <div style={styles.statLabel}>Projects</div>
          <div style={styles.statValue}>{stats.totalProjects}</div>
          <div style={styles.statSubtext}>Active projects</div>
        </div>

        <div style={styles.statCard('#6366f1')}>
          <div style={styles.statLabel}>Spaces</div>
          <div style={styles.statValue}>{stats.totalSpaces}</div>
          <div style={styles.statSubtext}>Organizational containers</div>
        </div>

        <div style={styles.statCard('#8b5cf6')}>
          <div style={styles.statLabel}>Categories</div>
          <div style={styles.statValue}>{stats.totalCategories}</div>
          <div style={styles.statSubtext}>Note categories</div>
        </div>

        <div style={styles.statCard('#ec4899')}>
          <div style={styles.statLabel}>Tags</div>
          <div style={styles.statValue}>{stats.totalTags}</div>
          <div style={styles.statSubtext}>Available tags</div>
        </div>
      </div>
    </div>
  )

  // Render Spaces Management
  const renderSpaces = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: colors.textPrimary }}>Spaces Management</h2>
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

{spaces.length === 0 ? (
        <div style={styles.card}>
          <div style={styles.emptyState}>
            <p>No spaces yet. Create your first space to organize your projects and notes.</p>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem'
        }}>
          {spaces.map(space => (
            <div
              key={space.id}
              style={{
                backgroundColor: colors.cardBackground,
                borderRadius: '0.5rem',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: `2px solid ${space.color}20`,
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = space.color
                e.currentTarget.style.boxShadow = `0 4px 12px ${space.color}20`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${space.color}20`
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '2rem' }}>{space.icon}</span>
                  <span style={{ fontWeight: '600', fontSize: '1.25rem', color: colors.textPrimary, flex: 1 }}>
                    {space.name}
                  </span>
                </div>
                {space.description && (
                  <p style={{ color: colors.textMuted, fontSize: '0.875rem', lineHeight: '1.4', marginBottom: '1rem' }}>
                    {space.description}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '0.5rem',
                  backgroundColor: colors.background,
                  borderRadius: '0.375rem'
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600', color: space.color }}>
                    {space.projectCount}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: colors.textMuted, marginTop: '0.25rem' }}>
                    Projects
                  </div>
                </div>
                <div style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '0.5rem',
                  backgroundColor: colors.background,
                  borderRadius: '0.375rem'
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600', color: space.color }}>
                    {space.noteCount}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: colors.textMuted, marginTop: '0.25rem' }}>
                    Notes
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingSpace(space)
                    setSpaceForm({
                      name: space.name,
                      description: space.description || '',
                      color: space.color,
                      icon: space.icon
                    })
                    setShowSpaceForm(true)
                  }}
                  style={{
                    ...styles.button,
                    ...styles.buttonSecondary,
                    flex: 1
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSpaceDelete(space.id)
                  }}
                  style={{
                    ...styles.button,
                    ...styles.buttonDanger,
                    flex: 1
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

  // Render Categories Management
  const renderCategories = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: colors.textPrimary }}>Categories Management</h2>
        <button
          onClick={() => {
            setShowCategoryForm(!showCategoryForm)
            setEditingCategory(null)
            setCategoryForm({ name: '', description: '', color: '#10b981' })
          }}
          style={{ ...styles.button, ...styles.buttonPrimary }}
        >
          {showCategoryForm ? 'Cancel' : '+ New Category'}
        </button>
      </div>

      {showCategoryForm && (
        <div style={styles.card}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600', color: colors.textPrimary }}>
            {editingCategory ? 'Edit Category' : 'Create New Category'}
          </h3>
          <form onSubmit={handleCategorySubmit}>
            <label style={styles.label}>
              Name *
              <input
                type="text"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                style={styles.input}
                required
                placeholder="e.g., Development, Design, Research"
              />
            </label>

            <label style={styles.label}>
              Description
              <textarea
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                style={styles.textarea}
                placeholder="Brief description of this category..."
              />
            </label>

            <label style={styles.label}>
              Color
              <div style={styles.colorPicker}>
                <input
                  type="color"
                  value={categoryForm.color}
                  onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                  style={styles.colorInput}
                />
                <span>{categoryForm.color}</span>
              </div>
            </label>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button type="submit" style={{ ...styles.button, ...styles.buttonPrimary }} disabled={loading}>
                {editingCategory ? 'Update Category' : 'Create Category'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCategoryForm(false)
                  setEditingCategory(null)
                  setCategoryForm({ name: '', description: '', color: '#10b981' })
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
        {categories.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No categories yet. Create your first category to organize your notes.</p>
          </div>
        ) : (
          categories.map(category => (
            <div key={category.id} style={styles.listItem}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '600', fontSize: '1.125rem', color: colors.textPrimary }}>{category.name}</span>
                  <span style={styles.badge(category.color)}>{category.noteCount} notes</span>
                </div>
                {category.description && (
                  <p style={{ color: colors.textMuted, fontSize: '0.875rem' }}>
                    {category.description}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    setEditingCategory(category)
                    setCategoryForm({
                      name: category.name,
                      description: category.description || '',
                      color: category.color
                    })
                    setShowCategoryForm(true)
                  }}
                  style={{ ...styles.button, ...styles.buttonSecondary }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleCategoryDelete(category.id)}
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

  // Render Tags Management
  const renderTags = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: colors.textPrimary }}>Tags Management</h2>
        <button
          onClick={() => {
            setShowTagForm(!showTagForm)
            setEditingTag(null)
            setTagForm({ name: '', color: '#8b5cf6' })
          }}
          style={{ ...styles.button, ...styles.buttonPrimary }}
        >
          {showTagForm ? 'Cancel' : '+ New Tag'}
        </button>
      </div>

      {showTagForm && (
        <div style={styles.card}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600', color: colors.textPrimary }}>
            {editingTag ? 'Edit Tag' : 'Create New Tag'}
          </h3>
          <form onSubmit={handleTagSubmit}>
            <label style={styles.label}>
              Name *
              <input
                type="text"
                value={tagForm.name}
                onChange={(e) => setTagForm({ ...tagForm, name: e.target.value })}
                style={styles.input}
                required
                placeholder="e.g., urgent, review, archived"
              />
            </label>

            <label style={styles.label}>
              Color
              <div style={styles.colorPicker}>
                <input
                  type="color"
                  value={tagForm.color}
                  onChange={(e) => setTagForm({ ...tagForm, color: e.target.value })}
                  style={styles.colorInput}
                />
                <span>{tagForm.color}</span>
              </div>
            </label>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button type="submit" style={{ ...styles.button, ...styles.buttonPrimary }} disabled={loading}>
                {editingTag ? 'Update Tag' : 'Create Tag'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowTagForm(false)
                  setEditingTag(null)
                  setTagForm({ name: '', color: '#8b5cf6' })
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
        {tags.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No tags yet. Create your first tag for flexible note organization.</p>
          </div>
        ) : (
          tags.map(tag => (
            <div key={tag.id} style={styles.listItem}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={styles.badge(tag.color)}>{tag.name}</span>
                  <span style={{ color: colors.textMuted, fontSize: '0.875rem' }}>
                    {tag.noteCount} notes
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    setEditingTag(tag)
                    setTagForm({
                      name: tag.name,
                      color: tag.color
                    })
                    setShowTagForm(true)
                  }}
                  style={{ ...styles.button, ...styles.buttonSecondary }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleTagDelete(tag.id)}
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

  // Render Projects Management
  const renderProjects = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: colors.textPrimary }}>Projects Management</h2>
        <button
          onClick={() => {
            setShowProjectForm(!showProjectForm)
            setEditingProject(null)
            setProjectForm({ name: '', description: '', color: '#3b82f6', space_id: '' })
          }}
          style={{ ...styles.button, ...styles.buttonPrimary }}
        >
          {showProjectForm ? 'Cancel' : '+ New Project'}
        </button>
      </div>

      {showProjectForm && (
        <div style={styles.card}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600', color: colors.textPrimary }}>
            {editingProject ? 'Edit Project' : 'Create New Project'}
          </h3>
          <form onSubmit={handleProjectSubmit}>
            <label style={styles.label}>
              Name *
              <input
                type="text"
                value={projectForm.name}
                onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                style={styles.input}
                required
                placeholder="e.g., Website Redesign"
              />
            </label>

            <label style={styles.label}>
              Description
              <textarea
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                style={styles.textarea}
                placeholder="Brief description of this project..."
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <label style={styles.label}>
                Space (Optional)
                <select
                  value={projectForm.space_id}
                  onChange={(e) => setProjectForm({ ...projectForm, space_id: e.target.value })}
                  style={styles.input}
                >
                  <option value="">No Space</option>
                  {spaces.map(space => (
                    <option key={space.id} value={space.id}>
                      {space.icon} {space.name}
                    </option>
                  ))}
                </select>
              </label>

              <label style={styles.label}>
                Color
                <div style={styles.colorPicker}>
                  <input
                    type="color"
                    value={projectForm.color}
                    onChange={(e) => setProjectForm({ ...projectForm, color: e.target.value })}
                    style={styles.colorInput}
                  />
                  <span style={{ color: colors.textPrimary }}>{projectForm.color}</span>
                </div>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button type="submit" style={{ ...styles.button, ...styles.buttonPrimary }} disabled={loading}>
                {editingProject ? 'Update Project' : 'Create Project'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowProjectForm(false)
                  setEditingProject(null)
                  setProjectForm({ name: '', description: '', color: '#3b82f6', space_id: '' })
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
        {projects.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No projects yet. Create your first project to start organizing your work.</p>
          </div>
        ) : (
          projects.map(project => (
            <div key={project.id} style={styles.listItem}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: project.color
                    }}
                  />
                  <span style={{ fontWeight: '600', fontSize: '1.125rem' }}>{project.name}</span>
                  {project.spaces && (
                    <span style={styles.badge('#6366f1')}>
                      {project.spaces.name}
                    </span>
                  )}
                </div>
                {project.description && (
                  <p style={{ color: '#718096', fontSize: '0.875rem' }}>
                    {project.description}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    setEditingProject(project)
                    setProjectForm({
                      name: project.name,
                      description: project.description || '',
                      color: project.color,
                      space_id: project.space_id || ''
                    })
                    setShowProjectForm(true)
                  }}
                  style={{ ...styles.button, ...styles.buttonSecondary }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleProjectDelete(project.id)}
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

  // Render Export Section
  const renderExport = () => (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: colors.textPrimary }}>
        Data Export
      </h2>

      <div style={styles.card}>
        <p style={{ marginBottom: '1.5rem', color: colors.textSecondary, lineHeight: '1.6' }}>
          Export all your notes and projects to a file. Choose your preferred format below.
        </p>

        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem',
          padding: '1rem',
          backgroundColor: colors.background,
          borderRadius: '0.375rem',
          border: `1px solid ${colors.border}`
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.875rem', color: colors.textMuted, marginBottom: '0.25rem' }}>
              Total Notes
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '600', color: colors.textPrimary }}>
              {stats.totalNotes}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.875rem', color: colors.textMuted, marginBottom: '0.25rem' }}>
              Total Projects
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '600', color: colors.textPrimary }}>
              {stats.totalProjects}
            </div>
          </div>
        </div>

        <label style={styles.label}>
          Export Format
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            style={styles.input}
          >
            <option value="json">JSON - Machine-readable format</option>
            <option value="csv">CSV - Spreadsheet format (Excel, Google Sheets)</option>
            <option value="text">Text - Plain text format</option>
            <option value="markdown">Markdown - Formatted text with headings</option>
          </select>
        </label>

        <div style={{
          padding: '1rem',
          backgroundColor: colors.background,
          border: `1px solid ${colors.border}`,
          borderRadius: '0.375rem',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
          color: colors.textSecondary
        }}>
          {exportFormat === 'json' && (
            <>
              <strong>JSON Format:</strong> Perfect for backup and data migration.
              Contains all data in structured format that can be easily imported into other systems.
            </>
          )}
          {exportFormat === 'csv' && (
            <>
              <strong>CSV Format:</strong> Best for analyzing data in spreadsheet applications
              like Excel or Google Sheets. Notes and projects are exported in separate sections.
            </>
          )}
          {exportFormat === 'text' && (
            <>
              <strong>Text Format:</strong> Simple plain text format that's easy to read
              and can be opened in any text editor. Great for printing or archiving.
            </>
          )}
          {exportFormat === 'markdown' && (
            <>
              <strong>Markdown Format:</strong> Formatted text with headings and structure.
              Can be viewed on GitHub, rendered to HTML, or converted to other formats.
            </>
          )}
        </div>

        <button
          onClick={handleExport}
          disabled={loading}
          style={{
            ...styles.button,
            ...styles.buttonPrimary,
            width: '100%',
            padding: '0.75rem 1.5rem',
            fontSize: '1rem'
          }}
        >
          {loading ? 'Exporting...' : `Export as ${exportFormat.toUpperCase()}`}
        </button>
      </div>
    </div>
  )

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Settings</h1>
        <p style={styles.subtitle}>Manage your spaces, categories, tags, projects, and export data</p>
      </div>

      {/* Messages */}
      {error && <div style={styles.message('error')}>{error}</div>}
      {success && <div style={styles.message('success')}>{success}</div>}

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={styles.tab(activeTab === 'stats')}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
        <button
          style={styles.tab(activeTab === 'spaces')}
          onClick={() => setActiveTab('spaces')}
        >
          Spaces ({stats.totalSpaces})
        </button>
        <button
          style={styles.tab(activeTab === 'categories')}
          onClick={() => setActiveTab('categories')}
        >
          Categories ({stats.totalCategories})
        </button>
        <button
          style={styles.tab(activeTab === 'tags')}
          onClick={() => setActiveTab('tags')}
        >
          Tags ({stats.totalTags})
        </button>
        <button
          style={styles.tab(activeTab === 'projects')}
          onClick={() => setActiveTab('projects')}
        >
          Projects ({stats.totalProjects})
        </button>
        <button
          style={styles.tab(activeTab === 'export')}
          onClick={() => setActiveTab('export')}
        >
          Export
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'stats' && renderStats()}
      {activeTab === 'spaces' && renderSpaces()}
      {activeTab === 'categories' && renderCategories()}
      {activeTab === 'tags' && renderTags()}
      {activeTab === 'projects' && renderProjects()}
      {activeTab === 'export' && renderExport()}
    </div>
  )
}

export default Settings
