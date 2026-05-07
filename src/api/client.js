// src/api/client.js
const BASE_URL = 'https://web-production-8f5c4.up.railway.app'
const LOCAL_URL = 'http://localhost:8000'

export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${LOCAL_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Erro desconhecido' }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }

  if (res.status === 204) return null
  return res.json()
}
