import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../App'
import { DEMO_TIME_ENTRIES, DEMO_PROJECTS } from '../data/demoData'
import { api } from '../api'
import './TimeLog.css'

function hoursDisplay(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${m.toString().padStart(2,'0')}m`
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' })
}

// Live timer component - tracks time as you work
function LiveTimer({ projects, onSave }) {
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0) // seconds
  const [desc, setDesc] = useState('')
  const [projectId, setProjectId] = useState('')
  const intervalRef = useRef(null)
  const startTimeRef = useRef(null)

  useEffect(() => {
    // persist timer across page refresh
    const saved = sessionStorage.getItem('ft_timer')
    if (saved) {
      try {
        const { startTime, desc: d, projectId: p } = JSON.parse(saved)
        if (startTime) {
          startTimeRef.current = startTime
          setDesc(d || '')
          setProjectId(p || '')
          setRunning(true)
          setElapsed(Math.floor((Date.now() - startTime) / 1000))
        }
      } catch (err) {
        console.error('Invalid saved timer:', err)
        sessionStorage.removeItem('ft_timer')
      }
    }

    return () => clearInterval(intervalRef.current)
  }, [])

  useEffect(() => {
    if (running && startTimeRef.current) {
      intervalRef.current = setInterval(() => {
        const secs = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setElapsed(secs)
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }

    return () => clearInterval(intervalRef.current)
  }, [running])

  const startTimer = () => {
    const now = Date.now()
    startTimeRef.current = now
    setElapsed(0)
    setRunning(true)

    sessionStorage.setItem('ft_timer', JSON.stringify({
      startTime: now,
      desc,
      projectId
    }))
  }

  const stopAndSave = async () => {
    setRunning(false)
    sessionStorage.removeItem('ft_timer')
    clearInterval(intervalRef.current)

    const minutes = Math.max(1, Math.round(elapsed / 60))

    try {
      await onSave({
        description: desc,
        projectId: projectId || undefined,
        minutes,
        date: new Date().toISOString(),
      })
      setDesc('')
      setProjectId('')
      setElapsed(0)
      startTimeRef.current = null
    } catch (e) {
      console.error('save failed:', e)
      alert('Failed to save entry: ' + e.message)
    }
  }

  const discard = () => {
    setRunning(false)
    setElapsed(0)
    setDesc('')
    setProjectId('')
    startTimeRef.current = null
    sessionStorage.removeItem('ft_timer')
    clearInterval(intervalRef.current)
  }

  const formatElapsed = (s) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`
  }

  return (
    <div className={`timer-bar ${running ? 'active' : ''}`}>
      <div className="timer-display">
        <span className={`timer-clock mono ${running ? 'ticking' : ''}`}>
          {formatElapsed(elapsed)}
        </span>
        {running && <span className="timer-live-dot" />}
      </div>

      <input
        className="timer-desc"
        placeholder="What are you working on?"
        value={desc}
        onChange={e => {
          const newDesc = e.target.value
          setDesc(newDesc)

          if (running && startTimeRef.current) {
            sessionStorage.setItem('ft_timer', JSON.stringify({
              startTime: startTimeRef.current,
              desc: newDesc,
              projectId
            }))
          }
        }}
      />

      <select
        className="timer-project"
        value={projectId}
        onChange={e => {
          const newProjectId = e.target.value
          setProjectId(newProjectId)

          if (running && startTimeRef.current) {
            sessionStorage.setItem('ft_timer', JSON.stringify({
              startTime: startTimeRef.current,
              desc,
              projectId: newProjectId
            }))
          }
        }}
      >
        <option value="">No project</option>
        {projects.map(p => (
          <option key={p._id} value={p._id}>{p.name}</option>
        ))}
      </select>

      {running ? (
        <div className="timer-btns">
          <button className="timer-btn stop" onClick={stopAndSave}>Save entry</button>
          <button className="timer-btn discard" onClick={discard}>Discard</button>
        </div>
      ) : (
        <button className="timer-btn start" onClick={startTimer}>▶ Start timer</button>
      )}
    </div>
  )
}

// Manual entry modal
function AddEntryModal({ projects, onSave, onClose }) {
  const [form, setForm] = useState({
    description: '',
    projectId: '',
    hours: '',
    minutes: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const set = f => e => setForm(p => ({...p, [f]: e.target.value}))

  const handleSave = async () => {
    const totalMins = (parseInt(form.hours || 0) * 60) + parseInt(form.minutes || 0)
    if (totalMins <= 0) { setErr('Please enter some time'); return }

    setSaving(true)
    try {
      await onSave({
        description: form.description,
        projectId: form.projectId || undefined,
        minutes: totalMins,
        date: form.date,
      })
      onClose()
    } catch (e) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fade-in" style={{maxWidth:'440px'}}>
        <div className="modal-header">
          <h2>Add time entry</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>Description</label>
            <input type="text" value={form.description} onChange={set('description')}
              placeholder="What did you work on?" autoFocus />
          </div>

          <div className="field">
            <label>Project</label>
            <select value={form.projectId} onChange={set('projectId')}>
              <option value="">No project</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>

          <div className="form-row">
            <div className="field">
              <label>Hours</label>
              <input type="number" value={form.hours} onChange={set('hours')} min="0" max="23" placeholder="0" />
            </div>
            <div className="field">
              <label>Minutes</label>
              <input type="number" value={form.minutes} onChange={set('minutes')} min="0" max="59" placeholder="0" />
            </div>
          </div>

          <div className="field">
            <label>Date</label>
            <input type="date" value={form.date} onChange={set('date')} />
          </div>

          {err && <div className="form-error">{err}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-accent" onClick={handleSave} disabled={saving}>
            {saving ? <span className="spinner" /> : 'Save entry'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TimeLog() {
  const { isGuest } = useAuth()
  const [entries, setEntries] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filterProject, setFilterProject] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const LIMIT = 20

  useEffect(() => {
    if (isGuest) {
      setEntries(DEMO_TIME_ENTRIES)
      setProjects(DEMO_PROJECTS.filter(p => p.status === 'active'))
      setLoading(false)
      return
    }
    loadInitial()
  }, [filterProject, isGuest])

  const loadInitial = async () => {
    setLoading(true)
    setPage(1)
    try {
      const [entriesRes, projRes] = await Promise.all([
        api.get(`/time?limit=${LIMIT}&page=1${filterProject ? `&project=${filterProject}` : ''}`),
        api.get('/projects'),
      ])
      setEntries(entriesRes.entries || [])
      setHasMore(entriesRes.hasMore || false)
      setProjects(projRes.projects?.filter(p => p.status === 'active') || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = async () => {
    const nextPage = page + 1
    try {
      const res = await api.get(`/time?limit=${LIMIT}&page=${nextPage}${filterProject ? `&project=${filterProject}` : ''}`)
      setEntries(prev => [...prev, ...(res.entries || [])])
      setHasMore(res.hasMore || false)
      setPage(nextPage)
    } catch (e) {
      console.error(e)
    }
  }

  const saveEntry = async (data) => {
    if (isGuest) {
      // Demo mode: just show the entry locally without persisting
      const fakeEntry = {
        _id: 'demo_' + Date.now(),
        ...data,
        project: projects.find(p => p._id === data.projectId)
      }
      setEntries(prev => [fakeEntry, ...prev])
      return
    }

    await api.post('/time', data)
    await loadInitial()
  }

  const deleteEntry = async (id) => {
    if (isGuest) {
      setEntries(prev => prev.filter(e => e._id !== id))
      return
    }

    if (!window.confirm('Delete this entry?')) return
    await api.delete(`/time/${id}`)
    setEntries(prev => prev.filter(e => e._id !== id))
  }

  // group entries by date
  const grouped = entries.reduce((acc, entry) => {
    const key = formatDate(entry.date)
    if (!acc[key]) acc[key] = { label: key, entries: [], totalMins: 0 }
    acc[key].entries.push(entry)
    acc[key].totalMins += entry.minutes
    return acc
  }, {})

  return (
    <div className="timelog-page fade-in">
      <div className="page-header">
        <div>
          <h1>Time Log</h1>
          <p className="page-sub">Track hours across all your projects</p>
        </div>
        {isGuest
          ? <a href="/register" style={{background:'var(--accent)',color:'#0e0e10',fontWeight:700,fontSize:'0.875rem',padding:'9px 16px',borderRadius:'var(--radius-sm)',textDecoration:'none'}}>Create account →</a>
          : <button className="btn-accent" onClick={() => setShowModal(true)}>+ Add manually</button>
        }
      </div>

      <div className="timelog-controls">
        <LiveTimer projects={projects} onSave={saveEntry} />

        <div className="tl-filter">
          <select value={filterProject} onChange={e => setFilterProject(e.target.value)}>
            <option value="">All projects</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : entries.length === 0 ? (
        <div className="empty-state">
          <p>No time entries yet</p>
          <button className="btn-accent sm" onClick={() => setShowModal(true)}>Log your first entry</button>
        </div>
      ) : (
        <div className="entries-list">
          {Object.values(grouped).map(group => (
            <div key={group.label} className="entry-group">
              <div className="entry-group-header">
                <span className="group-label">{group.label}</span>
                <span className="group-total mono">{hoursDisplay(group.totalMins)}</span>
              </div>

              {group.entries.map(entry => (
                <div key={entry._id} className="entry-row">
                  <div
                    className="entry-proj-dot"
                    style={{ background: entry.project?.color || 'var(--border-light)' }}
                  />
                  <div className="entry-main">
                    <span className="entry-description">
                      {entry.description || <span style={{color:'var(--text-dim)'}}>No description</span>}
                    </span>
                    {entry.project && (
                      <span className="entry-proj-tag" style={{color: entry.project.color || 'var(--text-muted)'}}>
                        {entry.project.name}
                      </span>
                    )}
                  </div>
                  <div className="entry-right">
                    <span className="entry-mins mono">{hoursDisplay(entry.minutes)}</span>
                    {entry.project?.hourlyRate && (
                      <span className="entry-earned">
                        ${((entry.minutes / 60) * entry.project.hourlyRate).toFixed(2)}
                      </span>
                    )}
                    <button
                      className="entry-delete-btn"
                      onClick={() => deleteEntry(entry._id)}
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {hasMore && (
            <div className="load-more">
              <button className="btn-ghost" onClick={loadMore}>Load more</button>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <AddEntryModal
          projects={projects}
          onSave={saveEntry}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}