// src/pages/owner/AllCommunitiesPage.jsx
import { useState, useEffect } from 'react'
import { communitiesApi } from '../../api/services'
import { useAuth } from '../../contexts/AuthContext'
import { Loading } from '../../components/ui/Loading'

export function AllCommunitiesPage() {
  const { token } = useAuth()
  const [communities, setCommunities] = useState([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    communitiesApi.listAll(token)
      .then(setCommunities)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  const totalMembers  = communities.reduce((a, c) => a + (c.member_count  || 0), 0)
  const totalServices = communities.reduce((a, c) => a + (c.server_count || 0), 0)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>🌍 Todas as Comunidades</h1>
          <p>Visão global de todas as comunidades da plataforma</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="stat-card">
          <div className="stat-card-label">Comunidades</div>
          <div className="stat-card-value stat-green">{communities.length}</div>
          <div className="stat-card-sub">ativas na plataforma</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Total de membros</div>
          <div className="stat-card-value stat-blue">{totalMembers}</div>
          <div className="stat-card-sub">em todas as comunidades</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Total de anúncios</div>
          <div className="stat-card-value stat-amber">{totalServices}</div>
          <div className="stat-card-sub">publicados</div>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Comunidade</th>
                  <th>Descrição</th>
                  <th>Membros</th>
                  <th>Anúncios</th>
                </tr>
              </thead>
              <tbody>
                {communities.map(c => (
                  <tr key={c.id}>
                    <td><strong>🏘️ {c.name}</strong></td>
                    <td style={{ color: 'var(--text-soft)' }}>{c.description || '—'}</td>
                    <td>
                      <span style={{ background: 'var(--green-pale)', color: 'var(--green)', padding: '2px 10px', borderRadius: 99, fontSize: 13, fontWeight: 600 }}>
                        👥 {c.member_count || 0}
                      </span>
                    </td>
                    <td>
                      <span style={{ background: '#EFF6FF', color: 'var(--blue)', padding: '2px 10px', borderRadius: 99, fontSize: 13, fontWeight: 600 }}>
                        🔧 {c.server_count || 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
