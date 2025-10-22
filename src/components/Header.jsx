import PropTypes from 'prop-types'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useDarkMode } from '../contexts/DarkModeContext'

function Header({ session }) {
  const navigate = useNavigate()
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <header>
      <nav className="container">
        <h1>
          <Link to="/">MinimalNotes</Link>
        </h1>
        <ul>
          {session ? (
            <>
              <li>
                <Link to="/">Dashboard</Link>
              </li>
              <li>
                <Link to="/notes">Notes</Link>
              </li>
              <li>
                <Link to="/spaces">Spaces</Link>
              </li>
              <li>
                <Link to="/projects">Projects</Link>
              </li>
              <li>
                <Link to="/analytics">Analytics</Link>
              </li>
              <li>
                <Link to="/create">New Note</Link>
              </li>
              <li>
                <Link to="/settings">Settings</Link>
              </li>
              <li>
                <button
                  className="btn dark-mode-toggle"
                  onClick={toggleDarkMode}
                  aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDarkMode ? '☀️' : '🌙'}
                </button>
              </li>
              <li>
                <button className="btn" onClick={handleSignOut}>
                  Sign Out
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  )
}

Header.propTypes = {
  session: PropTypes.object
}

export default Header
