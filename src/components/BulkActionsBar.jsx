import PropTypes from 'prop-types'
import { useDarkModeColors } from '../hooks/useDarkModeColors'

/**
 * Floating action bar for bulk operations
 * Appears when notes are selected
 */
function BulkActionsBar({
  selectedCount,
  onDelete,
  onArchive,
  onMarkComplete,
  onClearSelection
}) {
  const colors = useDarkModeColors()

  if (selectedCount === 0) return null

  const barStyle = {
    position: 'fixed',
    bottom: '2rem',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: colors.cardBackground,
    border: `2px solid ${colors.primary}`,
    borderRadius: '0.75rem',
    padding: '1rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: colors.shadowLarge,
    zIndex: 1000,
    animation: 'slideUpFade 0.3s ease-out',
    minWidth: '300px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  }

  const countStyle = {
    fontWeight: 600,
    color: colors.textPrimary,
    fontSize: '0.95rem',
    paddingRight: '1rem',
    borderRight: `1px solid ${colors.border}`,
  }

  const buttonStyle = (variant = 'default') => {
    const variants = {
      default: {
        backgroundColor: colors.primary,
        color: 'white',
      },
      success: {
        backgroundColor: colors.success,
        color: 'white',
      },
      warning: {
        backgroundColor: colors.warning,
        color: 'white',
      },
      danger: {
        backgroundColor: colors.danger,
        color: 'white',
      },
      secondary: {
        backgroundColor: 'transparent',
        color: colors.textSecondary,
        border: `1px solid ${colors.border}`,
      }
    }

    const variantStyle = variants[variant] || variants.default

    return {
      ...variantStyle,
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      border: variantStyle.border || 'none',
      fontSize: '0.875rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      whiteSpace: 'nowrap',
    }
  }

  return (
    <>
      <div style={barStyle} role="toolbar" aria-label="Bulk actions">
        <span style={countStyle}>
          {selectedCount} {selectedCount === 1 ? 'note' : 'notes'} selected
        </span>

        <button
          onClick={onMarkComplete}
          style={buttonStyle('success')}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.8'
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
          aria-label={`Mark ${selectedCount} notes as complete`}
        >
          <span>✓</span>
          <span>Mark Complete</span>
        </button>

        <button
          onClick={onArchive}
          style={buttonStyle('warning')}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.8'
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
          aria-label={`Archive ${selectedCount} notes`}
        >
          <span>📦</span>
          <span>Archive</span>
        </button>

        <button
          onClick={onDelete}
          style={buttonStyle('danger')}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.8'
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
          aria-label={`Delete ${selectedCount} notes`}
        >
          <span>🗑️</span>
          <span>Delete</span>
        </button>

        <button
          onClick={onClearSelection}
          style={buttonStyle('secondary')}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.hoverBackground
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
          aria-label="Clear selection"
        >
          <span>✕</span>
          <span>Clear</span>
        </button>
      </div>

      <style>
        {`
          @keyframes slideUpFade {
            from {
              opacity: 0;
              transform: translate(-50%, 100%);
            }
            to {
              opacity: 1;
              transform: translate(-50%, 0);
            }
          }
        `}
      </style>
    </>
  )
}

BulkActionsBar.propTypes = {
  selectedCount: PropTypes.number.isRequired,
  onDelete: PropTypes.func.isRequired,
  onArchive: PropTypes.func.isRequired,
  onMarkComplete: PropTypes.func.isRequired,
  onClearSelection: PropTypes.func.isRequired,
}

export default BulkActionsBar
