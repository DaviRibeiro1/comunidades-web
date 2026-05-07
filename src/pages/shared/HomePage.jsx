// src/pages/shared/HomePage.jsx
import { useState, useEffect } from 'react'
import { servicesApi } from '../../api/services'
import { useAuth } from '../../contexts/AuthContext'
import { StatusBadge } from '../../components/ui/Badge'
import { Loading } from '../../components/ui/Loading'
import { ServiceDetailModal } from '../../components/modals/ServiceDetailModal'
import { NewServiceModal } from '../../components/modals/NewServiceModal'
import { useCommunityEvents } from '../../hooks/useCommunityEvents'
import { MOCK_SERVICES } from '../../api/mockServices'

export function HomePage({ community }) {
  const { token } = useAuth()
  const [services,       setServices]       = useState([])
  const [loading,        setLoading]        = useState(true)
  const [selected,       setSelected]       = useState(null)
  const [showNew,        setShowNew]        = useState(false)
  const [search,         setSearch]         = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL') // ← novo

  useEffect(() => {
    if (!community?.id) return
    setLoading(true)
    servicesApi.byCommunity(token, community.id)
      .then(data => 
        setServices([...data, ...MOCK_SERVICES])
      )
      .catch(() => setServices(MOCK_SERVICES)) // ← fallback para dados mockados
      .finally(() => setLoading(false))
  }, [community?.id, token])

  // SSE — atualiza lista em tempo real
  useCommunityEvents(community?.id, token, (newService) => {
    setServices(p => p.some(s => s.id === newService.id) ? p : [newService, ...p])
  })

  // ── Filtros aplicados ─────────────────────────────────────────
  const filtered = services.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
                        s.description.toLowerCase().includes(search.toLowerCase())
    const matchCategory = categoryFilter === 'ALL' || s.category === categoryFilter
    return matchSearch && matchCategory
  })

  const totalServices = services.filter(s => s.category === 'SERVICE').length
  const totalProducts = services.filter(s => s.category === 'PRODUCT').length

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
          <div className="stat-card-label">Serviços</div>
          <div className="stat-card-value stat-blue">{totalServices}</div>
          <div className="stat-card-sub">disponíveis</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Produtos</div>
          <div className="stat-card-value stat-amber">{totalProducts}</div>
          <div className="stat-card-sub">disponíveis</div>
        </div>
      </div>

      {/* Busca + Filtros */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>

        {/* Campo de busca */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--surface2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', padding: '8px 14px', flex: 1, minWidth: 200
        }}>
          <span>🔍</span>
          <input
            style={{ border: 'none', background: 'transparent', fontSize: 14, outline: 'none', width: '100%', fontFamily: "'DM Sans', sans-serif" }}
            placeholder="Buscar por título ou descrição..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <span style={{ cursor: 'pointer', color: 'var(--text-soft)', fontSize: 18 }}
              onClick={() => setSearch('')}>×</span>
          )}
        </div>

        {/* Filtros de categoria */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { value: 'ALL',     label: '🔎 Todos',    count: services.length },
            { value: 'SERVICE', label: '🔧 Serviços', count: totalServices },
            { value: 'PRODUCT', label: '📦 Produtos', count: totalProducts },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setCategoryFilter(f.value)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                border: `2px solid ${categoryFilter === f.value ? 'var(--green)' : 'var(--border)'}`,
                background: categoryFilter === f.value ? 'var(--green-pale)' : 'var(--surface)',
                color: categoryFilter === f.value ? 'var(--green)' : 'var(--text-mid)',
                fontWeight: categoryFilter === f.value ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all .15s',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {f.label}
              <span style={{
                background: categoryFilter === f.value ? 'var(--green)' : 'var(--border)',
                color: categoryFilter === f.value ? 'white' : 'var(--text-soft)',
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 700,
                padding: '1px 7px',
                fontFamily: "'Sora', sans-serif",
              }}>
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Resultado da busca */}
      {(search || categoryFilter !== 'ALL') && (
        <p style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 16 }}>
          {filtered.length === 0
            ? 'Nenhum anúncio encontrado'
            : `${filtered.length} anúncio${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`}
          {categoryFilter !== 'ALL' && ` em ${categoryFilter === 'SERVICE' ? 'Serviços' : 'Produtos'}`}
          {search && ` para "${search}"`}
          {' '}—{' '}
          <span
            style={{ color: 'var(--green)', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => { setSearch(''); setCategoryFilter('ALL') }}
          >
            limpar filtros
          </span>
        </p>
      )}

      {/* Lista de anúncios */}
      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            {categoryFilter === 'SERVICE' ? '🔧' : categoryFilter === 'PRODUCT' ? '📦' : '📭'}
          </div>
          <h3>
            {search
              ? 'Nenhum anúncio encontrado'
              : categoryFilter === 'ALL'
                ? 'Nenhum anúncio ainda'
                : `Nenhum ${categoryFilter === 'SERVICE' ? 'serviço' : 'produto'} ainda`}
          </h3>
          <p>
            {search
              ? 'Tente outras palavras-chave'
              : 'Seja o primeiro a criar um anúncio!'}
          </p>
        </div>
      ) : (
        <div className="services-grid">
          {filtered.map(s => (
            <ServiceCard key={s.id} service={s} onClick={() => setSelected(s)} />
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

// ── Service Card com foto ─────────────────────────────────────────────────
function ServiceCard({ service, onClick }) {
  return (
    <div className="service-card" onClick={onClick}>
      {/* Foto ou placeholder */}
      {service.photo_url ? (
        <img
          src={service.photo_url}
          alt={service.title}
          style={{
            width: '100%', height: 160,
            objectFit: 'cover',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 12,
            display: 'block',
          }}
          onError={e => { e.target.style.display = 'none' }}
        />
      ) : (
        <div style={{
          width: '100%', height: 100,
          background: 'var(--surface2)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 40, marginBottom: 12,
        }}>
          {service.icon || (service.category === 'PRODUCT' ? '📦' : '🔧')}
        </div>
      )}

      {/* Badge de categoria */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center' }}>
        <span style={{
          background: service.category === 'PRODUCT' ? '#FEF3C7' : 'var(--green-pale)',
          color: service.category === 'PRODUCT' ? 'var(--amber)' : 'var(--green)',
          padding: '2px 8px', borderRadius: 99,
          fontSize: 11, fontWeight: 700,
          fontFamily: "'Sora', sans-serif",
        }}>
          {service.category === 'PRODUCT' ? '📦 Produto' : '🔧 Serviço'}
        </span>
      </div>

      <div className="service-card-title">{service.title}</div>
      <div className="service-card-summary">{service.description}</div>
      <div className="service-card-footer">
        <span className="service-card-price">{service.price}</span>
        <span className="service-card-requester">👤 {service.requester?.full_name}</span>
      </div>
    </div>
  )
}