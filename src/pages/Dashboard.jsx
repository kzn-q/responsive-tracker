import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../App'
import { DEMO_STATS, DEMO_TIME_ENTRIES } from '../data/demoData'
import './Dashboard.css'

function money(val) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0)
}
function hoursDisplay(minutes) {
  const h = Math.floor(minutes / 60), m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function BurnRateWidget({ stats }) {
  const [targetIncome, setTargetIncome] = useState(() => parseInt(localStorage.getItem('ft_monthly_target') || '5000'))
  const [editing, setEditing] = useState(false)
  const [tmpTarget, setTmpTarget] = useState(targetIncome)

  const today = new Date()
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const dayOfMonth = today.getDate()
  const daysLeft = daysInMonth - dayOfMonth
  const earnedThisMonth = stats?.earnedThisMonth || 0
  const projectedTotal = daysLeft > 0 ? earnedThisMonth + (earnedThisMonth / dayOfMonth) * daysLeft : earnedThisMonth
  const pct = Math.min((projectedTotal / targetIncome) * 100, 100)
  const dailyRate = dayOfMonth > 0 ? earnedThisMonth / dayOfMonth : 0
  let trackColor = 'var(--red)'
  if (pct >= 60) trackColor = 'var(--orange)'
  if (pct >= 85) trackColor = 'var(--accent)'

  const saveTarget = () => {
    const val = parseInt(tmpTarget)
    if (val > 0) { setTargetIncome(val); localStorage.setItem('ft_monthly_target', val) }
    setEditing(false)
  }

  return (
    <div className="burn-rate-card">
      <div className="burn-header">
        <div>
          <h3>Burn Rate</h3>
          <p className="burn-subtitle">Monthly income projector</p>
        </div>
        {pct >= 85 && <span className="on-track-badge">🔥 On track</span>}
      </div>
      <div className="burn-main">
        <div className="burn-earned">
          <span className="burn-amount">{money(earnedThisMonth)}</span>
          <span className="burn-label">earned in {today.toLocaleString('default', { month: 'long' })}</span>
        </div>
        <div className="burn-daily">
          <span className="burn-daily-val">{money(dailyRate)}<span className="burn-unit">/day</span></span>
        </div>
      </div>
      <div className="burn-progress-wrap">
        <div className="burn-progress-track">
          <div className="burn-progress-fill" style={{ width: `${pct}%`, background: trackColor }} />
        </div>
        <div className="burn-progress-labels">
          <span>{Math.round(pct)}% of target</span>
          <span style={{ color: trackColor }}>{money(projectedTotal)} projected</span>
        </div>
      </div>
      <div className="burn-target-row">
        {editing ? (
          <div className="burn-target-edit">
            <span>$</span>
            <input type="number" value={tmpTarget} onChange={e => setTmpTarget(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && saveTarget()} />
            <button onClick={saveTarget}>Save</button>
            <button onClick={() => setEditing(false)} className="cancel">×</button>
          </div>
        ) : (
          <span className="burn-target-label" onClick={() => { setTmpTarget(targetIncome); setEditing(true) }}>
            Target: {money(targetIncome)}/month <span className="edit-hint">edit</span>
          </span>
        )}
        <span className="days-left">{daysLeft} days left</span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, isGuest } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [recentEntries, setRecentEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isGuest) {
      setStats(DEMO_STATS)
      setRecentEntries(DEMO_TIME_ENTRIES.slice(0, 5))
      setLoading(false)
      return
    }
    const fetchData = async () => {
      try {
        const [statsRes, entriesRes] = await Promise.all([
          api.get('/stats'),
          api.get('/time?limit=5'),
        ])
        setStats(statsRes)
        setRecentEntries(entriesRes.entries || [])
      } catch (e) {
        console.error('dashboard fetch failed:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [isGuest])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  if (loading) return <div className="dash-loading"><div className="spinner" /></div>

  const hasData = recentEntries.length > 0 || stats?.totalProjects > 0

  return (
    <div className="dashboard fade-in">
      <div className="dash-header">
        <div>
          <h1>{greeting}, {user?.name?.split(' ')[0] || 'there'} 👋</h1>
          <p className="dash-subtitle">
            {isGuest ? 'Exploring demo data — create an account to track your real work' : "Here's what's going on with your work"}
          </p>
        </div>
        {isGuest
          ? <Link to="/register" className="quick-log-btn">Create account →</Link>
          : <Link to="/time" className="quick-log-btn">+ Log Time</Link>
        }
      </div>

      {/* stat cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-label">This month</span>
          <span className="stat-val">{money(stats?.earnedThisMonth)}</span>
          <span className="stat-sub">{hoursDisplay(stats?.minutesThisMonth || 0)} logged</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Active projects</span>
          <span className="stat-val">{stats?.activeProjects || 0}</span>
          <span className="stat-sub">{stats?.totalProjects || 0} total</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Unpaid invoices</span>
          <span className="stat-val" style={{ color: stats?.unpaidAmount > 0 ? 'var(--orange)' : 'inherit' }}>
            {money(stats?.unpaidAmount)}
          </span>
          <span className="stat-sub">{stats?.unpaidCount || 0} outstanding</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg hourly rate</span>
          <span className="stat-val">{money(stats?.avgHourlyRate)}</span>
          <span className="stat-sub">across all projects</span>
        </div>
      </div>

      {/* Empty state for new users */}
      {!isGuest && !hasData && (
        <div className="dash-empty">
          <div className="dash-empty-inner">
            <div className="dash-empty-icon">🚀</div>
            <h2>Welcome to FreelanceTracker!</h2>
            <p>You're all set up. Start by creating your first project, then log some time against it.</p>
            <div className="dash-empty-actions">
              <Link to="/projects" className="dash-empty-btn primary">Create your first project</Link>
              <Link to="/time" className="dash-empty-btn secondary">Log some time</Link>
            </div>
          </div>
        </div>
      )}

      {hasData && (
        <div className="dash-bottom">
          <BurnRateWidget stats={stats} />
          <div className="recent-card">
            <div className="recent-header">
              <h3>Recent time entries</h3>
              <Link to="/time" className="see-all">See all →</Link>
            </div>
            {recentEntries.length === 0 ? (
              <div className="empty-recent">
                <p>No time logged yet</p>
                <Link to="/time" className="empty-action">Log your first entry</Link>
              </div>
            ) : (
              <div className="recent-list">
                {recentEntries.map(entry => (
                  <div key={entry._id} className="recent-entry">
                    <div className="entry-dot" style={{ background: entry.project?.color || 'var(--text-dim)' }} />
                    <div className="entry-info">
                      <span className="entry-desc">{entry.description || 'No description'}</span>
                      <span className="entry-project">{entry.project?.name || 'No project'}</span>
                    </div>
                    <div className="entry-meta">
                      <span className="entry-duration mono">{hoursDisplay(entry.minutes)}</span>
                      <span className="entry-date">{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
