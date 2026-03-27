import React, { createContext, useContext, useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import TimeLog from './pages/TimeLog'
import Invoices from './pages/Invoices'
import Profile from './pages/Profile'
import VerifyEmail from './pages/VerifyEmail'
import Settings from './pages/Settings'
import Notifications from './pages/Notifications'
import Reports from './pages/Reports'
import NotFound from './pages/NotFound'
import Landing from './pages/public/Landing'
import Layout from './components/Layout'
import { DEMO_USER } from './data/demoData'

export const AuthCtx = createContext(null)
export function useAuth() { return useContext(AuthCtx) }

function PrivateRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const [user, setUser] = useState(null)
  const [isGuest, setIsGuest] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('ft_token')
    const savedUser = localStorage.getItem('ft_user')
    const guestMode = localStorage.getItem('ft_guest')
    if (guestMode === 'true') {
      setUser(DEMO_USER)
      setIsGuest(true)
    } else if (token && savedUser) {
      try { setUser(JSON.parse(savedUser)) }
      catch {
        localStorage.removeItem('ft_token')
        localStorage.removeItem('ft_user')
      }
    }
    setAuthLoading(false)
  }, [])

  const login = (userData, token) => {
    setUser(userData); setIsGuest(false)
    localStorage.setItem('ft_token', token)
    localStorage.setItem('ft_user', JSON.stringify(userData))
    localStorage.removeItem('ft_guest')
  }

  const loginAsGuest = () => {
    setUser(DEMO_USER); setIsGuest(true)
    localStorage.setItem('ft_guest', 'true')
  }

  const logout = () => {
    setUser(null); setIsGuest(false)
    localStorage.removeItem('ft_token')
    localStorage.removeItem('ft_user')
    localStorage.removeItem('ft_guest')
  }

  const updateUser = (userData) => {
    setUser(userData)
    localStorage.setItem('ft_user', JSON.stringify(userData))
  }

  if (authLoading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--bg)' }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <AuthCtx.Provider value={{ user, isGuest, login, loginAsGuest, logout, updateUser }}>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={user && !isGuest ? <Navigate to="/dashboard" replace /> : <Landing />} />
<Route path="/login" element={user && !isGuest ? <Navigate to="/dashboard" replace /> : <Login />} />
<Route path="/register" element={user && !isGuest ? <Navigate to="/dashboard" replace /> : <Register />} />

        {/* App — all nested under /dashboard base via Layout */}
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/time" element={<TimeLog />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthCtx.Provider>
  )
}
