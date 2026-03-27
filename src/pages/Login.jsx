import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import { api } from '../api'
import './Auth.css'

export default function Login() {
  const { login, loginAsGuest } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) { setErr('Please fill in all fields'); return }
    setLoading(true); setErr('')
    try {
      const res = await api.post('/auth/login', { email, password })
      login(res.user, res.token)
      navigate('/dashboard')
    } catch (e) {
      setErr(e.message || 'Login failed')
    } finally { setLoading(false) }
  }

  const handleGuest = () => { loginAsGuest(); navigate('/dashboard') }

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-brand">
          <span className="auth-logo-mark">FT</span>
          <span className="auth-logo-text">FreelanceTracker</span>
        </div>
        <div className="auth-header">
          <h1>Welcome back</h1>
          <p>Sign in to your workspace</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoFocus autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
          </div>
          {err && <div className="auth-error">{err}</div>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Sign in'}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <button className="btn-ghost-auth" onClick={handleGuest}>
          Try demo — no signup required
        </button>

        <p className="auth-switch">Don't have an account? <Link to="/register">Create one</Link></p>
      </div>
    </div>
  )
}
