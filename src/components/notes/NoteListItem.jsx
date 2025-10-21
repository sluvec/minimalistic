import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { formatDateForDisplay } from '../../utils/dateHelpers'

function NoteListItem({ note, onTagClick, onCategoryClick, onTypeClick, onDelete, onArchive, onRestore, isArchived }) {
  const navigate = useNavigate()

  const handleRowClick = (e) => {
    // Don't navigate if clicking on buttons or tags
    if (e.target.closest('button') || e.target.closest('.tag')) {
      return
    }
    navigate(`/edit/${note.id}`)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      navigate(`/edit/${note.id}`)
    }
  }

  return (
    <div
      onClick={handleRowClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="row"
      aria-label={`Note: ${note.title || 'Untitled'}`}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 150px 120px 120px 100px 150px',
        gap: '1rem',
        padding: '1rem',
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        alignItems: 'center'
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7fafc'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
    >
      {/* Title & Content Column */}
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontWeight: '600',
          fontSize: '1rem',
          color: '#2d3748',
          marginBottom: '0.25rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {note.title || 'Untitled'}
        </div>
        <div style={{
          fontSize: '0.875rem',
          color: '#718096',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {note.content}
        </div>
        {note.tags && note.tags.length > 0 && (
          <div style={{ marginTop: '0.5rem' }}>
            {note.tags.map((tag, idx) => (
              <span
                key={idx}
                onClick={(e) => {
                  e.stopPropagation()
                  if (onTagClick) onTagClick(tag)
                }}
                className="tag"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#edf2f7',
                  color: '#4a5568',
                  padding: '0.15rem 0.4rem',
                  borderRadius: '0.25rem',
                  marginRight: '0.25rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Category Column */}
      <div style={{ fontSize: '0.875rem', color: '#4a5568', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {note.category && (
          <span
            onClick={(e) => {
              e.stopPropagation()
              if (onCategoryClick) onCategoryClick(note.category)
            }}
            style={{
              cursor: 'pointer',
              fontWeight: '500',
              color: '#4299e1'
            }}
          >
            {note.category}
          </span>
        )}
      </div>

      {/* Type Column */}
      <div style={{ fontSize: '0.875rem', color: '#4a5568', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {note.type && (
          <span
            onClick={(e) => {
              e.stopPropagation()
              if (onTypeClick) onTypeClick(note.type)
            }}
            style={{
              cursor: 'pointer',
              fontWeight: '500',
              color: '#48bb78'
            }}
          >
            {note.type}
          </span>
        )}
      </div>

      {/* Status Column */}
      <div style={{ fontSize: '0.875rem' }}>
        {note.status && (
          <span style={{
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem',
            fontSize: '0.75rem',
            fontWeight: '600',
            backgroundColor: note.status === 'Done' ? '#c6f6d5' : note.status === 'In Progress' ? '#fed7d7' : '#e2e8f0',
            color: note.status === 'Done' ? '#22543d' : note.status === 'In Progress' ? '#742a2a' : '#4a5568'
          }}>
            {note.status}
          </span>
        )}
      </div>

      {/* Due Date Column */}
      <div style={{ fontSize: '0.875rem', color: '#4a5568' }}>
        {note.due_date && formatDateForDisplay(note.due_date)}
      </div>

      {/* Actions Column */}
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        {isArchived ? (
          <>
            {onRestore && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRestore(note.id)
                }}
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#48bb78',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}
                aria-label={`Restore note: ${note.title || 'Untitled'}`}
              >
                Restore
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(note.id)
                }}
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#f56565',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}
                aria-label={`Delete note: ${note.title || 'Untitled'}`}
              >
                Delete
              </button>
            )}
          </>
        ) : (
          <>
            {onArchive && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onArchive(note.id)
                }}
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#ed8936',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}
                aria-label={`Archive note: ${note.title || 'Untitled'}`}
              >
                Archive
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(note.id)
                }}
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#f56565',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}
                aria-label={`Delete note: ${note.title || 'Untitled'}`}
              >
                Delete
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

NoteListItem.propTypes = {
  note: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
    content: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string),
    category: PropTypes.string,
    type: PropTypes.string,
    status: PropTypes.string,
    priority: PropTypes.string,
    importance: PropTypes.string,
    due_date: PropTypes.string,
    url: PropTypes.string,
    isTask: PropTypes.bool,
    isList: PropTypes.bool,
    isIdea: PropTypes.bool,
    archived: PropTypes.bool,
    created_at: PropTypes.string,
    updated_at: PropTypes.string
  }).isRequired,
  onTagClick: PropTypes.func,
  onCategoryClick: PropTypes.func,
  onTypeClick: PropTypes.func,
  onDelete: PropTypes.func,
  onArchive: PropTypes.func,
  onRestore: PropTypes.func,
  isArchived: PropTypes.bool
}

NoteListItem.defaultProps = {
  isArchived: false
}

export default NoteListItem
