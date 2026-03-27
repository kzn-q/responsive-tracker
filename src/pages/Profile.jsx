import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import { api } from '../api'
import { useToast } from '../hooks/useToast'
import OtpInput from '../components/OtpInput'
import './Profile.css'

function Toast({ toasts, remove }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`} onClick={() => remove(t.id)}>
          <span>{t.type === 'success' ? '✓' : '✕'}</span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  )
}

export default function Profile() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const { toasts, addToast, removeToast } = useToast()
  const fileInputRef = useRef()

  const [activeTab, setActiveTab] = useState('profile') // profile | security | verify
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showEmailVerify, setShowEmailVerify] = useState(false)
  const [showPhoneVerify, setShowPhoneVerify] = useState(false)

  const [form, setForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    hourlyRate: user?.hourlyRate || 75,
  })

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [deletePassword, setDeletePassword] = useState('')

  // Email OTP state
  const [emailOtp, setEmailOtp] = useState('')
  const [emailOtpSending, setEmailOtpSending] = useState(false)
  const [emailCooldown, setEmailCooldown] = useState(0)
  const [emailOtpSent, setEmailOtpSent] = useState(false)
  const [emailOtpVerifying, setEmailOtpVerifying] = useState(false)

  // Phone OTP state
  const [phoneInput, setPhoneInput] = useState(user?.phoneNumber || '')
  const [phoneOtp, setPhoneOtp] = useState('')
  const [phoneOtpSending, setPhoneOtpSending] = useState(false)
  const [phoneCooldown, setPhoneCooldown] = useState(0)
  const [phoneOtpSent, setPhoneOtpSent] = useState(false)
  const [phoneOtpVerifying, setPhoneOtpVerifying] = useState(false)

  // Cooldown timers
  useEffect(() => {
    if (emailCooldown > 0) {
      const t = setTimeout(() => setEmailCooldown(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [emailCooldown])

  useEffect(() => {
    if (phoneCooldown > 0) {
      const t = setTimeout(() => setPhoneCooldown(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [phoneCooldown])

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  const securityScore = () => {
    let score = 0
    if (user?.emailVerified) score += 40
    if (user?.phoneVerified) score += 30
    if (user?.profileImage) score += 10
    if (user?.username) score += 10
    score += 10 // always have password
    return score
  }

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      addToast('Image must be under 2MB', 'error')
      return
    }
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const base64 = ev.target.result
      try {
        const res = await api.put('/auth/profile', { profileImage: base64 })
        updateUser(res.user)
        addToast('Profile photo updated!')
      } catch (err) {
        addToast(err.message || 'Failed to update photo', 'error')
      }
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = async () => {
    try {
      const res = await api.put('/auth/profile', { profileImage: null })
      updateUser(res.user)
      addToast('Profile photo removed')
    } catch (err) {
      addToast(err.message || 'Failed to remove photo', 'error')
    }
  }

  const handleProfileSave = async () => {
    setLoading(true)
    try {
      const res = await api.put('/auth/profile', {
        name: form.name,
        username: form.username,
        email: form.email,
        phoneNumber: form.phoneNumber,
        hourlyRate: parseFloat(form.hourlyRate),
      })
      updateUser(res.user)
      setEditMode(false)
      addToast('Profile updated successfully!')
    } catch (err) {
      addToast(err.message || 'Update failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword) {
      addToast('All fields are required', 'error')
      return
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      addToast('Passwords do not match', 'error')
      return
    }
    if (pwForm.newPassword.length < 6) {
      addToast('Password must be at least 6 characters', 'error')
      return
    }
    setLoading(true)
    try {
      await api.put('/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      })
      setShowPasswordModal(false)
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      addToast('Password changed successfully!')
    } catch (err) {
      addToast(err.message || 'Failed to change password', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      addToast('Please enter your password', 'error')
      return
    }
    setLoading(true)
    try {
      await api.delete('/auth/account', { password: deletePassword })
      logout()
      navigate('/login')
    } catch (err) {
      addToast(err.message || 'Failed to delete account', 'error')
    } finally {
      setLoading(false)
    }
  }

  const sendEmailOtp = async () => {
    setEmailOtpSending(true)
    try {
      await api.post('/auth/send-email-otp', null)
      setEmailOtpSent(true)
      setEmailCooldown(60)
      addToast('Verification code sent to your email!')
    } catch (err) {
      if (err.message.includes('wait')) {
        const match = err.message.match(/(\d+)s/)
        if (match) setEmailCooldown(parseInt(match[1]))
      }
      addToast(err.message || 'Failed to send code', 'error')
    } finally {
      setEmailOtpSending(false)
    }
  }

  const verifyEmailOtp = async () => {
    if (emailOtp.length !== 6) {
      addToast('Please enter the 6-digit code', 'error')
      return
    }
    setEmailOtpVerifying(true)
    try {
      const res = await api.post('/auth/verify-email', { otp: emailOtp })
      updateUser(res.user)
      setShowEmailVerify(false)
      setEmailOtp('')
      setEmailOtpSent(false)
      addToast('Email verified successfully! ✓')
    } catch (err) {
      addToast(err.message || 'Verification failed', 'error')
    } finally {
      setEmailOtpVerifying(false)
    }
  }

  const sendPhoneOtp = async () => {
    if (!phoneInput) {
      addToast('Please enter a phone number', 'error')
      return
    }
    setPhoneOtpSending(true)
    try {
      await api.post('/auth/send-phone-otp', { phoneNumber: phoneInput })
      setPhoneOtpSent(true)
      setPhoneCooldown(60)
      addToast('Verification code sent to your phone!')
    } catch (err) {
      if (err.message.includes('wait')) {
        const match = err.message.match(/(\d+)s/)
        if (match) setPhoneCooldown(parseInt(match[1]))
      }
      addToast(err.message || 'Failed to send code', 'error')
    } finally {
      setPhoneOtpSending(false)
    }
  }

  const verifyPhoneOtp = async () => {
    if (phoneOtp.length !== 6) {
      addToast('Please enter the 6-digit code', 'error')
      return
    }
    setPhoneOtpVerifying(true)
    try {
      const res = await api.post('/auth/verify-phone', { otp: phoneOtp })
      updateUser(res.user)
      setShowPhoneVerify(false)
      setPhoneOtp('')
      setPhoneOtpSent(false)
      addToast('Phone verified successfully! ✓')
    } catch (err) {
      addToast(err.message || 'Verification failed', 'error')
    } finally {
      setPhoneOtpVerifying(false)
    }
  }

  const score = securityScore()

  return (
    <div className="profile-page fade-in">
      <Toast toasts={toasts} remove={removeToast} />

      {/* Header */}
      <div className="profile-header">
        <div className="profile-avatar-section">
          <div className="profile-avatar-wrap">
            {user?.profileImage
              ? <img src={user.profileImage} alt="avatar" className="profile-avatar-img" />
              : <div className="profile-avatar-initials">{initials}</div>
            }
            <button className="avatar-camera-btn" onClick={() => fileInputRef.current?.click()} title="Change photo">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
          </div>
          <div className="profile-header-info">
            <h1 className="profile-name">{user?.name}</h1>
            {user?.username && <span className="profile-username">@{user.username}</span>}
            <div className="profile-badges">
              <span className={`badge ${user?.emailVerified ? 'badge-success' : 'badge-warn'}`}>
                {user?.emailVerified ? '✓ Email verified' : '⚠ Email unverified'}
              </span>
              {user?.phoneNumber && (
                <span className={`badge ${user?.phoneVerified ? 'badge-success' : 'badge-warn'}`}>
                  {user?.phoneVerified ? '✓ Phone verified' : '⚠ Phone unverified'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="profile-header-actions">
          {user?.profileImage && (
            <button className="btn-ghost btn-sm" onClick={handleRemovePhoto}>Remove photo</button>
          )}
          <button className="btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()}>
            Change photo
          </button>
          <button className="btn-primary btn-sm" onClick={() => { setEditMode(true); setActiveTab('profile') }}>
            Edit profile
          </button>
        </div>
      </div>

      {/* Tab nav */}
      <div className="profile-tabs">
        {['profile', 'security', 'verify'].map(tab => (
          <button
            key={tab}
            className={`profile-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => { setActiveTab(tab); setEditMode(false) }}
          >
            {tab === 'profile' ? 'Profile' : tab === 'security' ? 'Security' : 'Verification'}
          </button>
        ))}
      </div>

      <div className="profile-body">

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="profile-grid">
            <div className="profile-card main-info-card">
              <div className="card-header">
                <h2>Personal Information</h2>
                {!editMode
                  ? <button className="btn-ghost btn-sm" onClick={() => setEditMode(true)}>Edit</button>
                  : <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-ghost btn-sm" onClick={() => setEditMode(false)}>Cancel</button>
                      <button className="btn-accent btn-sm" onClick={handleProfileSave} disabled={loading}>
                        {loading ? <span className="spinner" /> : 'Save changes'}
                      </button>
                    </div>
                }
              </div>

              {editMode ? (
                <div className="edit-form">
                  <div className="field">
                    <label>Full name</label>
                    <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Alex Johnson" />
                  </div>
                  <div className="field">
                    <label>Username</label>
                    <div className="input-prefix-wrap">
                      <span className="input-prefix">@</span>
                      <input className="has-prefix" value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} placeholder="alexjohnson" />
                    </div>
                  </div>
                  <div className="field">
                    <label>Email address</label>
                    <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="you@example.com" />
                    {form.email !== user?.email && (
                      <p className="field-note">⚠ Changing your email will require re-verification</p>
                    )}
                  </div>
                  <div className="field">
                    <label>Phone number</label>
                    <input value={form.phoneNumber} onChange={e => setForm(p => ({ ...p, phoneNumber: e.target.value }))} placeholder="+1 (555) 000-0000" />
                  </div>
                  <div className="field">
                    <label>Hourly rate</label>
                    <div className="input-prefix-wrap">
                      <span className="input-prefix">$</span>
                      <input type="number" className="has-prefix" value={form.hourlyRate} onChange={e => setForm(p => ({ ...p, hourlyRate: e.target.value }))} min="0" step="5" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="info-grid">
                  <InfoRow label="Full name" value={user?.name} />
                  <InfoRow label="Username" value={user?.username ? `@${user.username}` : '—'} />
                  <InfoRow label="Email" value={user?.email} />
                  <InfoRow label="Phone" value={user?.phoneNumber || '—'} />
                  <InfoRow label="Hourly rate" value={`$${user?.hourlyRate}/hr`} mono />
                  <InfoRow label="Member since" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'} />
                </div>
              )}
            </div>

            <div className="profile-sidebar-cards">
              {/* Quick actions */}
              <div className="profile-card">
                <div className="card-header"><h2>Account Actions</h2></div>
                <div className="action-list">
                  <ActionBtn icon="🔑" label="Change password" sub="Update your login password" onClick={() => setShowPasswordModal(true)} />
                  <ActionBtn icon="✉️" label="Verify email" sub={user?.emailVerified ? 'Email is verified' : 'Complete email verification'} onClick={() => { setActiveTab('verify'); setShowEmailVerify(true) }} accent={!user?.emailVerified} disabled={user?.emailVerified} />
                  <ActionBtn icon="📱" label="Verify phone" sub={user?.phoneVerified ? 'Phone is verified' : 'Add phone verification'} onClick={() => { setActiveTab('verify'); setShowPhoneVerify(true) }} accent={!user?.phoneVerified} disabled={user?.phoneVerified} />
                  <ActionBtn icon="→" label="Log out" sub="Sign out of your account" onClick={() => { logout(); navigate('/login') }} />
                  <ActionBtn icon="🗑" label="Delete account" sub="Permanently delete account" onClick={() => setShowDeleteModal(true)} danger />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === 'security' && (
          <div className="profile-grid">
            <div className="profile-card">
              <div className="card-header"><h2>Account Security</h2></div>

              {/* Security score */}
              <div className="security-score-wrap">
                <div className="security-score-header">
                  <span className="security-label">Trust Level</span>
                  <span className="security-pct">{score}%</span>
                </div>
                <div className="security-bar-track">
                  <div className="security-bar-fill" style={{ width: `${score}%`, background: score >= 80 ? 'var(--accent)' : score >= 50 ? 'var(--orange)' : 'var(--red)' }} />
                </div>
                <p className="security-note">
                  {score >= 80 ? 'Excellent — your account is well secured.' : score >= 50 ? 'Good — consider verifying your phone for extra security.' : 'Low — verify your email and phone to secure your account.'}
                </p>
              </div>

              <div className="security-checklist">
                <SecurityItem label="Email verified" ok={user?.emailVerified} sub={user?.emailVerifiedAt ? `Verified ${new Date(user.emailVerifiedAt).toLocaleDateString()}` : 'Your email is not verified'} action={!user?.emailVerified ? () => { setActiveTab('verify'); setShowEmailVerify(true) } : null} actionLabel="Verify now" />
                <SecurityItem label="Phone verified" ok={user?.phoneVerified} sub={user?.phoneVerifiedAt ? `Verified ${new Date(user.phoneVerifiedAt).toLocaleDateString()}` : user?.phoneNumber ? 'Your phone is not verified' : 'No phone number added'} action={!user?.phoneVerified ? () => { setActiveTab('verify'); setShowPhoneVerify(true) } : null} actionLabel={user?.phoneNumber ? 'Verify now' : 'Add & verify'} />
                <SecurityItem label="Password set" ok={true} sub="Your account is password protected" />
                <SecurityItem label="Profile complete" ok={!!user?.profileImage && !!user?.username} sub={user?.profileImage && user?.username ? 'Profile photo and username set' : 'Add a profile photo and username'} action={!user?.profileImage || !user?.username ? () => setEditMode(true) : null} actionLabel="Complete profile" />
              </div>
            </div>

            <div className="profile-card">
              <div className="card-header"><h2>Recent Activity</h2></div>
              <div className="activity-list">
                <ActivityRow icon="🔐" label="Last login" value={user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'This session'} />
                <ActivityRow icon="📅" label="Account created" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'} />
                {user?.emailVerifiedAt && <ActivityRow icon="✉️" label="Email verified" value={new Date(user.emailVerifiedAt).toLocaleDateString()} />}
                {user?.phoneVerifiedAt && <ActivityRow icon="📱" label="Phone verified" value={new Date(user.phoneVerifiedAt).toLocaleDateString()} />}
              </div>

              <div style={{ marginTop: 24 }}>
                <button className="btn-secondary" style={{ width: '100%' }} onClick={() => setShowPasswordModal(true)}>
                  Change password
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VERIFICATION TAB */}
        {activeTab === 'verify' && (
          <div className="verify-grid">

            {/* Email Verification Card */}
            <div className="profile-card verify-card">
              <div className="verify-icon-wrap">
                <span className="verify-icon">✉️</span>
              </div>
              <h2>Email Verification</h2>
              <p className="verify-desc">Verify your email address to secure your account and receive important notifications.</p>

              {user?.emailVerified ? (
                <div className="verified-badge-wrap">
                  <div className="verified-badge">
                    <span className="verified-check">✓</span>
                    <div>
                      <div className="verified-title">Email Verified</div>
                      <div className="verified-sub">{user.email}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="verify-status-row">
                    <div className="status-dot warn" />
                    <span className="status-text">Not verified — {user?.email}</span>
                  </div>

                  {!emailOtpSent ? (
                    <button className="btn-accent verify-btn" onClick={sendEmailOtp} disabled={emailOtpSending || emailCooldown > 0}>
                      {emailOtpSending ? <span className="spinner" /> : emailCooldown > 0 ? `Resend in ${emailCooldown}s` : 'Send verification code'}
                    </button>
                  ) : (
                    <div className="otp-section">
                      <p className="otp-sent-msg">We sent a 6-digit code to <strong>{user?.email}</strong></p>
                      <OtpInput value={emailOtp} onChange={setEmailOtp} length={6} />
                      <button className="btn-accent verify-btn" onClick={verifyEmailOtp} disabled={emailOtpVerifying || emailOtp.length !== 6}>
                        {emailOtpVerifying ? <span className="spinner" /> : 'Verify email'}
                      </button>
                      <div className="resend-row">
                        <span>Didn't get the code?</span>
                        <button className="resend-btn" onClick={sendEmailOtp} disabled={emailCooldown > 0}>
                          {emailCooldown > 0 ? `Resend in ${emailCooldown}s` : 'Resend code'}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Phone Verification Card */}
            <div className="profile-card verify-card">
              <div className="verify-icon-wrap">
                <span className="verify-icon">📱</span>
              </div>
              <h2>Phone Verification</h2>
              <p className="verify-desc">Add and verify your phone number for enhanced account security and recovery.</p>

              {user?.phoneVerified ? (
                <div className="verified-badge-wrap">
                  <div className="verified-badge">
                    <span className="verified-check">✓</span>
                    <div>
                      <div className="verified-title">Phone Verified</div>
                      <div className="verified-sub">{user.phoneNumber}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="verify-status-row">
                    <div className="status-dot warn" />
                    <span className="status-text">{user?.phoneNumber ? `Not verified — ${user.phoneNumber}` : 'No phone number added'}</span>
                  </div>

                  {!phoneOtpSent ? (
                    <div style={{ width: '100%' }}>
                      <div className="field" style={{ marginBottom: 12 }}>
                        <label>Phone number</label>
                        <input
                          type="tel"
                          value={phoneInput}
                          onChange={e => setPhoneInput(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                      <button className="btn-accent verify-btn" onClick={sendPhoneOtp} disabled={phoneOtpSending || phoneCooldown > 0 || !phoneInput}>
                        {phoneOtpSending ? <span className="spinner" /> : phoneCooldown > 0 ? `Resend in ${phoneCooldown}s` : 'Send verification code'}
                      </button>
                    </div>
                  ) : (
                    <div className="otp-section">
                      <p className="otp-sent-msg">We sent a 6-digit code to <strong>{phoneInput}</strong></p>
                      <OtpInput value={phoneOtp} onChange={setPhoneOtp} length={6} />
                      <button className="btn-accent verify-btn" onClick={verifyPhoneOtp} disabled={phoneOtpVerifying || phoneOtp.length !== 6}>
                        {phoneOtpVerifying ? <span className="spinner" /> : 'Verify phone'}
                      </button>
                      <div className="resend-row">
                        <span>Didn't get the code?</span>
                        <button className="resend-btn" onClick={sendPhoneOtp} disabled={phoneCooldown > 0}>
                          {phoneCooldown > 0 ? `Resend in ${phoneCooldown}s` : 'Resend code'}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <Modal title="Change password" onClose={() => { setShowPasswordModal(false); setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' }) }}>
          <div className="modal-form">
            <div className="field">
              <label>Current password</label>
              <input type="password" value={pwForm.currentPassword} onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} placeholder="••••••••" autoFocus />
            </div>
            <div className="field">
              <label>New password</label>
              <input type="password" value={pwForm.newPassword} onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} placeholder="At least 6 characters" />
            </div>
            <div className="field">
              <label>Confirm new password</label>
              <input type="password" value={pwForm.confirmPassword} onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))} placeholder="••••••••" />
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn-ghost" onClick={() => setShowPasswordModal(false)}>Cancel</button>
            <button className="btn-accent" onClick={handleChangePassword} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Update password'}
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <Modal title="Delete account" onClose={() => { setShowDeleteModal(false); setDeletePassword('') }} danger>
          <p className="modal-warn">This action is <strong>permanent and irreversible</strong>. All your projects, time logs, and invoices will be deleted.</p>
          <div className="field" style={{ marginTop: 16 }}>
            <label>Confirm with your password</label>
            <input type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} placeholder="Your current password" autoFocus />
          </div>
          <div className="modal-actions">
            <button className="btn-ghost" onClick={() => setShowDeleteModal(false)}>Cancel</button>
            <button className="btn-danger" onClick={handleDeleteAccount} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Delete my account'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function InfoRow({ label, value, mono }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className={`info-value ${mono ? 'mono' : ''}`}>{value || '—'}</span>
    </div>
  )
}

function ActionBtn({ icon, label, sub, onClick, danger, accent, disabled }) {
  return (
    <button className={`action-btn ${danger ? 'action-btn-danger' : accent ? 'action-btn-accent' : ''} ${disabled ? 'action-btn-disabled' : ''}`} onClick={disabled ? undefined : onClick}>
      <span className="action-btn-icon">{icon}</span>
      <div className="action-btn-text">
        <span className="action-btn-label">{label}</span>
        <span className="action-btn-sub">{sub}</span>
      </div>
      {!disabled && <span className="action-btn-arrow">→</span>}
      {disabled && <span className="action-btn-done">✓</span>}
    </button>
  )
}

function SecurityItem({ label, ok, sub, action, actionLabel }) {
  return (
    <div className="security-item">
      <div className={`security-item-dot ${ok ? 'ok' : 'warn'}`} />
      <div className="security-item-info">
        <span className="security-item-label">{label}</span>
        <span className="security-item-sub">{sub}</span>
      </div>
      {action && (
        <button className="security-item-action" onClick={action}>{actionLabel}</button>
      )}
    </div>
  )
}

function ActivityRow({ icon, label, value }) {
  return (
    <div className="activity-row">
      <span className="activity-icon">{icon}</span>
      <span className="activity-label">{label}</span>
      <span className="activity-value mono">{value}</span>
    </div>
  )
}

function Modal({ title, onClose, children, danger }) {
  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`modal-box fade-in ${danger ? 'modal-box-danger' : ''}`}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
