// src/pages/shared/MyCommunitiesPage.jsx
import { useState } from 'react'
import { RoleBadge } from '../../components/ui/Badge'

const ROLE_LABELS = {
  FOUNDER: 'Fundador',
  MANAGER: 'Gerente',
  MEMBER:  'Membro',
}

export function MyCommunitiesPage({ communities, onSelectCommunity }) {
  const [search, setSearch] = useState('')

  const filtered = communities.filter(c =>
    search === '' ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>🏘️ Minhas Comunidades</h1>
          <p>{communities.length} comunidade{communities.length !== 1 ? 's' : ''} que você participa</p>
        </div>
      </div>

      {/* Busca */}
      <div style={{ marginBottom: 20, maxWidth: 400 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--surface2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', padding: '8px 14px'
        }}>
          <span>🔍</span>
          <input
            style={{ border: 'none', background: 'transparent', fontSize: 14, outline: 'none', width: '100%', fontFamily: "'DM Sans', sans-serif" }}
            placeholder="Buscar por nome ou descrição..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <span style={{ cursor: 'pointer', color: 'var(--text-soft)', fontSize: 18 }}
              onClick={() => setSearch('')}>×</span>
          )}
        </div>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏘️</div>
          <h3>{search ? 'Nenhuma comunidade encontrada' : 'Você não pertence a nenhuma comunidade'}</h3>
          <p>{search ? 'Tente outras palavras-chave' : 'Aguarde um convite ou solicite uma comunidade'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(c => (
            <div
              key={c.id}
              className="card"
            >
              <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* Ícone */}
                <div style={{
                  width: 52, height: 52, borderRadius: 12,
                  background: 'var(--green-pale)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, flexShrink: 0
                }}>🏘️</div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{c.name}</div>
                  {c.description && (
                    <div style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 6 }}>
                      {c.description}
                    </div>
                  )}
                  <RoleBadge role={c.my_role} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}