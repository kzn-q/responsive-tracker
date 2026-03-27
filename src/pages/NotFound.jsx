import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import './NotFound.css'

export default function NotFound() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="notfound-page">
      <div className="notfound-card fade-in">
        <div className="notfound-brand">
          <span className="notfound-logo">FT</span>
          <span className="notfound-logo-text">FreelanceTracker</span>
        </div>
        <div className="notfound-code">404</div>
        <h1>Page not found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <div className="notfound-actions">
          <button onClick={() => navigate(-1)} className="nf-btn-ghost">← Go back</button>
          <Link to={user ? '/dashboard' : '/'} className="nf-btn-primary">
            {user ? 'Go to dashboard' : 'Go home'}
          </Link>
        </div>
      </div>
    </div>
  )
}
