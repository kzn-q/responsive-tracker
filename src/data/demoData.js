// ── Demo data for guest mode ──────────────────────────────────────────────────
export const DEMO_USER = {
  _id: 'demo',
  name: 'Alex Johnson',
  email: 'alex@demo.com',
  username: 'alexjohnson',
  hourlyRate: 95,
  emailVerified: true,
  phoneVerified: false,
  profileImage: null,
  createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  lastLoginAt: new Date().toISOString(),
}

export const DEMO_PROJECTS = [
  { _id: 'p1', name: 'Acme Corp Website', client: 'Acme Corp', hourlyRate: 120, color: '#c8f135', status: 'active', totalHours: 42.5, notes: 'Full redesign + dev', createdAt: new Date(Date.now() - 60*24*60*60*1000).toISOString() },
  { _id: 'p2', name: 'Mobile Banking App', client: 'FinTech Labs', hourlyRate: 150, color: '#4d9fff', status: 'active', totalHours: 28, notes: 'React Native', createdAt: new Date(Date.now() - 45*24*60*60*1000).toISOString() },
  { _id: 'p3', name: 'Brand Identity', client: 'Studio 9', hourlyRate: 80, color: '#ff9f43', status: 'completed', totalHours: 16, notes: 'Logo + guidelines', createdAt: new Date(Date.now() - 30*24*60*60*1000).toISOString() },
  { _id: 'p4', name: 'E-commerce Platform', client: 'ShopNow', hourlyRate: 110, color: '#a29bfe', status: 'paused', totalHours: 8, notes: '', createdAt: new Date(Date.now() - 15*24*60*60*1000).toISOString() },
]

export const DEMO_TIME_ENTRIES = [
  { _id: 't1', description: 'Homepage design & layout', minutes: 180, date: new Date(Date.now() - 1*24*60*60*1000).toISOString(), project: DEMO_PROJECTS[0] },
  { _id: 't2', description: 'API integration + auth flow', minutes: 240, date: new Date(Date.now() - 1*24*60*60*1000).toISOString(), project: DEMO_PROJECTS[1] },
  { _id: 't3', description: 'Mobile nav components', minutes: 120, date: new Date(Date.now() - 2*24*60*60*1000).toISOString(), project: DEMO_PROJECTS[1] },
  { _id: 't4', description: 'Logo variations round 2', minutes: 90, date: new Date(Date.now() - 3*24*60*60*1000).toISOString(), project: DEMO_PROJECTS[2] },
  { _id: 't5', description: 'Client review & revisions', minutes: 60, date: new Date(Date.now() - 3*24*60*60*1000).toISOString(), project: DEMO_PROJECTS[0] },
  { _id: 't6', description: 'Product listing components', minutes: 150, date: new Date(Date.now() - 5*24*60*60*1000).toISOString(), project: DEMO_PROJECTS[3] },
  { _id: 't7', description: 'Dashboard analytics page', minutes: 210, date: new Date(Date.now() - 6*24*60*60*1000).toISOString(), project: DEMO_PROJECTS[0] },
  { _id: 't8', description: 'Push notifications setup', minutes: 135, date: new Date(Date.now() - 7*24*60*60*1000).toISOString(), project: DEMO_PROJECTS[1] },
]

export const DEMO_INVOICES = [
  { _id: 'i1', project: DEMO_PROJECTS[0], totalMinutes: 2550, hourlyRate: 120, total: 5100, status: 'paid', dateFrom: new Date(Date.now()-60*24*60*60*1000).toISOString(), dateTo: new Date(Date.now()-31*24*60*60*1000).toISOString(), createdAt: new Date(Date.now()-29*24*60*60*1000).toISOString() },
  { _id: 'i2', project: DEMO_PROJECTS[1], totalMinutes: 1680, hourlyRate: 150, total: 4200, status: 'sent', dateFrom: new Date(Date.now()-30*24*60*60*1000).toISOString(), dateTo: new Date(Date.now()-1*24*60*60*1000).toISOString(), createdAt: new Date(Date.now()-1*24*60*60*1000).toISOString() },
  { _id: 'i3', project: DEMO_PROJECTS[2], totalMinutes: 960, hourlyRate: 80, total: 1280, status: 'paid', dateFrom: new Date(Date.now()-45*24*60*60*1000).toISOString(), dateTo: new Date(Date.now()-20*24*60*60*1000).toISOString(), createdAt: new Date(Date.now()-19*24*60*60*1000).toISOString() },
]

export const DEMO_STATS = {
  minutesThisMonth: 1350,
  earnedThisMonth: 3487.50,
  activeProjects: 2,
  totalProjects: 4,
  unpaidAmount: 4200,
  unpaidCount: 1,
  avgHourlyRate: 118,
}

export const DEMO_NOTIFICATIONS = [
  { id: 'n1', type: 'invoice', message: 'Invoice #INV-002 sent to FinTech Labs', time: '2 hours ago', read: false },
  { id: 'n2', type: 'payment', message: 'Payment received — $5,100 from Acme Corp', time: '3 days ago', read: false },
  { id: 'n3', type: 'project', message: 'Brand Identity project marked as completed', time: '5 days ago', read: true },
  { id: 'n4', type: 'reminder', message: 'Log your time for today', time: '8 hours ago', read: true },
]
