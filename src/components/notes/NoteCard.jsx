import React from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'

/**
 * Reusable Note Card component
 * Used in both Dashboard and Archive pages
 */
function NoteCard({
  note,
  onTagClick,
  onCategoryClick,
  onTypeClick,
  onDelete,
  onArchive,
  onRestore,
  isArchived = false
}) {
  const navigate = useNavigate()

  const handleCardClick = () => {
    navigate(`/edit/${note.id}`)
  }

  return (
    <article
      className="card note-card"
      role="listitem"
      aria-label={`Note: ${note.title || 'Untitled'}`}
      style={{
        backgroundColor: isArchived ? 'rgba(0,0,0,0.02)' : 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '200px',
        position: 'relative',
        cursor: 'pointer'
      }}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCardClick()
        }
      }}
      tabIndex={0}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{note.title || 'Untitled'}</h3>
        </div>

        <p className="note-content" style={{ marginBottom: '0.75rem', fontSize: '0.875rem', color: '#4a5568' }}>
          {note.content.length > 100
            ? `${note.content.substring(0, 100)}...`
            : note.content}
        </p>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="note-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {note.tags.map(tag => (
              <span
                key={tag}
                className="tag"
                style={{
                  backgroundColor: '#e2e8f0',
                  color: '#4a5568',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  onTagClick && onTagClick(tag)
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Metadata badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {note.category && (
            <span
              className="category"
              style={{
                backgroundColor: '#bee3f8',
                color: '#2b6cb0',
                padding: '0.2rem 0.5rem',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
              onClick={(e) => {
                e.stopPropagation()
                onCategoryClick && onCategoryClick(note.category)
              }}
            >
              {note.category}
            </span>
          )}

          {note.type && (
            <span
              style={{
                backgroundColor: '#e9d8fd',
                color: '#6b46c1',
                padding: '0.2rem 0.5rem',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
              onClick={(e) => {
                e.stopPropagation()
                onTypeClick && onTypeClick(note.type)
              }}
            >
              {note.type}
            </span>
          )}

          {note.priority && (
            <span style={{
              backgroundColor: '#fef3c7',
              color: '#92400e',
              padding: '0.2rem 0.5rem',
              borderRadius: '0.25rem',
              fontSize: '0.75rem'
            }}>
              Priority: {note.priority}
            </span>
          )}

          {note.importance && (
            <span style={{
              backgroundColor: '#e0f2fe',
              color: '#0369a1',
              padding: '0.2rem 0.5rem',
              borderRadius: '0.25rem',
              fontSize: '0.75rem'
            }}>
              Importance: {note.importance}
            </span>
          )}

          {note.status && (
            <span style={{
              backgroundColor: '#d1f2eb',
              color: '#0c6',
              padding: '0.2rem 0.5rem',
              borderRadius: '0.25rem',
              fontSize: '0.75rem'
            }}>
              Status: {note.status}
            </span>
          )}

          {note.isTask && (
            <span style={{ backgroundColor: '#feebc8', color: '#c05621', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>
              Task
            </span>
          )}

          {note.isList && (
            <span style={{ backgroundColor: '#c6f6d5', color: '#276749', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>
              List
            </span>
          )}

          {note.isIdea && (
            <span style={{ backgroundColor: '#fefcbf', color: '#975a16', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>
              Idea
            </span>
          )}
        </div>

        {/* Due date */}
        {note.due_date && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '0.5rem',
            fontSize: '0.75rem'
          }}>
            <span style={{
              backgroundColor: '#fed7d7',
              color: '#c53030',
              padding: '0.2rem 0.5rem',
              borderRadius: '0.25rem'
            }}>
              Due: {new Date(note.due_date).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.75rem', color: '#718096' }}>
          {new Date(note.updated_at).toLocaleDateString()}
        </span>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {note.url && (
            <a
              href={note.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                color: '#4299e1',
                textDecoration: 'none',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <span>Open URL</span>
            </a>
          )}

          {isArchived ? (
            <>
              <button
                className="restore-button"
                onClick={(e) => {
                  e.stopPropagation()
                  onRestore && onRestore(note.id)
                }}
                style={{
                  backgroundColor: '#48bb78',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  width: '70px',
                  textAlign: 'center'
                }}
              >
                Restore
              </button>
              <button
                className="delete-button"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete && onDelete(note.id)
                }}
                style={{
                  backgroundColor: '#f56565',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  width: '70px',
                  textAlign: 'center'
                }}
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                className="delete-button"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete && onDelete(note.id)
                }}
                style={{
                  backgroundColor: '#f56565',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  width: '70px',
                  textAlign: 'center'
                }}
              >
                Delete
              </button>
              <button
                className="archive-button"
                onClick={(e) => {
                  e.stopPropagation()
                  onArchive && onArchive(note.id)
                }}
                style={{
                  backgroundColor: '#ed8936',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  width: '70px',
                  textAlign: 'center'
                }}
              >
                Archive
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  )
}

NoteCard.propTypes = {
  note: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
    content: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string),
    category: PropTypes.string,
    type: PropTypes.string,
    priority: PropTypes.string,
    importance: PropTypes.string,
    status: PropTypes.string,
    due_date: PropTypes.string,
    url: PropTypes.string,
    isTask: PropTypes.bool,
    isList: PropTypes.bool,
    isIdea: PropTypes.bool
  }).isRequired,
  onTagClick: PropTypes.func,
  onCategoryClick: PropTypes.func,
  onTypeClick: PropTypes.func,
  onDelete: PropTypes.func,
  onArchive: PropTypes.func,
  onRestore: PropTypes.func,
  isArchived: PropTypes.bool
}

NoteCard.defaultProps = {
  isArchived: false
}

export default React.memo(NoteCard)
