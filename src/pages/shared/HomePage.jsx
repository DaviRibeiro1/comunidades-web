// src/pages/shared/HomePage.jsx
import { useState, useEffect } from 'react'
import { servicesApi } from '../../api/services'
import { useAuth } from '../../contexts/AuthContext'
import { useCommunityEvents } from '../../hooks/useCommunityEvents'
import { StatusBadge } from '../../components/ui/Badge'
import { Loading } from '../../components/ui/Loading'
import { ServiceDetailModal } from '../../components/modals/ServiceDetailModal'
import { NewServiceModal } from '../../components/modals/NewServiceModal'

export function HomePage({ community }) {
  const { token } = useAuth()
  const [services,  setServices]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [selected,  setSelected]  = useState(null)
  const [showNew,   setShowNew]   = useState(false)
  const [search,    setSearch]    = useState('')

  useCommunityEvents(community?.id, token, (newService) => {
    setServices(p => {
      
      if (p.some(s => s.id === newService.id)) return p
      return [newService, ...p]
    })
  })

  useEffect(() => {
    if (!community?.id) return
    setLoading(true)
    servicesApi.byCommunity(token, community.id)
      .then(setServices)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [community?.id, token])

  const filtered = services.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>🏠 {community?.name || 'Comunidade'}</h1>
          <p>Anúncios disponíveis na sua comunidade</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>
          ➕ Criar anúncio
        </button>
      </div>

      {/* Stats */}
      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="stat-card">
          <div className="stat-card-label">Total de anúncios</div>
          <div className="stat-card-value stat-green">{services.length}</div>
          <div className="stat-card-sub">nesta comunidade</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Urgentes</div>
          <div className="stat-card-value stat-red">
            {services.filter(s => s.status === 'URGENT').length}
          </div>
          <div className="stat-card-sub">precisam de atenção</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Abertos</div>
          <div className="stat-card-value stat-blue">
            {services.filter(s => s.status === 'OPEN').length}
          </div>
          <div className="stat-card-sub">aguardando candidatos</div>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <div className="topbar-search" style={{ width: '100%', maxWidth: 400, display:'flex', alignItems:'center', gap:8, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'8px 14px' }}>
          <span>🔍</span>
          <input
            style={{ border:'none', background:'transparent', fontSize:14, color:'var(--text)', outline:'none', width:'100%', fontFamily:"'DM Sans', sans-serif" }}
            placeholder="Buscar anúncios..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>{search ? 'Nenhum anúncio encontrado' : 'Nenhum anúncio ainda'}</h3>
          <p>{search ? 'Tente outras palavras-chave' : 'Seja o primeiro a criar um anúncio!'}</p>
        </div>
      ) : (
        <div className="services-grid">
          {filtered.map(s => (
            <div key={s.id} className="service-card" onClick={() => setSelected(s)}>
              <div className="service-card-icon">{s.icon}</div>
              <div style={{ marginBottom: 8 }}><StatusBadge status={s.status} /></div>
              <div className="service-card-title">{s.title}</div>
              <div className="service-card-summary">{s.description}</div>
              <div className="service-card-footer">
                <span className="service-card-price">{s.price}</span>
                <span className="service-card-requester">👤 {s.requester?.full_name}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <ServiceDetailModal service={selected} onClose={() => setSelected(null)} />
      )}
      {showNew && (
        <NewServiceModal
          communityId={community?.id}
          onClose={() => setShowNew(false)}
          onCreated={s => setServices(p => [s, ...p])}
        />
      )}
    </div>
  )
}
