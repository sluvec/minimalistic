import React from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import { useDarkModeColors } from '../../hooks/useDarkModeColors'
import { getBadgeVariant } from '../../styles/design-tokens'
import { useDarkMode } from '../../contexts/DarkModeContext'

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
  const colors = useDarkModeColors()
  const { theme } = useDarkMode()

  const handleCardClick = () => {
    navigate(`/edit/${note.id}`)
  }

  return (
    <article
      className="card note-card"
      role="listitem"
      aria-label={`Note: ${note.title || 'Untitled'}`}
      style={{
        backgroundColor: isArchived ? colors.darkerBackground : colors.cardBackground,
        borderRadius: '0.5rem',
        border: `1px solid ${colors.border}`,
        boxShadow: colors.shadow,
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '200px',
        position: 'relative',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out'
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

        <p className="note-content" style={{ marginBottom: '0.75rem', fontSize: '0.875rem', color: colors.textMuted }}>
          {note.content.length > 100
            ? `${note.content.substring(0, 100)}...`
            : note.content}
        </p>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="note-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {note.tags.map(tag => {
              const tagVariant = getBadgeVariant('default', theme)
              return (
                <span
                  key={tag}
                  className="tag"
                  style={{
                    backgroundColor: tagVariant.bg,
                    color: tagVariant.color,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s'
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onTagClick && onTagClick(tag)
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  #{tag}
                </span>
              )
            })}
          </div>
        )}

        {/* Metadata badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {note.category && (() => {
            const categoryVariant = getBadgeVariant('primary', theme)
            return (
              <span
                className="category"
                style={{
                  backgroundColor: categoryVariant.bg,
                  color: categoryVariant.color,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  onCategoryClick && onCategoryClick(note.category)
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                {note.category}
              </span>
            )
          })()}

          {note.type && (() => {
            const typeVariant = getBadgeVariant('purple', theme)
            return (
              <span
                style={{
                  backgroundColor: typeVariant.bg,
                  color: typeVariant.color,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  onTypeClick && onTypeClick(note.type)
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                {note.type}
              </span>
            )
          })()}

          {note.priority && (() => {
            const priorityVariant = getBadgeVariant('yellow', theme)
            return (
              <span style={{
                backgroundColor: priorityVariant.bg,
                color: priorityVariant.color,
                padding: '0.2rem 0.5rem',
                borderRadius: '0.25rem',
                fontSize: '0.75rem'
              }}>
                Priority: {note.priority}
              </span>
            )
          })()}

          {note.importance && (() => {
            const importanceVariant = getBadgeVariant('info', theme)
            return (
              <span style={{
                backgroundColor: importanceVariant.bg,
                color: importanceVariant.color,
                padding: '0.2rem 0.5rem',
                borderRadius: '0.25rem',
                fontSize: '0.75rem'
              }}>
                Importance: {note.importance}
              </span>
            )
          })()}

          {note.status && (() => {
            const statusVariant = getBadgeVariant('success', theme)
            return (
              <span style={{
                backgroundColor: statusVariant.bg,
                color: statusVariant.color,
                padding: '0.2rem 0.5rem',
                borderRadius: '0.25rem',
                fontSize: '0.75rem'
              }}>
                Status: {note.status}
              </span>
            )
          })()}

          {note.isTask && (() => {
            const taskVariant = getBadgeVariant('warning', theme)
            return (
              <span style={{
                backgroundColor: taskVariant.bg,
                color: taskVariant.color,
                padding: '0.2rem 0.5rem',
                borderRadius: '0.25rem',
                fontSize: '0.75rem'
              }}>
                Task
              </span>
            )
          })()}

          {note.isList && (() => {
            const listVariant = getBadgeVariant('success', theme)
            return (
              <span style={{
                backgroundColor: listVariant.bg,
                color: listVariant.color,
                padding: '0.2rem 0.5rem',
                borderRadius: '0.25rem',
                fontSize: '0.75rem'
              }}>
                List
              </span>
            )
          })()}

          {note.isIdea && (() => {
            const ideaVariant = getBadgeVariant('yellow', theme)
            return (
              <span style={{
                backgroundColor: ideaVariant.bg,
                color: ideaVariant.color,
                padding: '0.2rem 0.5rem',
                borderRadius: '0.25rem',
                fontSize: '0.75rem'
              }}>
                Idea
              </span>
            )
          })()}
        </div>

        {/* Due date */}
        {note.due_date && (() => {
          const dueDateVariant = getBadgeVariant('danger', theme)
          return (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '0.5rem',
              fontSize: '0.75rem'
            }}>
              <span style={{
                backgroundColor: dueDateVariant.bg,
                color: dueDateVariant.color,
                padding: '0.2rem 0.5rem',
                borderRadius: '0.25rem'
              }}>
                Due: {new Date(note.due_date).toLocaleDateString()}
              </span>
            </div>
          )
        })()}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.75rem', color: colors.textMuted }}>
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
                color: colors.primary,
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
                  backgroundColor: colors.success,
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  width: '70px',
                  textAlign: 'center',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
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
                  backgroundColor: colors.danger,
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  width: '70px',
                  textAlign: 'center',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
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
                  backgroundColor: colors.danger,
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  width: '70px',
                  textAlign: 'center',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
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
                  backgroundColor: colors.warning,
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  width: '70px',
                  textAlign: 'center',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
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
