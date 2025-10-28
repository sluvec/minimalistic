import { useDarkModeColors } from '../hooks/useDarkModeColors'

/**
 * Modern save status indicator
 * Shows subtle, non-intrusive feedback about save state
 */
function SaveStatusIndicator({ isSaving, lastSaved, error }) {
  const colors = useDarkModeColors()

  if (error) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        borderRadius: '0.5rem',
        backgroundColor: colors.danger + '10',
        border: `1px solid ${colors.danger}`,
        fontSize: '0.875rem',
        color: colors.danger,
        fontWeight: '500'
      }}>
        <span>⚠️</span>
        <span>Failed to save: {error}</span>
      </div>
    )
  }

  if (isSaving) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.875rem',
        color: colors.textMuted,
        fontWeight: '500'
      }}>
        <div style={{
          width: '12px',
          height: '12px',
          border: `2px solid ${colors.primary}`,
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <span>Saving...</span>
      </div>
    )
  }

  if (lastSaved) {
    const timeAgo = getTimeAgo(lastSaved)
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.875rem',
        color: colors.textMuted,
        fontWeight: '500'
      }}>
        <span style={{ color: colors.success }}>✓</span>
        <span>Saved {timeAgo}</span>
      </div>
    )
  }

  return null
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000)

  if (seconds < 10) return 'just now'
  if (seconds < 60) return `${seconds}s ago`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  return 'today'
}

// Add CSS animation for spinner
const style = document.createElement('style')
style.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`
document.head.appendChild(style)

export default SaveStatusIndicator
