const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

function getToken() {
  return localStorage.getItem('ft_token')
}

async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const opts = { method, headers }
  // Only attach body if it has actual content
  if (body !== null && body !== undefined && Object.keys(body).length > 0) {
    opts.body = JSON.stringify(body)
  }

  const res = await fetch(`${BASE}${path}`, opts)

  if (res.status === 401) {
    localStorage.removeItem('ft_token')
    localStorage.removeItem('ft_user')
    window.location.href = '/login'
    return
  }

  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Something went wrong')
  return json
}

export const api = {
  get:    (path)        => request('GET',    path),
  post:   (path, body)  => request('POST',   path, body),
  put:    (path, body)  => request('PUT',    path, body),
  delete: (path, body)  => request('DELETE', path, body),
}
