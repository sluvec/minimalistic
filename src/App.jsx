import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { supabase } from './lib/supabaseClient'
import { Toaster } from 'react-hot-toast'
import queryClient from './lib/queryClient'

// Lazy load devtools only in development
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-query-devtools').then((module) => ({
        default: module.ReactQueryDevtools,
      }))
    )
  : null

// Eagerly load critical components
import Header from './components/Header'
import ErrorBoundary from './components/ErrorBoundary'

// Lazy load pages for code splitting
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const CreateNote = lazy(() => import('./pages/CreateNote'))
const EditNote = lazy(() => import('./pages/EditNote'))
const Archive = lazy(() => import('./pages/Archive'))
const Projects = lazy(() => import('./pages/Projects'))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Settings = lazy(() => import('./pages/Settings'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Constants
import { TOAST_CONFIG } from './constants'

// Loading fallback component
function PageLoader() {
  return (
    <div className="loading" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '50vh',
      fontSize: '1.2rem',
      color: '#4a5568'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '1rem' }}>Loading...</div>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e2e8f0',
          borderTop: '3px solid #4299e1',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }} />
      </div>
    </div>
  )
}

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
      <QueryClientProvider client={queryClient}>
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
              <Suspense fallback={<PageLoader />}>
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
                  <Route
                    path="/projects"
                    element={session ? <Projects /> : <Navigate to="/login" />}
                  />
                  <Route
                    path="/project/:id"
                    element={session ? <ProjectDetail /> : <Navigate to="/login" />}
                  />
                  <Route
                    path="/analytics"
                    element={session ? <Analytics /> : <Navigate to="/login" />}
                  />
                  <Route
                    path="/settings"
                    element={session ? <Settings /> : <Navigate to="/login" />}
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
          </div>
        </Router>
        {/* React Query Devtools - only in development */}
        {ReactQueryDevtools && (
          <Suspense fallback={null}>
            <ReactQueryDevtools initialIsOpen={false} />
          </Suspense>
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
