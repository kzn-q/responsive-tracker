import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../App'
import './Settings.css'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'MAD', 'AED']
const TIMEZONES = ['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Africa/Casablanca', 'Asia/Dubai']

export default function Settings() {
  const { user, isGuest } = useAuth()
  const [saved, setSaved] = useState(false)

  const [prefs, setPrefs] = useState({
    currency: localStorage.getItem('ft_currency') || 'USD',
    timezone: localStorage.getItem('ft_timezone') || 'UTC',
    weekStart: localStorage.getItem('ft_weekstart') || 'monday',
    emailNotifs: localStorage.getItem('ft_email_notifs') !== 'false',
    reminderNotifs: localStorage.getItem('ft_reminder_notifs') !== 'false',
    theme: 'dark',
  })

  const set = (k, v) => setPrefs(p => ({ ...p, [k]: v }))

  const savePrefs = () => {
    if (isGuest) return
    localStorage.setItem('ft_currency', prefs.currency)
    localStorage.setItem('ft_timezone', prefs.timezone)
    localStorage.setItem('ft_weekstart', prefs.weekStart)
    localStorage.setItem('ft_email_notifs', prefs.emailNotifs)
    localStorage.setItem('ft_reminder_notifs', prefs.reminderNotifs)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="settings-page fade-in">
      <div className="settings-header">
        <h1>Settings</h1>
        <p className="settings-sub">Manage your preferences and workspace</p>
      </div>

      {isGuest && (
        <div className="settings-guest-notice">
          <span>⚠️</span>
          <span>Settings won't be saved in demo mode. <Link to="/register">Create an account</Link> to save your preferences.</span>
        </div>
      )}

      <div className="settings-sections">

        {/* Preferences */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h2>Preferences</h2>
            <span className="settings-badge">Workspace</span>
          </div>

          <div className="settings-row">
            <div className="settings-row-info">
              <span className="settings-row-label">Currency</span>
              <span className="settings-row-sub">Used in earnings and invoices</span>
            </div>
            <select className="settings-select" value={prefs.currency} onChange={e => set('currency', e.target.value)}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="settings-row">
            <div className="settings-row-info">
              <span className="settings-row-label">Timezone</span>
              <span className="settings-row-sub">Affects date/time display</span>
            </div>
            <select className="settings-select" value={prefs.timezone} onChange={e => set('timezone', e.target.value)}>
              {TIMEZONES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="settings-row">
            <div className="settings-row-info">
              <span className="settings-row-label">Week starts on</span>
              <span className="settings-row-sub">Calendar and report weeks</span>
            </div>
            <select className="settings-select" value={prefs.weekStart} onChange={e => set('weekStart', e.target.value)}>
              <option value="monday">Monday</option>
              <option value="sunday">Sunday</option>
            </select>
          </div>
        </div>

        {/* Notifications */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h2>Notifications</h2>
            <span className="settings-badge">Alerts</span>
          </div>

          <div className="settings-row">
            <div className="settings-row-info">
              <span className="settings-row-label">Email notifications</span>
              <span className="settings-row-sub">Invoice updates, payments, security</span>
            </div>
            <button className={`toggle-btn ${prefs.emailNotifs ? 'on' : ''}`} onClick={() => set('emailNotifs', !prefs.emailNotifs)}>
              <span className="toggle-thumb" />
            </button>
          </div>

          <div className="settings-row">
            <div className="settings-row-info">
              <span className="settings-row-label">Daily reminders</span>
              <span className="settings-row-sub">Remind me to log time each day</span>
            </div>
            <button className={`toggle-btn ${prefs.reminderNotifs ? 'on' : ''}`} onClick={() => set('reminderNotifs', !prefs.reminderNotifs)}>
              <span className="toggle-thumb" />
            </button>
          </div>
        </div>

        {/* Appearance */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h2>Appearance</h2>
            <span className="settings-badge">Theme</span>
          </div>
          <div className="theme-options">
            <div className="theme-option active">
              <div className="theme-preview dark-preview" />
              <span>Dark</span>
              <span className="theme-check">✓</span>
            </div>
            <div className="theme-option coming-soon">
              <div className="theme-preview light-preview" />
              <span>Light</span>
              <span className="coming-soon-tag">Soon</span>
            </div>
          </div>
        </div>

        {/* Account */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h2>Account</h2>
            <span className="settings-badge">Profile & Security</span>
          </div>
          <div className="settings-links">
            {!isGuest ? (
              <>
                <Link to="/profile" className="settings-link-row">
                  <span>Edit profile</span><span className="slr-arrow">→</span>
                </Link>
                <Link to="/profile" className="settings-link-row">
                  <span>Change password</span><span className="slr-arrow">→</span>
                </Link>
                <Link to="/profile?tab=verify" className="settings-link-row">
                  <span>Verification settings</span><span className="slr-arrow">→</span>
                </Link>
                <Link to="/profile?tab=security" className="settings-link-row danger">
                  <span>Delete account</span><span className="slr-arrow">→</span>
                </Link>
              </>
            ) : (
              <Link to="/register" className="settings-link-row accent">
                <span>Create an account to save settings</span><span className="slr-arrow">→</span>
              </Link>
            )}
          </div>
        </div>

        {/* Save button */}
        {!isGuest && (
          <button className={`settings-save-btn ${saved ? 'saved' : ''}`} onClick={savePrefs}>
            {saved ? '✓ Saved!' : 'Save preferences'}
          </button>
        )}
      </div>
    </div>
  )
}
