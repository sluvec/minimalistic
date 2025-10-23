import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useDarkModeColors } from '../hooks/useDarkModeColors'

/**
 * Interactive onboarding tour for new users
 * Guides users through key features of the app
 */
function OnboardingTour({ onComplete }) {
  const colors = useDarkModeColors()
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has seen the tour before
    const hasSeenTour = localStorage.getItem('hasSeenOnboarding')
    if (!hasSeenTour) {
      setIsVisible(true)
    }
  }, [])

  const steps = [
    {
      title: 'Welcome to MinimalNotes! 👋',
      description: 'Let\'s take a quick tour to help you get started. This will only take a minute!',
      icon: '🎉',
      position: 'center'
    },
    {
      title: 'Quick Note Creation',
      description: 'Use the Quick Note form to rapidly capture your thoughts. Just add a title, content, and tags!',
      icon: '⚡',
      target: 'quick-note',
      position: 'top'
    },
    {
      title: 'Simple & Advanced Modes',
      description: 'Switch between Quick mode (3 fields) and Advanced mode (all options) depending on your needs.',
      icon: '⚙️',
      target: 'quick-note',
      position: 'top'
    },
    {
      title: 'Organize with Projects & Spaces',
      description: 'Group your notes into Projects and Spaces for better organization. Access them from the navigation menu.',
      icon: '📁',
      target: 'nav',
      position: 'bottom'
    },
    {
      title: 'Powerful Filtering',
      description: 'Use the sidebar filters to quickly find notes by tags, categories, status, and more.',
      icon: '🔍',
      target: 'filters',
      position: 'right'
    },
    {
      title: 'All Set! 🚀',
      description: 'You\'re ready to start taking notes! Create your first note and explore the features.',
      icon: '✨',
      position: 'center'
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true')
    setIsVisible(false)
    if (onComplete) {
      onComplete()
    }
  }

  if (!isVisible) return null

  const step = steps[currentStep]

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 9998,
    animation: 'fadeIn 0.3s ease-in-out'
  }

  const modalStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: colors.cardBackground,
    borderRadius: '1rem',
    padding: '2rem',
    maxWidth: '500px',
    width: '90%',
    boxShadow: colors.shadowLarge,
    zIndex: 9999,
    animation: 'slideUp 0.3s ease-out',
    border: `2px solid ${colors.primary}`
  }

  const iconStyle = {
    fontSize: '3rem',
    marginBottom: '1rem',
    textAlign: 'center'
  }

  const titleStyle = {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: colors.textPrimary,
    marginBottom: '1rem',
    textAlign: 'center'
  }

  const descriptionStyle = {
    fontSize: '1rem',
    color: colors.textSecondary,
    lineHeight: 1.6,
    marginBottom: '1.5rem',
    textAlign: 'center'
  }

  const progressStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '1.5rem'
  }

  const dotStyle = (isActive) => ({
    width: isActive ? '2rem' : '0.5rem',
    height: '0.5rem',
    borderRadius: '0.25rem',
    backgroundColor: isActive ? colors.primary : colors.border,
    transition: 'all 0.3s ease-in-out'
  })

  const buttonsStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem'
  }

  const buttonStyle = (primary = false) => ({
    flex: 1,
    padding: '0.75rem 1.5rem',
    backgroundColor: primary ? colors.primary : 'transparent',
    color: primary ? 'white' : colors.textSecondary,
    border: primary ? 'none' : `1px solid ${colors.border}`,
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out'
  })

  return (
    <>
      <div style={overlayStyle} onClick={handleSkip} />
      <div style={modalStyle} role="dialog" aria-labelledby="tour-title" aria-describedby="tour-description">
        <div style={iconStyle}>{step.icon}</div>
        <h2 id="tour-title" style={titleStyle}>{step.title}</h2>
        <p id="tour-description" style={descriptionStyle}>{step.description}</p>

        {/* Progress Dots */}
        <div style={progressStyle}>
          {steps.map((_, index) => (
            <div key={index} style={dotStyle(index === currentStep)} />
          ))}
        </div>

        {/* Buttons */}
        <div style={buttonsStyle}>
          <button
            onClick={handleSkip}
            style={buttonStyle(false)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.hoverBackground
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            {currentStep === steps.length - 1 ? 'Close' : 'Skip Tour'}
          </button>
          <button
            onClick={handleNext}
            style={buttonStyle(true)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.primaryHover
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {currentStep === steps.length - 1 ? 'Get Started!' : 'Next'}
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translate(-50%, -40%);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%);
            }
          }
        `}
      </style>
    </>
  )
}

OnboardingTour.propTypes = {
  onComplete: PropTypes.func
}

export default OnboardingTour
