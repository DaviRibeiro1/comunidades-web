// src/pages/shared/NotificationsPage.jsx

export function NotificationsPage({ notifications, onMarkAll, onMarkOne }) {
  const unread = notifications.filter(n => !n.is_read).length

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>🔔 Notificações</h1>
          <p>{unread} não lida{unread !== 1 ? 's' : ''}</p>
        </div>
        {unread > 0 && (
          <button className="btn btn-outline btn-sm" onClick={onMarkAll}>
            ✓ Marcar todas como lidas
          </button>
        )}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔔</div>
            <h3>Sem notificações</h3>
            <p>Você está em dia!</p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              className={`notif-item ${!n.is_read ? 'unread' : ''}`}
              onClick={() => !n.is_read && onMarkOne(n.id)}
            >
              <div className={`notif-dot ${n.is_read ? 'read' : ''}`} />
              <div>
                <div className="notif-title">{n.title}</div>
                <div className="notif-body">{n.body}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
