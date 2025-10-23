import { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { Link, useLocation } from 'react-router-dom'
import { useDarkModeColors } from '../hooks/useDarkModeColors'

function MobileMenu({ session }) {
  const [isOpen, setIsOpen] = useState(false)
  const colors = useDarkModeColors()
  const location = useLocation()
  const menuRef = useRef(null)

  const isActive = (path) => location.pathname === path

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [location])

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden'
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isOpen])

  const hamburgerStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    width: '28px',
    height: '24px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  }

  const barStyle = (index) => ({
    width: '28px',
    height: '3px',
    backgroundColor: colors.textPrimary,
    borderRadius: '2px',
    transition: 'all 0.3s ease-in-out',
    transform: isOpen
      ? index === 0
        ? 'rotate(45deg) translate(6px, 6px)'
        : index === 1
        ? 'translateX(100%) opacity(0)'
        : 'rotate(-45deg) translate(6px, -6px)'
      : 'none',
    opacity: isOpen && index === 1 ? 0 : 1,
  })

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
    animation: 'fadeIn 0.2s ease-in-out',
  }

  const menuStyle = {
    position: 'fixed',
    top: 0,
    right: isOpen ? 0 : '-100%',
    width: '280px',
    height: '100vh',
    backgroundColor: colors.cardBackground,
    boxShadow: colors.shadowLarge,
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    transition: 'right 0.3s ease-in-out',
    overflowY: 'auto',
  }

  const menuHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: `1px solid ${colors.border}`,
  }

  const navLinkStyle = (active) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    color: active ? colors.primary : colors.textPrimary,
    textDecoration: 'none',
    fontWeight: active ? 600 : 500,
    fontSize: '1rem',
    transition: 'background-color 0.2s ease-in-out',
    borderLeft: active ? `3px solid ${colors.primary}` : '3px solid transparent',
    gap: '0.75rem',
  })

  const sectionTitleStyle = {
    padding: '1rem 1.5rem 0.5rem',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={hamburgerStyle}
        aria-label="Menu"
        aria-expanded={isOpen}
      >
        <div style={barStyle(0)} />
        <div style={barStyle(1)} />
        <div style={barStyle(2)} />
      </button>

      {/* Overlay */}
      {isOpen && <div style={overlayStyle} onClick={() => setIsOpen(false)} />}

      {/* Slide-out Menu */}
      <nav ref={menuRef} style={menuStyle} role="navigation" aria-label="Mobile navigation">
        {/* Menu Header */}
        <div style={menuHeaderStyle}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: colors.primary, margin: 0 }}>
            📝 Menu
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: colors.textMuted,
            }}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Main Navigation */}
        <div style={{ flex: 1, paddingTop: '1rem' }}>
          <div style={sectionTitleStyle}>Main</div>
          <Link
            to="/"
            style={navLinkStyle(isActive('/'))}
            onMouseEnter={(e) => {
              if (!isActive('/')) e.currentTarget.style.backgroundColor = colors.hoverBackground
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>🏠</span>
            <span>Dashboard</span>
          </Link>

          <Link
            to="/notes"
            style={navLinkStyle(isActive('/notes'))}
            onMouseEnter={(e) => {
              if (!isActive('/notes')) e.currentTarget.style.backgroundColor = colors.hoverBackground
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>📋</span>
            <span>Notes</span>
          </Link>

          <Link
            to="/create"
            style={navLinkStyle(isActive('/create'))}
            onMouseEnter={(e) => {
              if (!isActive('/create')) e.currentTarget.style.backgroundColor = colors.hoverBackground
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>➕</span>
            <span>New Note</span>
          </Link>

          <div style={{ height: '1px', backgroundColor: colors.border, margin: '1rem 0' }} />

          <div style={sectionTitleStyle}>Organize</div>
          <Link
            to="/projects"
            style={navLinkStyle(isActive('/projects'))}
            onMouseEnter={(e) => {
              if (!isActive('/projects')) e.currentTarget.style.backgroundColor = colors.hoverBackground
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>📁</span>
            <span>Projects</span>
          </Link>

          <Link
            to="/spaces"
            style={navLinkStyle(isActive('/spaces'))}
            onMouseEnter={(e) => {
              if (!isActive('/spaces')) e.currentTarget.style.backgroundColor = colors.hoverBackground
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>🗂️</span>
            <span>Spaces</span>
          </Link>

          <div style={{ height: '1px', backgroundColor: colors.border, margin: '1rem 0' }} />

          <div style={sectionTitleStyle}>Insights</div>
          <Link
            to="/analytics"
            style={navLinkStyle(isActive('/analytics'))}
            onMouseEnter={(e) => {
              if (!isActive('/analytics')) e.currentTarget.style.backgroundColor = colors.hoverBackground
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>📊</span>
            <span>Analytics</span>
          </Link>
        </div>
      </nav>
    </>
  )
}

MobileMenu.propTypes = {
  session: PropTypes.object
}

export default MobileMenu
