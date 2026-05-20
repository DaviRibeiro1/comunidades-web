// src/api/services.js
import { apiFetch } from './client'

// ── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  login:    (body)  => apiFetch('/auth/login', { method: 'POST', body }),
  me:       (token) => apiFetch('/auth/me', { token }),
  register: (body)  => apiFetch('/auth/register', { method: 'POST', body }),
}

// ── Communities ───────────────────────────────────────────────────────────
export const communitiesApi = {
  list:       (token)            => apiFetch('/communities/', { token }),
  listAll:    (token)            => apiFetch('/communities/all', { token }),
  join:       (token, id)        => apiFetch(`/communities/${id}/join`, { method: 'POST', token }),
  leave:      (token, id)        => apiFetch(`/communities/${id}/leave`, { method: 'DELETE', token }),
  members:    (token, id)        => apiFetch(`/communities/${id}/members`, { token }),
  removeMember: (token, cId, uId) => apiFetch(`/communities/${cId}/members/${uId}`, { method: 'DELETE', token }),
  changeRole: (token, cId, uId, role) => apiFetch(`/communities/${cId}/members/${uId}/role?new_role=${role}`, { method: 'PATCH', token }),
}

// ── Services ──────────────────────────────────────────────────────────────
export const servicesApi = {
  byCommunity: (token, cId)  => apiFetch(`/services/community/${cId}`, { token }),
  manage:      (token, cId)  => apiFetch(`/services/community/${cId}/manage`, { token }),
  myServices:  (token)       => apiFetch('/services/my', { token }),
  create:      (token, body) => apiFetch('/services/', { method: 'POST', token, body }),
  update:      (token, id, body) => apiFetch(`/services/${id}`, { method: 'PATCH', token, body }),
  delete:      (token, id)   => apiFetch(`/services/${id}`, { method: 'DELETE', token }),
  managerDelete: (token, id) => apiFetch(`/services/manager/${id}`, { method: 'DELETE', token }),
}

// ── Applications ──────────────────────────────────────────────────────────
export const applicationsApi = {
  apply:       (token, serviceId, body) => apiFetch(`/services/${serviceId}/applications/`, { method: 'POST', token, body }),
  list:        (token, serviceId)       => apiFetch(`/services/${serviceId}/applications/`, { token }),
  myApplications: (token)              => apiFetch('/applications/my', { token }),
  cancel:      (token, id)             => apiFetch(`/applications/my/${id}`, { method: 'DELETE', token }),
  updateStatus: (token, serviceId, appId, status) =>
    apiFetch(`/services/${serviceId}/applications/${appId}?status=${status}`, { method: 'PATCH', token }),
}

// ── Community Requests ────────────────────────────────────────────────────
export const requestsApi = {
  create:    (body)              => apiFetch('/community-requests/', { method: 'POST', body }),
  pending:   (token)             => apiFetch('/community-requests/pending', { token }),
  review:    (token, id, approve) => apiFetch(`/community-requests/${id}/review?approve=${approve}`, { method: 'PATCH', token }),
}

// ── Invites ───────────────────────────────────────────────────────────────
export const invitesApi = {
  send:     (token, body) => apiFetch('/invites/', { method: 'POST', token, body }),
  validate: (token)       => apiFetch(`/invites/validate/${token}`),
}

// ── Notifications ─────────────────────────────────────────────────────────
export const notificationsApi = {
  list:       (token) => apiFetch('/notifications/', { token }),
  unreadCount:(token) => apiFetch('/notifications/unread-count', { token }),
  markRead:   (token, id) => apiFetch(`/notifications/${id}/read`, { method: 'PATCH', token }),
  markAllRead:(token) => apiFetch('/notifications/read-all', { method: 'PATCH', token }),
}
