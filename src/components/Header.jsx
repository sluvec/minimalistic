import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Link, useLocation } from 'react-router-dom'
import { useDarkModeColors } from '../hooks/useDarkModeColors'
import UserMenu from './UserMenu'
import MobileMenu from './MobileMenu'

function Header({ session }) {
  const colors = useDarkModeColors()
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isActive = (path) => location.pathname === path

  const navLinkStyle = (active) => ({
    padding: '0.5rem 1rem',
    color: active ? colors.primary : colors.textSecondary,
    textDecoration: 'none',
    fontWeight: active ? 600 : 500,
    fontSize: '0.95rem',
    borderRadius: '0.375rem',
    transition: 'all 0.2s ease-in-out',
    borderBottom: active ? `2px solid ${colors.primary}` : '2px solid transparent',
  })

  const headerStyle = {
    borderBottom: `1px solid ${colors.border}`,
    backgroundColor: colors.cardBackground,
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: colors.shadow,
  }

  const containerStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px',
  }

  const logoStyle = {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: colors.primary,
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  }

  const navStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    listStyle: 'none',
    margin: 0,
    padding: 0,
  }

  const rightSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  }

  const primaryButtonStyle = {
    padding: '0.5rem 1rem',
    backgroundColor: colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    fontWeight: 600,
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    textDecoration: 'none',
    display: 'inline-block',
  }

  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        {/* Logo */}
        <Link to="/" style={logoStyle}>
          <span>📝</span>
          <span>MinimalNotes</span>
        </Link>

        {/* Main Navigation */}
        {session ? (
          <>
            {isMobile ? (
              /* Mobile: Hamburger Menu */
              <div style={rightSectionStyle}>
                <MobileMenu session={session} />
                <UserMenu />
              </div>
            ) : (
              /* Desktop: Full Navigation */
              <>
                <nav role="navigation" aria-label="Main navigation">
                  <ul style={navStyle}>
                    <li>
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
                        Dashboard
                      </Link>
                    </li>
                    <li>
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
                        Notes
                      </Link>
                    </li>
                    <li>
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
                        Projects
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/checklists"
                        style={navLinkStyle(isActive('/checklists'))}
                        onMouseEnter={(e) => {
                          if (!isActive('/checklists')) e.currentTarget.style.backgroundColor = colors.hoverBackground
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                      >
                        Check Lists
                      </Link>
                    </li>
                    <li>
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
                        Spaces
                      </Link>
                    </li>
                    <li>
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
                        Analytics
                      </Link>
                    </li>
                  </ul>
                </nav>

                {/* Right Section: New Note Button + User Menu */}
                <div style={rightSectionStyle}>
                  <Link
                    to="/create"
                    style={primaryButtonStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.primaryHover
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      e.currentTarget.style.boxShadow = colors.shadow
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = colors.primary
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    + New Note
                  </Link>
                  <UserMenu />
                </div>
              </>
            )}
          </>
        ) : (
          <nav role="navigation" aria-label="Authentication">
            <ul style={{ ...navStyle, gap: '0.5rem' }}>
              <li>
                <Link to="/login" style={navLinkStyle(isActive('/login'))}>
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" style={navLinkStyle(isActive('/register'))}>
                  Register
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  )
}

Header.propTypes = {
  session: PropTypes.object
}

export default Header
