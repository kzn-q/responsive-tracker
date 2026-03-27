import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../App'
import { api } from '../api'
import { DEMO_PROJECTS, DEMO_TIME_ENTRIES, DEMO_INVOICES } from '../data/demoData'
import './Reports.css'

function money(val) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0)
}
function hoursDisplay(minutes) {
  const h = Math.floor(minutes / 60), m = minutes % 60
  return h === 0 ? `${m}m` : m === 0 ? `${h}h` : `${h}h ${m}m`
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function Reports() {
  const { isGuest } = useAuth()
  const [projects, setProjects] = useState([])
  const [entries, setEntries] = useState([])
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState('month') // month | quarter | year | all

  useEffect(() => {
    if (isGuest) {
      setProjects(DEMO_PROJECTS)
      setEntries(DEMO_TIME_ENTRIES)
      setInvoices(DEMO_INVOICES)
      setLoading(false)
      return
    }
    const load = async () => {
      try {
        const [pr, en, inv] = await Promise.all([
          api.get('/projects'),
          api.get('/time?limit=1000'),
          api.get('/invoices'),
        ])
        setProjects(pr.projects || [])
        setEntries(en.entries || [])
        setInvoices(inv.invoices || [])
      } catch(e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [isGuest])

  // Filter by range
  const now = new Date()
  const filterDate = (d) => {
    const date = new Date(d)
    if (range === 'month') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    if (range === 'quarter') {
      const q = Math.floor(now.getMonth() / 3)
      return Math.floor(date.getMonth() / 3) === q && date.getFullYear() === now.getFullYear()
    }
    if (range === 'year') return date.getFullYear() === now.getFullYear()
    return true
  }

  const filteredEntries = entries.filter(e => filterDate(e.date))
  const totalMinutes = filteredEntries.reduce((s, e) => s + e.minutes, 0)
  const totalEarned = filteredEntries.reduce((s, e) => s + (e.minutes / 60) * (e.project?.hourlyRate || 0), 0)

  // Per-project breakdown
  const projectBreakdown = projects.map(p => {
    const pEntries = filteredEntries.filter(e => e.project?._id === p._id || e.project === p._id)
    const mins = pEntries.reduce((s, e) => s + e.minutes, 0)
    const earned = pEntries.reduce((s, e) => s + (e.minutes / 60) * (p.hourlyRate || 0), 0)
    return { ...p, mins, earned, entryCount: pEntries.length }
  }).filter(p => p.mins > 0).sort((a, b) => b.earned - a.earned)

  // Monthly trend (last 6 months)
  const trend = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const monthEntries = entries.filter(e => {
      const ed = new Date(e.date)
      return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear()
    })
    const earned = monthEntries.reduce((s, e) => s + (e.minutes / 60) * (e.project?.hourlyRate || 0), 0)
    return { label: MONTHS[d.getMonth()], earned, month: d.getMonth(), year: d.getFullYear() }
  })
  const maxTrend = Math.max(...trend.map(t => t.earned), 1)

  // Invoice stats
  const paidInvoices = invoices.filter(i => i.status === 'paid')
  const sentInvoices = invoices.filter(i => i.status === 'sent')
  const totalPaid = paidInvoices.reduce((s, i) => s + i.total, 0)
  const totalPending = sentInvoices.reduce((s, i) => s + i.total, 0)

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="spinner" /></div>

  return (
    <div className="reports-page fade-in">
      <div className="reports-header">
        <div>
          <h1>Reports</h1>
          <p className="reports-sub">Your work & earnings at a glance</p>
        </div>
        <div className="range-tabs">
          {[['month','This month'],['quarter','Quarter'],['year','This year'],['all','All time']].map(([v, l]) => (
            <button key={v} className={`range-tab ${range === v ? 'active' : ''}`} onClick={() => setRange(v)}>{l}</button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="reports-kpi">
        <div className="kpi-card">
          <span className="kpi-icon">💰</span>
          <div>
            <div className="kpi-val">{money(totalEarned)}</div>
            <div className="kpi-label">Total earned</div>
          </div>
        </div>
        <div className="kpi-card">
          <span className="kpi-icon">⏱</span>
          <div>
            <div className="kpi-val">{hoursDisplay(totalMinutes)}</div>
            <div className="kpi-label">Time logged</div>
          </div>
        </div>
        <div className="kpi-card">
          <span className="kpi-icon">📁</span>
          <div>
            <div className="kpi-val">{projectBreakdown.length}</div>
            <div className="kpi-label">Active projects</div>
          </div>
        </div>
        <div className="kpi-card">
          <span className="kpi-icon">💸</span>
          <div>
            <div className="kpi-val accent">{money(totalPending)}</div>
            <div className="kpi-label">Pending payment</div>
          </div>
        </div>
      </div>

      <div className="reports-grid">
        {/* Monthly Trend Chart */}
        <div className="report-card span-2">
          <div className="report-card-header">
            <h2>Monthly earnings</h2>
            <span className="report-badge">Last 6 months</span>
          </div>
          <div className="trend-chart">
            {trend.map((t, i) => (
              <div key={i} className="trend-col">
                <div className="trend-bar-wrap">
                  <div
                    className="trend-bar"
                    style={{ height: `${Math.max((t.earned / maxTrend) * 100, 4)}%` }}
                    title={money(t.earned)}
                  />
                </div>
                <div className="trend-label">{t.label}</div>
                <div className="trend-val">{money(t.earned)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Project breakdown */}
        <div className="report-card">
          <div className="report-card-header">
            <h2>By project</h2>
          </div>
          {projectBreakdown.length === 0 ? (
            <div className="report-empty">No data for this period</div>
          ) : (
            <div className="project-breakdown">
              {projectBreakdown.map((p, i) => {
                const pct = totalEarned > 0 ? (p.earned / totalEarned) * 100 : 0
                return (
                  <div key={p._id} className="breakdown-row">
                    <div className="breakdown-dot" style={{ background: p.color }} />
                    <div className="breakdown-info">
                      <div className="breakdown-name">{p.name}</div>
                      <div className="breakdown-bar-wrap">
                        <div className="breakdown-bar" style={{ width: `${pct}%`, background: p.color }} />
                      </div>
                    </div>
                    <div className="breakdown-stats">
                      <div className="breakdown-earned">{money(p.earned)}</div>
                      <div className="breakdown-hours">{hoursDisplay(p.mins)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Invoice Summary */}
        <div className="report-card">
          <div className="report-card-header">
            <h2>Invoice summary</h2>
          </div>
          <div className="invoice-summary">
            <div className="inv-sum-row">
              <span className="inv-sum-label">Total invoiced</span>
              <span className="inv-sum-val mono">{money(totalPaid + totalPending)}</span>
            </div>
            <div className="inv-sum-row">
              <span className="inv-sum-label"><span className="dot-ok" /> Paid</span>
              <span className="inv-sum-val mono accent">{money(totalPaid)}</span>
            </div>
            <div className="inv-sum-row">
              <span className="inv-sum-label"><span className="dot-warn" /> Pending</span>
              <span className="inv-sum-val mono orange">{money(totalPending)}</span>
            </div>
            <div className="inv-sum-row">
              <span className="inv-sum-label">Total invoices</span>
              <span className="inv-sum-val mono">{invoices.length}</span>
            </div>
            <div className="inv-sum-divider" />
            <Link to="/invoices" className="inv-sum-link">View all invoices →</Link>
          </div>
        </div>
      </div>

      {/* Guest CTA */}
      {isGuest && (
        <div className="reports-guest-cta">
          <div className="rgc-text">
            <h3>Unlock your real insights</h3>
            <p>This is demo data. Create a free account to track your actual earnings and projects.</p>
          </div>
          <Link to="/register" className="rgc-btn">Get started free →</Link>
        </div>
      )}
    </div>
  )
}
