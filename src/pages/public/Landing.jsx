import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../App'
import './Landing.css'

const FEATURES = [
  { icon: '⏱', title: 'Smart Time Tracking', desc: 'Log hours with one click. Tag by project, add descriptions, and never lose a billable minute.' },
  { icon: '📁', title: 'Project Management', desc: 'Organize clients and projects with custom rates, colors, and statuses. Stay on top of every engagement.' },
  { icon: '🧾', title: 'Auto-Generated Invoices', desc: 'Turn logged hours into professional invoices instantly. Export, mark paid, and track outstanding amounts.' },
  { icon: '📊', title: 'Earnings Analytics', desc: 'See your monthly burn rate, daily earnings, and projected income. Know exactly if you\'re hitting your targets.' },
  { icon: '🔐', title: 'Secure & Private', desc: 'Your data is yours. Email + phone verification, JWT auth, and no ads — ever.' },
  { icon: '📱', title: 'Works Everywhere', desc: 'Desktop, tablet, or mobile — FreelanceTracker adapts to how and where you work.' },
]

const PRICING = [
  {
    name: 'Starter', price: 'Free', period: 'forever',
    features: ['Up to 3 projects', 'Unlimited time entries', 'Basic invoicing', 'Monthly reports'],
    cta: 'Get started free', accent: false,
  },
  {
    name: 'Pro', price: '$9', period: '/month',
    features: ['Unlimited projects', 'Advanced analytics', 'Custom invoice branding', 'Priority support', 'CSV export', 'Recurring reminders'],
    cta: 'Start free trial', accent: true,
  },
  {
    name: 'Agency', price: '$29', period: '/month',
    features: ['Everything in Pro', 'Team members (5 seats)', 'Client portal', 'White-label invoices', 'API access', 'Dedicated support'],
    cta: 'Contact sales', accent: false,
  },
]

const TESTIMONIALS = [
  { name: 'Sara M.', role: 'UI/UX Designer', avatar: 'SM', text: 'Finally a tracker that feels premium without the bloat. I\'ve tripled my invoice accuracy since switching.' },
  { name: 'James K.', role: 'Fullstack Developer', avatar: 'JK', text: 'The burn rate widget alone is worth it. Seeing my projected monthly income in real time keeps me motivated.' },
  { name: 'Leila R.', role: 'Brand Consultant', avatar: 'LR', text: 'I used to lose 10–15% of billable hours. Now everything is logged. My clients get professional invoices instantly.' },
]

const FAQS = [
  { q: 'Is my data safe?', a: 'Yes. All data is encrypted in transit, stored in a private MongoDB instance, and never shared or sold. You can delete your account and all data at any time.' },
  { q: 'Can I try it without creating an account?', a: 'Absolutely. Click "Try Demo" to explore the full dashboard with sample data instantly — no email required.' },
  { q: 'What currencies are supported?', a: 'Currently USD is the default display currency. Multi-currency support is coming in the next release.' },
  { q: 'Can I export my data?', a: 'Yes. Pro users can export time entries and invoices as CSV. PDF invoice export is also available.' },
  { q: 'Is there a mobile app?', a: 'The web app is fully responsive and works great on mobile. A native app is on the roadmap.' },
]

export default function Landing() {
  const { loginAsGuest } = useAuth()
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState(null)

  const handleGuest = () => {
    loginAsGuest()
    navigate('/dashboard')
  }

  return (
    <div className="landing">
      {/* NAV */}
      <nav className="land-nav">
        <div className="land-nav-inner">
          <div className="land-brand">
            <span className="land-logo-mark">FT</span>
            <span className="land-logo-text">FreelanceTracker</span>
          </div>
          <div className="land-nav-links">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="land-nav-cta">
            <Link to="/login" className="btn-ghost-nav">Sign in</Link>
            <Link to="/register" className="btn-accent-nav">Get started</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-badge">✦ Built for freelancers who mean business</div>
        <h1 className="hero-title">
          Track time.<br />
          Send invoices.<br />
          <span className="hero-accent">Get paid.</span>
        </h1>
        <p className="hero-sub">
          The premium time-tracking and invoicing platform for freelancers and indie consultants.
          Know exactly what you earned, what you're owed, and if you're on track.
        </p>
        <div className="hero-ctas">
          <Link to="/register" className="hero-btn-primary">
            Start for free
            <span className="hero-btn-arrow">→</span>
          </Link>
          <button className="hero-btn-ghost" onClick={handleGuest}>
            Try demo — no signup
          </button>
        </div>
        <p className="hero-note">No credit card required · Free forever plan available</p>

        {/* Fake dashboard preview */}
        <div className="hero-preview">
          <div className="preview-bar">
            <span className="preview-dot red" /><span className="preview-dot yellow" /><span className="preview-dot green" />
            <span className="preview-url">freelancetracker.app/dashboard</span>
          </div>
          <div className="preview-body">
            <div className="preview-sidebar">
              <div className="prev-logo-row"><span className="prev-logo">FT</span></div>
              {['Dashboard','Projects','Time Log','Invoices','Reports'].map((item, i) => (
                <div key={i} className={`prev-nav-item ${i === 0 ? 'active' : ''}`}>{item}</div>
              ))}
            </div>
            <div className="preview-main">
              <div className="prev-header">
                <div className="prev-title">Good afternoon, Alex 👋</div>
                <div className="prev-btn">+ Log Time</div>
              </div>
              <div className="prev-stats">
                {[
                  { label: 'This month', val: '$3,487' },
                  { label: 'Active projects', val: '2' },
                  { label: 'Unpaid invoices', val: '$4,200' },
                  { label: 'Avg rate', val: '$118/hr' },
                ].map((s, i) => (
                  <div key={i} className="prev-stat">
                    <div className="prev-stat-label">{s.label}</div>
                    <div className="prev-stat-val">{s.val}</div>
                  </div>
                ))}
              </div>
              <div className="prev-row">
                <div className="prev-card">
                  <div className="prev-card-title">Burn Rate</div>
                  <div className="prev-card-val accent">$3,487</div>
                  <div className="prev-bar"><div className="prev-bar-fill" style={{width:'70%'}} /></div>
                </div>
                <div className="prev-card">
                  <div className="prev-card-title">Recent Entries</div>
                  {['Homepage design — 3h','API integration — 4h','Logo revisions — 1.5h'].map((e,i)=>(
                    <div key={i} className="prev-entry">{e}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="social-proof">
        <p className="proof-label">Trusted by freelancers worldwide</p>
        <div className="proof-stats">
          <div className="proof-stat"><span className="proof-num">12,000+</span><span className="proof-desc">Active users</span></div>
          <div className="proof-divider" />
          <div className="proof-stat"><span className="proof-num">$42M+</span><span className="proof-desc">Invoiced through FT</span></div>
          <div className="proof-divider" />
          <div className="proof-stat"><span className="proof-num">4.9★</span><span className="proof-desc">Average rating</span></div>
          <div className="proof-divider" />
          <div className="proof-stat"><span className="proof-num">99.9%</span><span className="proof-desc">Uptime SLA</span></div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features" id="features">
        <div className="section-label">Features</div>
        <h2 className="section-title">Everything a freelancer needs.<br /><span className="accent-text">Nothing they don't.</span></h2>
        <p className="section-sub">Designed to be fast, focused, and distraction-free. No bloat, no complexity.</p>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div className="feature-card" key={i}>
              <span className="feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials">
        <div className="section-label">Testimonials</div>
        <h2 className="section-title">Freelancers love it</h2>
        <div className="testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <div className="testimonial-card" key={i}>
              <div className="testi-stars">★★★★★</div>
              <p className="testi-text">"{t.text}"</p>
              <div className="testi-author">
                <div className="testi-avatar">{t.avatar}</div>
                <div>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing" id="pricing">
        <div className="section-label">Pricing</div>
        <h2 className="section-title">Simple, transparent pricing</h2>
        <p className="section-sub">Start free. Upgrade when you're ready. Cancel anytime.</p>
        <div className="pricing-grid">
          {PRICING.map((p, i) => (
            <div className={`pricing-card ${p.accent ? 'pricing-card-accent' : ''}`} key={i}>
              {p.accent && <div className="pricing-popular">Most popular</div>}
              <div className="pricing-name">{p.name}</div>
              <div className="pricing-price">
                <span className="pricing-amount">{p.price}</span>
                <span className="pricing-period">{p.period}</span>
              </div>
              <ul className="pricing-features">
                {p.features.map((f, j) => (
                  <li key={j}><span className="pricing-check">✓</span>{f}</li>
                ))}
              </ul>
              <Link to="/register" className={`pricing-cta ${p.accent ? 'pricing-cta-accent' : ''}`}>{p.cta}</Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="faq" id="faq">
        <div className="section-label">FAQ</div>
        <h2 className="section-title">Frequently asked questions</h2>
        <div className="faq-list">
          {FAQS.map((f, i) => (
            <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div className="faq-question">
                <span>{f.q}</span>
                <span className="faq-icon">{openFaq === i ? '−' : '+'}</span>
              </div>
              {openFaq === i && <div className="faq-answer">{f.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <h2>Ready to take control of your freelance income?</h2>
        <p>Join thousands of freelancers who trust FreelanceTracker to run their business.</p>
        <div className="final-cta-btns">
          <Link to="/register" className="hero-btn-primary">Create free account →</Link>
          <button className="hero-btn-ghost" onClick={handleGuest}>Try the demo first</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="land-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="land-brand">
              <span className="land-logo-mark">FT</span>
              <span className="land-logo-text">FreelanceTracker</span>
            </div>
            <p>The premium time-tracking & invoicing platform for freelancers.</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <div className="footer-col-title">Product</div>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <button onClick={handleGuest} style={{background:'none',color:'var(--text-muted)',textAlign:'left',padding:0,fontSize:'0.875rem',cursor:'pointer'}}>Try Demo</button>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Account</div>
              <Link to="/login">Sign in</Link>
              <Link to="/register">Create account</Link>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Legal</div>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} FreelanceTracker. Built with ♥ for freelancers.</span>
        </div>
      </footer>
    </div>
  )
}
