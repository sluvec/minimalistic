import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
      <h2>404 - Page Not Found</h2>
      <p>The page you are looking for doesn't exist.</p>
      <Link to="/" className="btn" style={{ marginTop: '1rem' }}>
        Go Home
      </Link>
    </div>
  )
}

export default NotFound
