import { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useDarkMode } from '../contexts/DarkModeContext'
import { useDarkModeColors } from '../hooks/useDarkModeColors'

function UserMenu() {
  const navigate = useNavigate()
  const { theme, cycleTheme } = useDarkMode()
  const colors = useDarkModeColors()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
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

  const menuItemStyle = {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '0.75rem 1rem',
    backgroundColor: 'transparent',
    border: 'none',
    color: colors.textPrimary,
    cursor: 'pointer',
    fontSize: '0.95rem',
    textAlign: 'left',
    transition: 'background-color 0.15s ease-in-out',
    textDecoration: 'none',
    gap: '0.75rem',
  }

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: `2px solid ${colors.border}`,
          backgroundColor: colors.cardBackground,
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          fontSize: '1.25rem',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = colors.primary
          e.currentTarget.style.transform = 'scale(1.05)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = colors.border
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        👤
      </button>

      {isOpen && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 0.5rem)',
            width: '220px',
            backgroundColor: colors.cardBackground,
            border: `1px solid ${colors.border}`,
            borderRadius: '0.5rem',
            boxShadow: colors.shadowLarge,
            overflow: 'hidden',
            zIndex: 1000,
            animation: 'fadeIn 0.15s ease-in-out',
          }}
        >
          {/* Theme Toggle */}
          <button
            role="menuitem"
            onClick={() => {
              cycleTheme()
              setIsOpen(false)
            }}
            style={menuItemStyle}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hoverBackground}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span style={{ fontSize: '1.25rem' }}>
              {theme === 'light' ? '☀️' : theme === 'dim' ? '🌤️' : theme === 'dim2' ? '⛅' : '🌙'}
            </span>
            <span>
              {theme === 'light' ? 'Light Mode' : theme === 'dim' ? 'Dim Mode' : theme === 'dim2' ? 'Dim 2 Mode' : 'Dark Mode'}
            </span>
          </button>

          <div style={{ height: '1px', backgroundColor: colors.border, margin: '0.25rem 0' }} />

          {/* Settings */}
          <Link
            to="/settings"
            role="menuitem"
            onClick={() => setIsOpen(false)}
            style={menuItemStyle}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hoverBackground}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span style={{ fontSize: '1.25rem' }}>⚙️</span>
            <span>Settings</span>
          </Link>

          <div style={{ height: '1px', backgroundColor: colors.border, margin: '0.25rem 0' }} />

          {/* Sign Out */}
          <button
            role="menuitem"
            onClick={() => {
              setIsOpen(false)
              handleSignOut()
            }}
            style={{
              ...menuItemStyle,
              color: colors.danger,
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hoverBackground}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span style={{ fontSize: '1.25rem' }}>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default UserMenu
