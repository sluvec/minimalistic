import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function Header({ session }) {
  const navigate = useNavigate()

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
                <Link to="/create">New Note</Link>
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

export default Header
