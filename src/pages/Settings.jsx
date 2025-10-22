import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

function Settings() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [exportFormat, setExportFormat] = useState('json')
  const [stats, setStats] = useState({ notes: 0, projects: 0 })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [notesResult, projectsResult] = await Promise.all([
        supabase.from('notes').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id', { count: 'exact', head: true })
      ])

      setStats({
        notes: notesResult.count || 0,
        projects: projectsResult.count || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchAllData = async () => {
    try {
      const [notesResult, projectsResult] = await Promise.all([
        supabase
          .from('notes')
          .select('*, projects(id, name, color)')
          .order('created_at', { ascending: false }),
        supabase
          .from('projects')
          .select('*')
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

    // CSV for notes
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
      const data = await fetchAllData()

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

  return (
    <div className="settings" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem', fontWeight: '600' }}>Settings</h1>

      {/* Data Export Section */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '0.5rem',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '600' }}>
          📤 Export Data
        </h2>

        <p style={{ marginBottom: '1.5rem', color: '#4a5568', lineHeight: '1.6' }}>
          Export all your notes and projects to a file. Choose your preferred format below.
        </p>

        {/* Stats */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem',
          padding: '1rem',
          backgroundColor: '#f7fafc',
          borderRadius: '0.375rem'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.25rem' }}>
              Total Notes
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#2d3748' }}>
              {stats.notes}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.25rem' }}>
              Total Projects
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#2d3748' }}>
              {stats.projects}
            </div>
          </div>
        </div>

        {/* Format Selection */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Export Format
          </label>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e2e8f0',
              borderRadius: '0.375rem',
              fontSize: '1rem',
              backgroundColor: 'white'
            }}
          >
            <option value="json">JSON - Machine-readable format</option>
            <option value="csv">CSV - Spreadsheet format (Excel, Google Sheets)</option>
            <option value="text">Text - Plain text format</option>
            <option value="markdown">Markdown - Formatted text with headings</option>
          </select>
        </div>

        {/* Format Description */}
        <div style={{
          padding: '1rem',
          backgroundColor: '#edf2f7',
          borderRadius: '0.375rem',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
          color: '#4a5568'
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

        {/* Messages */}
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

        {success && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#c6f6d5',
            color: '#22543d',
            borderRadius: '0.375rem',
            marginBottom: '1rem'
          }}>
            {success}
          </div>
        )}

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem 1.5rem',
            backgroundColor: loading ? '#cbd5e0' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#2563eb'
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#3b82f6'
          }}
        >
          {loading ? 'Exporting...' : `Export as ${exportFormat.toUpperCase()}`}
        </button>
      </div>

      {/* Additional Settings Sections (Future) */}
      <div style={{
        backgroundColor: '#f7fafc',
        borderRadius: '0.5rem',
        padding: '2rem',
        textAlign: 'center',
        color: '#718096'
      }}>
        <p>More settings options coming soon...</p>
      </div>
    </div>
  )
}

export default Settings
