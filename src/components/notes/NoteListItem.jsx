import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { memo } from 'react'
import { formatDateForDisplay } from '../../utils/dateHelpers'
import { useDarkModeColors } from '../../hooks/useDarkModeColors'
import { getBadgeVariant } from '../../styles/design-tokens'
import { useDarkMode } from '../../contexts/DarkModeContext'

function NoteListItem({ note, onTagClick, onCategoryClick, onTypeClick, onDelete, onArchive, onRestore, isArchived }) {
  const navigate = useNavigate()
  const colors = useDarkModeColors()
  const { theme } = useDarkMode()

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
  const MetadataBadge = ({ children, variant = 'default', onClick, clickable = false }) => {
    const badgeColors = getBadgeVariant(variant, theme)
    return (
      <span
        className="metadata-badge"
        onClick={onClick}
        style={{
          display: 'inline-block',
          padding: '0.15rem 0.4rem',
          fontSize: 'clamp(0.65rem, 1.8vw, 0.75rem)',
          borderRadius: '0.25rem',
          backgroundColor: badgeColors.bg,
          color: badgeColors.color,
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
  }

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
        backgroundColor: colors.cardBackground,
        borderBottom: `1px solid ${colors.border}`,
        cursor: 'pointer',
        transition: 'background-color 0.2s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hoverBackground}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.cardBackground}
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
          color: colors.textPrimary,
          wordBreak: 'break-word'
        }}>
          {note.title || 'Untitled'}
        </span>
        {note.content && (
          <span style={{
            color: colors.textMuted,
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
            variant="primary"
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
            variant="purple"
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
            variant={note.status === 'Done' ? 'success' : note.status === 'In Progress' ? 'danger' : 'default'}
          >
            {note.status}
          </MetadataBadge>
        )}

        {/* Priority */}
        {note.priority && (
          <MetadataBadge variant="danger">
            ⚡ {note.priority}
          </MetadataBadge>
        )}

        {/* Importance */}
        {note.importance && (
          <MetadataBadge variant="warning">
            ⭐ {note.importance}
          </MetadataBadge>
        )}

        {/* Due Date */}
        {note.due_date && (
          <MetadataBadge variant="yellow">
            📅 {formatDateForDisplay(note.due_date)}
          </MetadataBadge>
        )}

        {/* Estimated Duration */}
        {(note.estimated_hours || note.estimated_minutes) && (
          <MetadataBadge variant="purple">
            ⏱️ {note.estimated_hours ? `${note.estimated_hours}h` : ''}{note.estimated_hours && note.estimated_minutes ? ' ' : ''}{note.estimated_minutes ? `${note.estimated_minutes}m` : ''}
          </MetadataBadge>
        )}

        {/* Boolean flags */}
        {note.isTask && <MetadataBadge variant="default">✓ Task</MetadataBadge>}
        {note.isList && <MetadataBadge variant="default">📋 List</MetadataBadge>}
        {note.isIdea && <MetadataBadge variant="default">💡 Idea</MetadataBadge>}

        {/* URL indicator */}
        {note.url && (
          <MetadataBadge variant="info">
            🔗 Link
          </MetadataBadge>
        )}

        {/* Project */}
        {note.projects && (
          <span style={{
            padding: '0.25rem 0.75rem',
            borderRadius: '0.25rem',
            fontSize: '0.875rem',
            backgroundColor: note.projects.color + '20',
            color: colors.textPrimary,
            fontWeight: '500',
            border: `1px solid ${note.projects.color}`
          }}>
            📁 {note.projects.name}
          </span>
        )}

        {/* Space */}
        {note.spaces && (
          <span style={{
            padding: '0.25rem 0.75rem',
            borderRadius: '0.25rem',
            fontSize: '0.875rem',
            backgroundColor: note.spaces.color + '20',
            color: colors.textPrimary,
            fontWeight: '500',
            border: `1px solid ${note.spaces.color}`
          }}>
            {note.spaces.icon} {note.spaces.name}
          </span>
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
    estimated_hours: PropTypes.number,
    estimated_minutes: PropTypes.number,
    created_at: PropTypes.string,
    updated_at: PropTypes.string,
    projects: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      color: PropTypes.string
    }),
    spaces: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      icon: PropTypes.string,
      color: PropTypes.string
    })
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

export default memo(NoteListItem)
