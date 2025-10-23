import PropTypes from 'prop-types'
import { useDarkModeColors } from '../hooks/useDarkModeColors'
import Skeleton from './Skeleton'

/**
 * Skeleton loader specifically for note list items
 * Mimics the structure of NoteListItem for seamless loading experience
 */
function NoteSkeleton({ count = 1 }) {
  const colors = useDarkModeColors()

  const itemStyle = {
    display: 'flex',
    flexDirection: 'column',
    padding: '0.75rem 1rem',
    backgroundColor: colors.cardBackground,
    borderBottom: `1px solid ${colors.border}`,
    gap: '0.5rem',
  }

  const renderSingleSkeleton = (index) => (
    <div key={index} style={itemStyle}>
      {/* Title and preview line */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Skeleton width="150px" height="18px" />
        <Skeleton width="60%" height="16px" />
      </div>

      {/* Metadata badges line */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <Skeleton width="80px" height="20px" borderRadius="0.25rem" />
        <Skeleton width="100px" height="20px" borderRadius="0.25rem" />
        <Skeleton width="90px" height="20px" borderRadius="0.25rem" />
        <Skeleton width="70px" height="20px" borderRadius="0.25rem" />
        {/* Action buttons on the right */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          <Skeleton width="70px" height="24px" borderRadius="0.25rem" />
          <Skeleton width="70px" height="24px" borderRadius="0.25rem" />
        </div>
      </div>
    </div>
  )

  return (
    <div
      style={{
        backgroundColor: colors.cardBackground,
        borderRadius: '0.5rem',
        boxShadow: colors.shadow,
        overflow: 'hidden',
      }}
      role="status"
      aria-label="Loading notes..."
    >
      {Array.from({ length: count }).map((_, index) => renderSingleSkeleton(index))}
    </div>
  )
}

NoteSkeleton.propTypes = {
  count: PropTypes.number,
}

export default NoteSkeleton
