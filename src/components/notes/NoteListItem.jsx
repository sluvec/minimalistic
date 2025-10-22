import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { formatDateForDisplay } from '../../utils/dateHelpers'

function NoteListItem({ note, onTagClick, onCategoryClick, onTypeClick, onDelete, onArchive, onRestore, isArchived }) {
  const navigate = useNavigate()

  const handleRowClick = (e) => {
    // Don't navigate if clicking on buttons or metadata badges
    if (e.target.closest('button') || e.target.closest('.metadata-badge')) {
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

  // Helper to extract first 1-2 sentences from content
  const getPreview = (text) => {
    if (!text) return ''
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
    return sentences.slice(0, 2).join(' ').substring(0, 150)
  }

  // Metadata badge component for consistency
  const MetadataBadge = ({ children, color = '#4a5568', bgColor = '#edf2f7', onClick, clickable = false }) => (
    <span
      className="metadata-badge"
      onClick={onClick}
      style={{
        display: 'inline-block',
        padding: '0.15rem 0.4rem',
        fontSize: 'clamp(0.65rem, 1.8vw, 0.75rem)',
        borderRadius: '0.25rem',
        backgroundColor: bgColor,
        color: color,
        cursor: clickable ? 'pointer' : 'default',
        fontWeight: '500',
        transition: clickable ? 'opacity 0.2s' : 'none',
        whiteSpace: 'nowrap'
      }}
      onMouseEnter={(e) => clickable && (e.currentTarget.style.opacity = '0.7')}
      onMouseLeave={(e) => clickable && (e.currentTarget.style.opacity = '1')}
    >
      {children}
    </span>
  )

  return (
    <div
      onClick={handleRowClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="row"
      aria-label={`Note: ${note.title || 'Untitled'}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '0.75rem 1rem',
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7fafc'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
    >
      {/* Line 1: Title + Content Preview */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        marginBottom: '0.4rem',
        fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
        lineHeight: '1.4',
        gap: '0.25rem'
      }}>
        <span style={{
          fontWeight: '600',
          color: '#2d3748',
          wordBreak: 'break-word'
        }}>
          {note.title || 'Untitled'}
        </span>
        {note.content && (
          <span style={{
            color: '#718096',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: '1',
            WebkitBoxOrient: 'vertical',
            wordBreak: 'break-word'
          }}>
            — {getPreview(note.content)}
          </span>
        )}
      </div>

      {/* Line 2: All Metadata + Actions */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.35rem',
        alignItems: 'center'
      }}>
        {/* Tags */}
        {note.tags?.map((tag, idx) => (
          <MetadataBadge
            key={idx}
            clickable
            onClick={(e) => {
              e.stopPropagation()
              if (onTagClick) onTagClick(tag)
            }}
          >
            #{tag}
          </MetadataBadge>
        ))}

        {/* Category */}
        {note.category && (
          <MetadataBadge
            clickable
            color="#2c5282"
            bgColor="#bee3f8"
            onClick={(e) => {
              e.stopPropagation()
              if (onCategoryClick) onCategoryClick(note.category)
            }}
          >
            {note.category}
          </MetadataBadge>
        )}

        {/* Type */}
        {note.type && (
          <MetadataBadge
            clickable
            color="#22543d"
            bgColor="#c6f6d5"
            onClick={(e) => {
              e.stopPropagation()
              if (onTypeClick) onTypeClick(note.type)
            }}
          >
            {note.type}
          </MetadataBadge>
        )}

        {/* Status */}
        {note.status && (
          <MetadataBadge
            color={note.status === 'Done' ? '#22543d' : note.status === 'In Progress' ? '#742a2a' : '#4a5568'}
            bgColor={note.status === 'Done' ? '#c6f6d5' : note.status === 'In Progress' ? '#fed7d7' : '#e2e8f0'}
          >
            {note.status}
          </MetadataBadge>
        )}

        {/* Priority */}
        {note.priority && (
          <MetadataBadge color="#742a2a" bgColor="#feb2b2">
            ⚡ {note.priority}
          </MetadataBadge>
        )}

        {/* Importance */}
        {note.importance && (
          <MetadataBadge color="#744210" bgColor="#fbd38d">
            ⭐ {note.importance}
          </MetadataBadge>
        )}

        {/* Due Date */}
        {note.due_date && (
          <MetadataBadge color="#744210" bgColor="#fefcbf">
            📅 {formatDateForDisplay(note.due_date)}
          </MetadataBadge>
        )}

        {/* Boolean flags */}
        {note.isTask && <MetadataBadge color="#2d3748" bgColor="#cbd5e0">✓ Task</MetadataBadge>}
        {note.isList && <MetadataBadge color="#2d3748" bgColor="#cbd5e0">📋 List</MetadataBadge>}
        {note.isIdea && <MetadataBadge color="#2d3748" bgColor="#cbd5e0">💡 Idea</MetadataBadge>}

        {/* URL indicator */}
        {note.url && (
          <MetadataBadge color="#2c5282" bgColor="#bee3f8">
            🔗 Link
          </MetadataBadge>
        )}

        {/* Actions on the right */}
        <div style={{
          marginLeft: 'auto',
          display: 'flex',
          gap: 'clamp(0.25rem, 1vw, 0.5rem)',
          flexShrink: 0
        }}>
          {isArchived ? (
            <>
              {onRestore && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onRestore(note.id)
                  }}
                  style={{
                    padding: 'clamp(0.2rem, 1vw, 0.25rem) clamp(0.4rem, 2vw, 0.5rem)',
                    backgroundColor: '#48bb78',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    fontSize: 'clamp(0.65rem, 1.8vw, 0.75rem)',
                    fontWeight: '500',
                    whiteSpace: 'nowrap'
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
                    padding: 'clamp(0.2rem, 1vw, 0.25rem) clamp(0.4rem, 2vw, 0.5rem)',
                    backgroundColor: '#f56565',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    fontSize: 'clamp(0.65rem, 1.8vw, 0.75rem)',
                    fontWeight: '500',
                    whiteSpace: 'nowrap'
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
                    padding: 'clamp(0.2rem, 1vw, 0.25rem) clamp(0.4rem, 2vw, 0.5rem)',
                    backgroundColor: '#ed8936',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    fontSize: 'clamp(0.65rem, 1.8vw, 0.75rem)',
                    fontWeight: '500',
                    whiteSpace: 'nowrap'
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
                    padding: 'clamp(0.2rem, 1vw, 0.25rem) clamp(0.4rem, 2vw, 0.5rem)',
                    backgroundColor: '#f56565',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    fontSize: 'clamp(0.65rem, 1.8vw, 0.75rem)',
                    fontWeight: '500',
                    whiteSpace: 'nowrap'
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
