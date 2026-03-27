import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './GuestBanner.css'

export default function GuestBanner() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div className="guest-banner">
      <div className="guest-banner-inner">
        <div className="guest-banner-left">
          <span className="guest-dot" />
          <span className="guest-tag">DEMO MODE</span>
          <span className="guest-msg">
            You're exploring with sample data. Your changes won't be saved.
          </span>
        </div>
        <div className="guest-banner-right">
          <Link to="/register" className="guest-cta-btn">
            Create free account →
          </Link>
          <button className="guest-dismiss" onClick={() => setDismissed(true)}>✕</button>
        </div>
      </div>
    </div>
  )
}
