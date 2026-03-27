import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../App'
import GuestBanner from './GuestBanner'
import './Layout.css'

const icons = {
  dashboard: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  projects:  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M3 7a2 2 0 012-2h3.5l2 2H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>,
  time:      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3" strokeLinecap="round"/></svg>,
  invoices:  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z"/><path d="M14 3v5h5M9 12h6M9 16h4" strokeLinecap="round"/></svg>,
  reports:   <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  profile:   <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round"/></svg>,
  settings:  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  bell:      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  logout:    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round"/></svg>,
}

const navItems = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard', mobileLabel: 'Home' },
  { to: '/projects',  icon: 'projects',  label: 'Projects' },
  { to: '/time',      icon: 'time',      label: 'Time Log', mobileLabel: 'Time' },
  { to: '/invoices',  icon: 'invoices',  label: 'Invoices' },
  { to: '/reports',   icon: 'reports',   label: 'Reports' },
]

const secondaryNav = [
  { to: '/notifications', icon: 'bell',     label: 'Notifications', mobileLabel: 'Alerts' },
  { to: '/settings',      icon: 'settings', label: 'Settings' },
]

export default function Layout() {
  const { user, isGuest, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => { logout(); navigate('/') }

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  const avatarEl = user?.profileImage
    ? <img src={user.profileImage} alt="avatar" className="user-avatar" style={{ objectFit: 'cover' }} />
    : <div className="user-avatar">{initials}</div>

  return (
    <div className="layout-wrap">
      {isGuest && <GuestBanner />}

      {/* ── Mobile topbar ── */}
      <div className="mobile-topbar">
        <div className="mobile-topbar-brand">
          <span className="logo-mark">FT</span>
          <span>FreelanceTracker</span>
        </div>
        <div className="mobile-topbar-right">
          {isGuest
            ? <Link to="/register" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)', border: '1px solid rgba(200,241,53,0.3)', padding: '5px 10px', borderRadius: 'var(--radius-sm)' }}>Sign up</Link>
            : <Link to="/profile">
                {user?.profileImage
                  ? <img src={user.profileImage} alt="avatar" className="mobile-avatar" />
                  : <div className="mobile-avatar">{initials}</div>
                }
              </Link>
          }
        </div>
      </div>

      <div className={`layout ${collapsed ? 'collapsed' : ''}`}>
        {/* ── Desktop Sidebar ── */}
        <aside className="sidebar">
          <div className="sidebar-top">
            <div className="logo" onClick={() => setCollapsed(c => !c)}>
              <span className="logo-mark">FT</span>
              {!collapsed && <span className="logo-text">Freelance<br/>Tracker</span>}
            </div>
          </div>

          <nav className="sidebar-nav">
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} end={item.to === '/dashboard'}
                className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                {icons[item.icon]}
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}

            {!collapsed && <div className="nav-divider" />}

            {secondaryNav.map(item => (
              <NavLink key={item.to} to={item.to}
                className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                {icons[item.icon]}
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="user-info"
              onClick={() => !isGuest && navigate('/profile')}
              style={{ cursor: isGuest ? 'default' : 'pointer' }}>
              {avatarEl}
              {!collapsed && (
                <div className="user-meta">
                  <span className="user-name">
                    {user?.name || 'User'}
                    {isGuest && <span className="guest-chip">DEMO</span>}
                  </span>
                  <span className="user-email">{user?.email || ''}</span>
                </div>
              )}
            </div>
            <button className="logout-btn" onClick={handleLogout} title={isGuest ? 'Exit demo' : 'Log out'}>
              {icons.logout}
            </button>
          </div>
        </aside>

        <main className="main-content">
          <Outlet />
        </main>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="mobile-bottom-nav">
        <div className="mobile-nav-inner">
          {[...navItems.slice(0, 4),
            isGuest
              ? { to: '/settings', icon: 'settings', label: 'Settings', mobileLabel: 'Settings' }
              : { to: '/profile',  icon: 'profile',  label: 'Profile' }
          ].map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/dashboard'}
              className={({ isActive }) => isActive ? 'mobile-nav-item active' : 'mobile-nav-item'}>
              {icons[item.icon]}
              <span>{item.mobileLabel || item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
