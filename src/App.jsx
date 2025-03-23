import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabaseClient'

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

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <Router>
      <div className="app">
        <Header session={session} />
        <main className="container">
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
  )
}

export default App
