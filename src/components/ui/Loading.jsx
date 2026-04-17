// src/components/ui/Loading.jsx
export function Loading() {
  return (
    <div className="loading">
      <div className="spinner" />
      <span>Carregando...</span>
    </div>
  )
}

// src/components/ui/EmptyState.jsx
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div style={{ marginTop: 20 }}>{action}</div>}
    </div>
  )
}
