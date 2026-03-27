import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../App'
import { api } from '../api'
import { DEMO_PROJECTS } from '../data/demoData'
import './Projects.css'

const PROJECT_COLORS = [
  '#c8f135', '#4d9fff', '#ff4d6d', '#ff9f43',
  '#a29bfe', '#00cec9', '#fd79a8', '#6c5ce7',
  '#55efc4', '#fdcb6e',
]

function ProjectModal({ project, onSave, onClose, userHourlyRate }) {
  const isEdit = !!project
  const [form, setForm] = useState({
    name: project?.name || '',
    client: project?.client || '',
    hourlyRate: project?.hourlyRate ?? userHourlyRate ?? 75,
    color: project?.color || PROJECT_COLORS[0],
    status: project?.status || 'active',
    notes: project?.notes || '',
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }))

  const handleSave = async () => {
    if (!form.name.trim()) { setErr('Project name is required'); return }
    setSaving(true); setErr('')
    try {
      if (isEdit) await api.put(`/projects/${project._id}`, form)
      else await api.post('/projects', form)
      onSave()
    } catch (e) { setErr(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fade-in">
        <div className="modal-header">
          <h2>{isEdit ? 'Edit project' : 'New project'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <div className="field">
              <label>Project name *</label>
              <input type="text" value={form.name} onChange={set('name')} placeholder="Acme website redesign" autoFocus />
            </div>
            <div className="field">
              <label>Client</label>
              <input type="text" value={form.client} onChange={set('client')} placeholder="Acme Corp" />
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label>Hourly rate ($)</label>
              <input type="number" value={form.hourlyRate} onChange={set('hourlyRate')} min="0" step="5" />
            </div>
            <div className="field">
              <label>Status</label>
              <select value={form.status} onChange={set('status')}>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>Color</label>
            <div className="color-picker">
              {PROJECT_COLORS.map(c => (
                <div key={c} className={`color-swatch ${form.color === c ? 'selected' : ''}`}
                  style={{ background: c }} onClick={() => setForm(p => ({ ...p, color: c }))} />
              ))}
            </div>
          </div>
          <div className="field">
            <label>Notes</label>
            <textarea value={form.notes} onChange={set('notes')} placeholder="Any project notes, scope, links..." rows={3} />
          </div>
          {err && <div className="form-error">{err}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-accent" onClick={handleSave} disabled={saving}>
            {saving ? <span className="spinner" /> : isEdit ? 'Save changes' : 'Create project'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Projects() {
  const { user, isGuest } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [filter, setFilter] = useState('all')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [search, setSearch] = useState('')

  const userHourlyRate = user?.hourlyRate || 75

  const loadProjects = async () => {
    try {
      const res = await api.get('/projects')
      setProjects(res.projects || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (isGuest) {
      setProjects(DEMO_PROJECTS)
      setLoading(false)
    } else {
      loadProjects()
    }
  }, [isGuest])

  const handleDelete = async (id) => {
    if (isGuest) { setProjects(p => p.filter(x => x._id !== id)); setDeleteConfirm(null); return }
    try {
      await api.delete(`/projects/${id}`)
      setProjects(prev => prev.filter(p => p._id !== id))
      setDeleteConfirm(null)
    } catch (e) { alert(e.message) }
  }

  const handleSaved = () => { setShowModal(false); setEditTarget(null); if (!isGuest) loadProjects() }

  const filtered = projects
    .filter(p => filter === 'all' ? true : p.status === filter)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.client?.toLowerCase().includes(search.toLowerCase()))

  const statusCounts = { active: 0, paused: 0, completed: 0 }
  projects.forEach(p => { if (statusCounts[p.status] !== undefined) statusCounts[p.status]++ })

  if (loading) return <div className="page-loading"><div className="spinner" /></div>

  return (
    <div className="projects-page fade-in">
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p className="page-sub">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
        </div>
        {isGuest
          ? <Link to="/register" className="btn-accent">Unlock full access →</Link>
          : <button className="btn-accent" onClick={() => { setEditTarget(null); setShowModal(true) }}>+ New Project</button>
        }
      </div>

      <div className="projects-toolbar">
        <div className="filter-tabs">
          {[['all','All'], ['active','Active'], ['paused','Paused'], ['completed','Completed']].map(([f, l]) => (
            <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {l}
              <span className="filter-count">{f === 'all' ? projects.length : statusCounts[f] || 0}</span>
            </button>
          ))}
        </div>
        <div className="search-wrap">
          <svg className="search-icon" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input className="search-input" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          {search ? (
            <>
              <div className="empty-icon">🔍</div>
              <p>No projects match "{search}"</p>
              <button className="btn-ghost sm" onClick={() => setSearch('')}>Clear search</button>
            </>
          ) : (
            <>
              <div className="empty-icon">📁</div>
              <p>No {filter === 'all' ? '' : filter} projects yet</p>
              {!isGuest && filter === 'active' && (
                <button className="btn-accent sm" onClick={() => setShowModal(true)}>Create your first project</button>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="projects-grid">
          {filtered.map(proj => (
            <div key={proj._id} className="project-card">
              <div className="proj-color-bar" style={{ background: proj.color || 'var(--text-dim)' }} />
              <div className="proj-body">
                <div className="proj-top">
                  <div>
                    <h3 className="proj-name">{proj.name}</h3>
                    {proj.client && <span className="proj-client">{proj.client}</span>}
                  </div>
                  <span className={`status-badge ${proj.status}`}>{proj.status}</span>
                </div>
                <div className="proj-stats">
                  <div className="proj-stat">
                    <span className="proj-stat-val mono">${proj.hourlyRate}/hr</span>
                    <span className="proj-stat-label">rate</span>
                  </div>
                  <div className="proj-stat">
                    <span className="proj-stat-val mono">{proj.totalHours?.toFixed(1) || '0.0'}h</span>
                    <span className="proj-stat-label">logged</span>
                  </div>
                  <div className="proj-stat">
                    <span className="proj-stat-val mono">${((proj.totalHours || 0) * proj.hourlyRate).toFixed(0)}</span>
                    <span className="proj-stat-label">earned</span>
                  </div>
                </div>
                {proj.notes && <p className="proj-notes">{proj.notes}</p>}
                {!isGuest && (
                  <div className="proj-actions">
                    <button className="proj-action-btn edit" onClick={() => { setEditTarget(proj); setShowModal(true) }}>Edit</button>
                    {deleteConfirm === proj._id ? (
                      <div className="delete-confirm">
                        <span>Sure?</span>
                        <button className="proj-action-btn danger" onClick={() => handleDelete(proj._id)}>Yes</button>
                        <button className="proj-action-btn" onClick={() => setDeleteConfirm(null)}>No</button>
                      </div>
                    ) : (
                      <button className="proj-action-btn" onClick={() => setDeleteConfirm(proj._id)}>Delete</button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && !isGuest && (
        <ProjectModal project={editTarget} onSave={handleSaved}
          onClose={() => { setShowModal(false); setEditTarget(null) }} userHourlyRate={userHourlyRate} />
      )}
    </div>
  )
}
