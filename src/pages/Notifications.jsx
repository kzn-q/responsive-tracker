import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../App'
import { DEMO_NOTIFICATIONS } from '../data/demoData'
import './Notifications.css'

const NOTIF_ICONS = { invoice: '🧾', payment: '💰', project: '📁', reminder: '⏰', security: '🔐', system: '⚙️' }

export default function Notifications() {
  const { isGuest } = useAuth()
  const [notifs, setNotifs] = useState(isGuest ? DEMO_NOTIFICATIONS : [])
  const [filter, setFilter] = useState('all')

  const markAllRead = () => setNotifs(n => n.map(x => ({ ...x, read: true })))
  const markRead = (id) => setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x))
  const deleteNotif = (id) => setNotifs(n => n.filter(x => x.id !== id))

  const filtered = filter === 'unread' ? notifs.filter(n => !n.read) : notifs
  const unreadCount = notifs.filter(n => !n.read).length

  return (
    <div className="notifs-page fade-in">
      <div className="notifs-header">
        <div>
          <h1>Notifications</h1>
          <p className="notifs-sub">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}</p>
        </div>
        {unreadCount > 0 && (
          <button className="mark-all-btn" onClick={markAllRead}>Mark all as read</button>
        )}
      </div>

      <div className="notifs-filters">
        {[['all','All'],['unread','Unread']].map(([v, l]) => (
          <button key={v} className={`notif-filter ${filter === v ? 'active' : ''}`} onClick={() => setFilter(v)}>
            {l} {v === 'unread' && unreadCount > 0 && <span className="notif-count">{unreadCount}</span>}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="notifs-empty">
          <div className="notifs-empty-icon">🔔</div>
          <h3>{filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}</h3>
          <p>When something important happens, you'll see it here.</p>
        </div>
      ) : (
        <div className="notifs-list">
          {filtered.map(n => (
            <div key={n.id} className={`notif-item ${n.read ? '' : 'unread'}`} onClick={() => markRead(n.id)}>
              <div className="notif-icon-wrap">
                <span className="notif-icon">{NOTIF_ICONS[n.type] || '🔔'}</span>
                {!n.read && <span className="notif-unread-dot" />}
              </div>
              <div className="notif-body">
                <p className="notif-message">{n.message}</p>
                <span className="notif-time">{n.time}</span>
              </div>
              <button className="notif-delete" onClick={e => { e.stopPropagation(); deleteNotif(n.id) }} title="Dismiss">✕</button>
            </div>
          ))}
        </div>
      )}

      {isGuest && (
        <div className="notifs-guest">
          <p>These are demo notifications. <Link to="/register">Create an account</Link> to get real alerts.</p>
        </div>
      )}
    </div>
  )
}
