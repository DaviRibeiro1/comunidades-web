// src/components/ui/Badge.jsx
export const STATUS_LABELS = {
  URGENT: 'Urgente', OPEN: 'Aberto', VOLUNTEER: 'Voluntários',
  NEEDS_HELP: 'Precisa de ajuda', NEGOTIATING: 'Negociando', CLOSED: 'Fechado'
}
export const STATUS_ICONS = {
  URGENT: '🔴', OPEN: '🟢', VOLUNTEER: '🔵',
  NEEDS_HELP: '🟡', NEGOTIATING: '🟣', CLOSED: '⚫'
}

export function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-${status}`}>
      {STATUS_ICONS[status]} {STATUS_LABELS[status]}
    </span>
  )
}

export function RoleBadge({ role }) {
  const labels = { OWNER: 'Admin', MANAGER: 'Fundador', MEMBER: 'Membro' }
  return (
    <span className={`role-badge role-${role?.toLowerCase()}`}>
      {labels[role] || role}
    </span>
  )
}
