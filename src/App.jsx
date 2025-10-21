import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabaseClient'
import { Toaster } from 'react-hot-toast'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CreateNote from './pages/CreateNote'
import EditNote from './pages/EditNote'
import Archive from './pages/Archive'
import NotFound from './pages/NotFound'

// Components
import Header from './components/Header'
import ErrorBoundary from './components/ErrorBoundary'

// Constants
import { TOAST_CONFIG } from './constants'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) {
        setSession(session)
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (isMounted) {
          setSession(session)
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <ErrorBoundary>
      <Router>
        <a href="#main-content" className="skip-to-main">
          Skip to main content
        </a>
        <Toaster
          position={TOAST_CONFIG.POSITION}
          toastOptions={{
            duration: TOAST_CONFIG.DURATION_DEFAULT,
            style: TOAST_CONFIG.STYLE,
            success: TOAST_CONFIG.SUCCESS,
            error: TOAST_CONFIG.ERROR,
          }}
        />
        <div className="app">
          <Header session={session} />
          <main id="main-content" className="container" role="main">
            <Routes>
            <Route 
              path="/" 
              element={session ? <Dashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/login" 
              element={!session ? <Login /> : <Navigate to="/" />} 
            />
            <Route 
              path="/register" 
              element={!session ? <Register /> : <Navigate to="/" />} 
            />
            <Route 
              path="/create" 
              element={session ? <CreateNote /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/edit/:id" 
              element={session ? <EditNote /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/archive" 
              element={session ? <Archive /> : <Navigate to="/login" />} 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App
