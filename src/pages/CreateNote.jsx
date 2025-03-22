import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function CreateNote() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [type, setType] = useState('')
  const [tags, setTags] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [url, setUrl] = useState('')
  const [priority, setPriority] = useState('')
  const [importance, setImportance] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!content.trim()) {
      setError('Content is required')
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      const user = await supabase.auth.getUser()
      if (!user.data.user) {
        setError('You must be logged in to create a note')
        return
      }
      
      // Process tags if any (convert comma-separated list to array)
      const processedTags = tags.trim() ? tags.split(',').map(tag => tag.trim()) : null
      
      const { error: insertError } = await supabase
        .from('notes')
        .insert({
          title,
          content,
          category: category || null,
          type: type || null,
          tags: processedTags,
          due_date: dueDate || null,
          url: url || null,
          priority: priority || null,
          importance: importance || null,
          user_id: user.data.user.id
        })
      
      if (insertError) throw insertError
      
      navigate('/')
    } catch (error) {
      console.error('Error creating note:', error)
      setError('Failed to create note')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Create New Note</h2>
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
            <label htmlFor="dueDate">Due Date (optional)</label>
            <input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="url">URL (optional)</label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          
          <div>
            <label htmlFor="priority">Priority (optional)</label>
            <input
              id="priority"
              type="text"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              placeholder="e.g. High, Medium, Low"
            />
          </div>
          
          <div>
            <label htmlFor="importance">Importance (optional)</label>
            <input
              id="importance"
              type="text"
              value={importance}
              onChange={(e) => setImportance(e.target.value)}
              placeholder="e.g. Critical, Major, Minor"
            />
          </div>
          
          <div>
            <label htmlFor="tags">Tags (optional, comma separated)</label>
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
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Note'}
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

export default CreateNote
