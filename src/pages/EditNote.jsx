import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function EditNote() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [type, setType] = useState('')
  const [tags, setTags] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [url, setUrl] = useState('')
  const [priority, setPriority] = useState('')
  const [importance, setImportance] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchNote()
  }, [id])

  const fetchNote = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      
      if (data) {
        setTitle(data.title)
        setContent(data.content)
        setCategory(data.category || '')
        setType(data.type || '')
        setDueDate(data.due_date || '')
        setUrl(data.url || '')
        setPriority(data.priority || '')
        setImportance(data.importance || '')
        setTags(data.tags ? data.tags.join(', ') : '')
      }
    } catch (error) {
      setError('Error loading note')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!content.trim()) {
      setError('Content is required')
      return
    }
    
    try {
      setSaving(true)
      setError(null)
      
      // Process tags if any (convert comma-separated list to array)
      const processedTags = tags.trim() ? tags.split(',').map(tag => tag.trim()) : null
      
      const { error } = await supabase
        .from('notes')
        .update({
          title,
          content,
          category: category || null,
          type: type || null,
          tags: processedTags,
          due_date: dueDate || null,
          url: url || null,
          priority: priority || null,
          importance: importance || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
      
      if (error) throw error
      
      navigate('/')
    } catch (error) {
      setError('Error updating note')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading note...</div>
  }

  return (
    <div>
      <h2>Edit Note</h2>
      {error && <div className="error">{error}</div>}
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="title">Title (optional)</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="content">Content *</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="8"
              required
            />
          </div>
          
          <div>
            <label htmlFor="category">Category (Optional)</label>
            <input
              id="category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Work, Personal, Ideas"
            />
          </div>
          
          <div>
            <label htmlFor="type">Type (Optional)</label>
            <input
              id="type"
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="e.g. Task, Reference, Meeting Notes"
            />
          </div>
          
          <div>
            <label htmlFor="dueDate">Due Date (Optional)</label>
            <input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="url">URL (Optional)</label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          
          <div>
            <label htmlFor="priority">Priority (Optional)</label>
            <input
              id="priority"
              type="text"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              placeholder="e.g. High, Medium, Low"
            />
          </div>
          
          <div>
            <label htmlFor="importance">Importance (Optional)</label>
            <input
              id="importance"
              type="text"
              value={importance}
              onChange={(e) => setImportance(e.target.value)}
              placeholder="e.g. Critical, Major, Minor"
            />
          </div>
          
          <div>
            <label htmlFor="tags">Tags (Optional, comma-separated)</label>
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. important, todo, follow-up"
            />
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button 
              type="submit" 
              className="btn" 
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Update Note'}
            </button>
            
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditNote
