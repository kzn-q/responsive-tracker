import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../App'
import { DEMO_INVOICES, DEMO_PROJECTS } from '../data/demoData'
import { api } from '../api'
import './Invoices.css'

function money(v) {
  return new Intl.NumberFormat('en-US', { style:'currency', currency:'USD' }).format(v || 0)
}

function GenerateModal({ projects, onGenerate, onClose }) {
  const [projectId, setProjectId] = useState('')
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date()
    d.setDate(1) // first of month
    return d.toISOString().split('T')[0]
  })
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [err, setErr] = useState('')

  const loadPreview = async () => {
    if (!projectId) { setErr('Pick a project first'); return }
    setLoading(true)
    setErr('')
    try {
      const res = await api.get(`/invoices/preview?project=${projectId}&from=${dateFrom}&to=${dateTo}`)
      setPreview(res)
    } catch (e) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!preview) { await loadPreview(); return }
    setLoading(true)
    try {
      await onGenerate({ projectId, dateFrom, dateTo })
      onClose()
    } catch (e) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fade-in" style={{maxWidth:'460px'}}>
        <div className="modal-header">
          <h2>Generate Invoice</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>Project *</label>
            <select value={projectId} onChange={e => { setProjectId(e.target.value); setPreview(null) }}>
              <option value="">Select a project</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.name} — {p.client || 'no client'}</option>)}
            </select>
          </div>

          <div className="form-row">
            <div className="field">
              <label>From date</label>
              <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPreview(null) }} />
            </div>
            <div className="field">
              <label>To date</label>
              <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPreview(null) }} />
            </div>
          </div>

          <button className="btn-ghost" style={{width:'100%', textAlign:'center'}} onClick={loadPreview} disabled={!projectId || loading}>
            {loading ? <span className="spinner" /> : 'Preview hours'}
          </button>

          {preview && (
            <div className="invoice-preview">
              <div className="preview-row">
                <span>Total hours</span>
                <span className="mono">{(preview.totalMinutes / 60).toFixed(2)}h</span>
              </div>
              <div className="preview-row">
                <span>Rate</span>
                <span className="mono">{money(preview.hourlyRate)}/hr</span>
              </div>
              <div className="preview-row total">
                <span>Invoice total</span>
                <span className="mono">{money(preview.total)}</span>
              </div>
              <p className="preview-note">{preview.entryCount} time entr{preview.entryCount === 1 ? 'y' : 'ies'} in this period</p>
            </div>
          )}

          {err && <div className="form-error">{err}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-accent" onClick={handleGenerate} disabled={loading || !projectId}>
            {loading ? <span className="spinner" /> : preview ? 'Create invoice' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Invoices() {
  const { user, isGuest } = useAuth()
  const [invoices, setInvoices] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (isGuest) {
      setInvoices(DEMO_INVOICES)
      setProjects(DEMO_PROJECTS)
      setLoading(false)
      return
    }
    Promise.all([
      api.get('/invoices'),
      api.get('/projects'),
    ]).then(([invRes, projRes]) => {
      setInvoices(invRes.invoices || [])
      setProjects(projRes.projects?.filter(p => p.status !== 'completed') || [])
    }).catch(console.error)
    .finally(() => setLoading(false))
  }, [])

  const handleGenerate = async (params) => {
    const res = await api.post('/invoices', params)
    setInvoices(prev => [res.invoice, ...prev])
  }

  const markPaid = async (id) => {
    await api.put(`/invoices/${id}`, { status: 'paid' })
    setInvoices(prev => prev.map(inv => inv._id === id ? { ...inv, status: 'paid' } : inv))
  }

  const markVoid = async (id) => {
    if (!confirm('Void this invoice?')) return
    await api.put(`/invoices/${id}`, { status: 'void' })
    setInvoices(prev => prev.map(inv => inv._id === id ? { ...inv, status: 'void' } : inv))
  }

  const totalUnpaid = invoices
    .filter(i => i.status === 'sent')
    .reduce((sum, i) => sum + i.total, 0)

  if (loading) return <div className="page-loading"><div className="spinner" /></div>

  return (
    <div className="invoices-page fade-in">
      <div className="page-header">
        <div>
          <h1>Invoices</h1>
          {totalUnpaid > 0 && (
            <p className="page-sub" style={{color:'var(--orange)'}}>
              {money(totalUnpaid)} outstanding
            </p>
          )}
        </div>
        {isGuest ? (<Link to="/register" className="btn-accent">Unlock invoicing →</Link>) : (<button className="btn-accent" onClick={() => setShowModal(true)}>+ Generate Invoice</button>)}
      </div>

      {invoices.length === 0 ? (
        <div className="empty-state">
          <p>No invoices yet</p>
          <p style={{fontSize:'0.78rem', marginTop:'-4px'}}>Generate an invoice from your tracked time</p>
          <button className="btn-accent sm" onClick={() => setShowModal(true)}>Generate first invoice</button>
        </div>
      ) : (
        <div className="invoices-table-wrap">
          <table className="invoices-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Project / Client</th>
                <th>Period</th>
                <th>Hours</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, idx) => (
                <tr key={inv._id} className={inv.status === 'void' ? 'voided' : ''}>
                  <td className="mono inv-num">#{(invoices.length - idx).toString().padStart(3, '0')}</td>
                  <td>
                    <span className="inv-project">{inv.project?.name || 'Unknown'}</span>
                    {inv.project?.client && <span className="inv-client">{inv.project.client}</span>}
                  </td>
                  <td className="inv-period">
                    {new Date(inv.dateFrom).toLocaleDateString('en-US',{month:'short',day:'numeric'})} –{' '}
                    {new Date(inv.dateTo).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                  </td>
                  <td className="mono">{(inv.totalMinutes / 60).toFixed(1)}h</td>
                  <td className="inv-amount mono">{money(inv.total)}</td>
                  <td>
                    <span className={`inv-status ${inv.status}`}>{inv.status}</span>
                  </td>
                  <td>
                    <div className="inv-actions">
                      {inv.status === 'sent' && (
                        <button className="inv-action paid" onClick={() => markPaid(inv._id)}>
                          Mark paid
                        </button>
                      )}
                      {inv.status !== 'void' && inv.status !== 'paid' && (
                        <button className="inv-action void" onClick={() => markVoid(inv._id)}>
                          Void
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <GenerateModal
          projects={projects}
          onGenerate={handleGenerate}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
