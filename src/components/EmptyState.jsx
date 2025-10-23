import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { useDarkModeColors } from '../hooks/useDarkModeColors'

/**
 * EmptyState component with illustrations and CTAs
 * Provides visual feedback when there's no data to display
 */
function EmptyState({
  icon = '📝',
  title = 'No items yet',
  description = 'Get started by creating your first item',
  actionLabel = null,
  actionLink = null,
  actionOnClick = null,
  secondaryActionLabel = null,
  secondaryActionLink = null
}) {
  const colors = useDarkModeColors()

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 1.5rem',
    textAlign: 'center',
    minHeight: '300px',
  }

  const iconContainerStyle = {
    fontSize: '4rem',
    marginBottom: '1.5rem',
    opacity: 0.8,
    animation: 'fadeIn 0.5s ease-in-out',
  }

  const titleStyle = {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: colors.textPrimary,
    marginBottom: '0.75rem',
  }

  const descriptionStyle = {
    fontSize: '1rem',
    color: colors.textMuted,
    marginBottom: '2rem',
    maxWidth: '400px',
    lineHeight: 1.6,
  }

  const primaryButtonStyle = {
    padding: '0.75rem 1.5rem',
    backgroundColor: colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontWeight: 600,
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    textDecoration: 'none',
    display: 'inline-block',
  }

  const secondaryButtonStyle = {
    padding: '0.75rem 1.5rem',
    backgroundColor: 'transparent',
    color: colors.primary,
    border: `2px solid ${colors.primary}`,
    borderRadius: '0.5rem',
    fontWeight: 600,
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    textDecoration: 'none',
    display: 'inline-block',
    marginLeft: '1rem',
  }

  const actionsStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    justifyContent: 'center',
    alignItems: 'center',
  }

  const renderPrimaryAction = () => {
    if (!actionLabel) return null

    if (actionLink) {
      return (
        <Link
          to={actionLink}
          style={primaryButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.primaryHover
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = colors.shadow
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.primary
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {actionLabel}
        </Link>
      )
    }

    if (actionOnClick) {
      return (
        <button
          onClick={actionOnClick}
          style={primaryButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.primaryHover
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = colors.shadow
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.primary
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {actionLabel}
        </button>
      )
    }

    return null
  }

  const renderSecondaryAction = () => {
    if (!secondaryActionLabel || !secondaryActionLink) return null

    return (
      <Link
        to={secondaryActionLink}
        style={secondaryButtonStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = colors.primary
          e.currentTarget.style.color = 'white'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
          e.currentTarget.style.color = colors.primary
        }}
      >
        {secondaryActionLabel}
      </Link>
    )
  }

  return (
    <div style={containerStyle} role="status" aria-live="polite">
      <div style={iconContainerStyle}>
        {icon}
      </div>
      <h3 style={titleStyle}>{title}</h3>
      <p style={descriptionStyle}>{description}</p>
      <div style={actionsStyle}>
        {renderPrimaryAction()}
        {renderSecondaryAction()}
      </div>
    </div>
  )
}

EmptyState.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  actionLabel: PropTypes.string,
  actionLink: PropTypes.string,
  actionOnClick: PropTypes.func,
  secondaryActionLabel: PropTypes.string,
  secondaryActionLink: PropTypes.string,
}

export default EmptyState
