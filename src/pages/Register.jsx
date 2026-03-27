import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import { api } from '../api'
import './Auth.css'

export default function Register() {
  const { login, loginAsGuest } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', hourlyRate: '' })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { setErr('Name, email and password are required'); return }
    if (form.password.length < 6) { setErr('Password must be at least 6 characters'); return }
    setLoading(true); setErr('')
    try {
      const res = await api.post('/auth/register', {
        name: form.name, email: form.email, password: form.password,
        hourlyRate: parseFloat(form.hourlyRate) || 75,
      })
      login(res.user, res.token)
      navigate('/dashboard')
    } catch (e) {
      setErr(e.message)
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
          <h1>Create account</h1>
          <p>Start tracking your freelance work</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label>Full name</label>
            <input type="text" placeholder="Alex Johnson" value={form.name} onChange={set('name')} autoFocus />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="At least 6 characters" value={form.password} onChange={set('password')} />
          </div>
          <div className="field">
            <label>Default hourly rate (optional)</label>
            <div className="input-prefix-wrap">
              <span className="input-prefix">$</span>
              <input type="number" placeholder="75" value={form.hourlyRate} onChange={set('hourlyRate')} min="0" step="5" className="has-prefix" />
            </div>
          </div>
          {err && <div className="auth-error">{err}</div>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Create account'}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>
        <button className="btn-ghost-auth" onClick={handleGuest}>Try demo first — no signup</button>

        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  )
}
