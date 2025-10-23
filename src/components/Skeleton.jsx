import PropTypes from 'prop-types'
import { useDarkModeColors } from '../hooks/useDarkModeColors'

/**
 * Skeleton loading component for better perceived performance
 */
function Skeleton({ width = '100%', height = '20px', borderRadius = '0.375rem', marginBottom = '0' }) {
  const colors = useDarkModeColors()

  const skeletonStyle = {
    width,
    height,
    borderRadius,
    marginBottom,
    backgroundColor: colors.border,
    position: 'relative',
    overflow: 'hidden',
  }

  const shimmerStyle = {
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${colors.hoverBackground}, transparent)`,
    animation: 'shimmer 1.5s infinite',
  }

  return (
    <div style={skeletonStyle} aria-label="Loading...">
      <div style={shimmerStyle} />
      <style>
        {`
          @keyframes shimmer {
            0% {
              left: -100%;
            }
            100% {
              left: 100%;
            }
          }
        `}
      </style>
    </div>
  )
}

Skeleton.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  borderRadius: PropTypes.string,
  marginBottom: PropTypes.string,
}

export default Skeleton
