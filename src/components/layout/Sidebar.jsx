// src/components/layout/Sidebar.jsx
import { RoleBadge } from '../ui/Badge'

const NAV_BY_ROLE = {
  OWNER: [
    { id: 'home',            icon: '🏠', label: 'Início' },
    { id: 'pending',         icon: '⏳', label: 'Pedidos Pendentes' },
    { id: 'all_communities', icon: '🌍', label: 'Todas as Comunidades' },
    { id: 'notifications',   icon: '🔔', label: 'Notificações' },
  ],
  FOUNDER: [
    { id: 'home',             icon: '🏠', label: 'Início' },
    { id: 'my_communities',   icon: '🏘️', label: 'Minhas Comunidades' },
    { id: 'manage_community', icon: '⚙️', label: 'Gerenciar Comunidade' },
    { id: 'notifications',    icon: '🔔', label: 'Notificações' },
  ],
  MANAGER: [
    { id: 'home',             icon: '🏠', label: 'Início' },
    { id: 'my_communities',   icon: '🏘️', label: 'Minhas Comunidades' },
    { id: 'manage_community', icon: '⚙️', label: 'Gerenciar Comunidade' },
    { id: 'notifications',    icon: '🔔', label: 'Notificações' },
  ],
  MEMBER: [
    { id: 'home',            icon: '🏠', label: 'Início' },
    { id: 'my_communities',  icon: '🏘️', label: 'Minhas Comunidades' },
    { id: 'my_services',     icon: '📋', label: 'Meus Anúncios' },
    { id: 'my_applications', icon: '✅', label: 'Minhas Candidaturas' },
    { id: 'notifications',   icon: '🔔', label: 'Notificações' },
  ],
}

export function Sidebar({
  user, page, setPage,
  communities, selectedCommunity, setSelectedCommunity,
  onLogout, unreadCount,
}) {
  const effectiveRole = selectedCommunity?.my_role || user?.global_role || 'MEMBER'
  const items = NAV_BY_ROLE[effectiveRole] || NAV_BY_ROLE.MEMBER

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🏘️</div>
        <h2>Comunidades</h2>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-user-name">{user?.full_name}</div>
        <div className="sidebar-user-email">{user?.email}</div>
        <RoleBadge role={effectiveRole} />
      </div>

      {effectiveRole !== 'OWNER' && communities.length > 0 && (
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>
            Comunidade ativa
          </div>
          <select
            className="form-select"
            style={{ fontSize: 13, padding: '6px 10px' }}
            value={selectedCommunity?.id || ''}
            onChange={e => {
              const c = communities.find(c => String(c.id) === e.target.value)
              if (c) setSelectedCommunity(c)
            }}
          >
            {communities.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      <nav className="sidebar-nav">
        {items.map(item => (
          <div
            key={item.id}
            className={`nav-item ${page === item.id ? 'active' : ''}`}
            onClick={() => setPage(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
            {item.id === 'notifications' && unreadCount > 0 && (
              <span className="nav-badge">{unreadCount}</span>
            )}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>🚪 Sair da conta</button>
      </div>
    </div>
  )
}