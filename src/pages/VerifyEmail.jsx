import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import { api } from '../api'
import OtpInput from '../components/OtpInput'
import './Auth.css'

export default function VerifyEmail() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [err, setErr] = useState('')
  const [success, setSuccess] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (user?.emailVerified) navigate('/profile')
  }, [user])

  useEffect(() => {
    if (cooldown > 0) {
      const t = setTimeout(() => setCooldown(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [cooldown])

  const sendCode = async () => {
    setSending(true)
    setErr('')
    try {
      await api.post('/auth/send-email-otp', null)
      setSent(true)
      setCooldown(60)
      setSuccess('Verification code sent to your email.')
    } catch (e) {
      const match = e.message.match(/(\d+)s/)
      if (match) setCooldown(parseInt(match[1]))
      setErr(e.message || 'Failed to send code')
    } finally {
      setSending(false)
    }
  }

  const verify = async () => {
    if (otp.length !== 6) { setErr('Please enter the 6-digit code'); return }
    setLoading(true)
    setErr('')
    try {
      const res = await api.post('/auth/verify-email', { otp })
      updateUser(res.user)
      navigate('/profile')
    } catch (e) {
      setErr(e.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-brand">
          <span className="auth-logo-mark">FT</span>
          <span className="auth-logo-text">FreelanceTracker</span>
        </div>

        <div className="auth-header">
          <h1>Verify your email</h1>
          <p>Enter the 6-digit code sent to <strong style={{ color: 'var(--text)' }}>{user?.email}</strong></p>
        </div>

        {!sent ? (
          <>
            {success && <div className="auth-success">{success}</div>}
            {err && <div className="auth-error">{err}</div>}
            <button className="btn-primary" onClick={sendCode} disabled={sending || cooldown > 0} style={{ width: '100%' }}>
              {sending ? <span className="spinner" /> : cooldown > 0 ? `Resend in ${cooldown}s` : 'Send verification code'}
            </button>
          </>
        ) : (
          <>
            {success && <div className="auth-success">{success}</div>}
            <OtpInput value={otp} onChange={setOtp} length={6} />
            {err && <div className="auth-error">{err}</div>}
            <button className="btn-primary" onClick={verify} disabled={loading || otp.length !== 6} style={{ width: '100%' }}>
              {loading ? <span className="spinner" /> : 'Verify email'}
            </button>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <span>Didn't receive it?</span>
              <button onClick={sendCode} disabled={cooldown > 0} style={{ background: 'none', color: cooldown > 0 ? 'var(--text-dim)' : 'var(--accent)', fontWeight: 600, fontSize: '0.82rem' }}>
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
              </button>
            </div>
          </>
        )}

        <p className="auth-switch">
          <button onClick={() => navigate('/profile')} style={{ background: 'none', color: 'var(--accent)', fontSize: '0.85rem' }}>
            ← Back to profile
          </button>
        </p>
      </div>
    </div>
  )
}
