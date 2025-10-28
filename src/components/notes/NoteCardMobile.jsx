import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { memo } from 'react'
import { useDarkModeColors } from '../../hooks/useDarkModeColors'

/**
 * Mobile-optimized note card for responsive table view
 * Displays note information in a card format instead of table rows
 */
function NoteCardMobile({ note }) {
  const navigate = useNavigate()
  const colors = useDarkModeColors()

  const cardStyle = {
    backgroundColor: colors.cardBackground,
    border: `1px solid ${colors.border}`,
    borderRadius: '0.5rem',
    padding: '1rem',
    marginBottom: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    boxShadow: colors.shadow,
  }

  const titleStyle = {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: colors.textPrimary,
    marginBottom: '0.5rem',
    wordBreak: 'break-word',
  }

  const previewStyle = {
    fontSize: '0.875rem',
    color: colors.textMuted,
    marginBottom: '0.75rem',
    lineHeight: 1.5,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  }

  const metaRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
    flexWrap: 'wrap',
  }

  const labelStyle = {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: colors.textSecondary,
    minWidth: '70px',
  }

  const valueStyle = {
    fontSize: '0.875rem',
    color: colors.textPrimary,
  }

  const badgeStyle = {
    display: 'inline-block',
    padding: '0.25rem 0.5rem',
    backgroundColor: colors.chipBackground,
    color: colors.chipText,
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: 500,
  }

  const truncateContent = (content) => {
    if (!content) return ''
    const plainText = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
    if (plainText.length <= 120) return plainText
    return plainText.substring(0, 120) + '...'
  }

  return (
    <div
      style={cardStyle}
      onClick={() => navigate(`/edit/${note.id}`)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = colors.shadowLarge
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = colors.shadow
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          navigate(`/edit/${note.id}`)
        }
      }}
    >
      {/* Title */}
      <h3 style={titleStyle}>
        {note.title || <em style={{ color: colors.textMuted }}>Untitled</em>}
      </h3>

      {/* Preview */}
      <p style={previewStyle}>{truncateContent(note.content)}</p>

      {/* Metadata */}
      <div style={{ fontSize: '0.875rem' }}>
        {/* Category */}
        {note.category && (
          <div style={metaRowStyle}>
            <span style={labelStyle}>Category:</span>
            <span style={valueStyle}>{note.category}</span>
          </div>
        )}

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div style={metaRowStyle}>
            <span style={labelStyle}>Tags:</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
              {note.tags.slice(0, 3).map((tag, idx) => (
                <span key={idx} style={badgeStyle}>
                  #{tag}
                </span>
              ))}
              {note.tags.length > 3 && (
                <span style={badgeStyle}>+{note.tags.length - 3}</span>
              )}
            </div>
          </div>
        )}

        {/* Project */}
        {note.projects?.name && (
          <div style={metaRowStyle}>
            <span style={labelStyle}>Project:</span>
            <span style={valueStyle}>{note.projects.name}</span>
          </div>
        )}

        {/* Space */}
        {note.spaces?.name && (
          <div style={metaRowStyle}>
            <span style={labelStyle}>Space:</span>
            <span style={valueStyle}>
              {note.spaces.icon || '📁'} {note.spaces.name}
            </span>
          </div>
        )}

        {/* Updated date */}
        <div style={metaRowStyle}>
          <span style={labelStyle}>Updated:</span>
          <span style={valueStyle}>
            {note.updated_at ? format(new Date(note.updated_at), 'MMM d, yyyy') : '-'}
          </span>
        </div>
      </div>
    </div>
  )
}

NoteCardMobile.propTypes = {
  note: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
    content: PropTypes.string.isRequired,
    category: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    updated_at: PropTypes.string,
    projects: PropTypes.shape({
      name: PropTypes.string,
    }),
    spaces: PropTypes.shape({
      name: PropTypes.string,
      icon: PropTypes.string,
    }),
  }).isRequired,
}

export default memo(NoteCardMobile)
