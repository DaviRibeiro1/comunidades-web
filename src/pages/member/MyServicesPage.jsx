// src/pages/member/MyServicesPage.jsx
import { useState, useEffect } from 'react'
import { servicesApi } from '../../api/services'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { StatusBadge } from '../../components/ui/Badge'
import { Loading } from '../../components/ui/Loading'
import { Confirm } from '../../components/ui/Modal'
import { NewServiceModal } from '../../components/modals/NewServiceModal'

export function MyServicesPage({ community }) {
  const { token } = useAuth()
  const toast = useToast()
  const [services,  setServices]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [showNew,   setShowNew]   = useState(false)
  const [confirm,   setConfirm]   = useState(null)

  useEffect(() => {
    servicesApi.myServices(token)
      .then(setServices)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  async function del(id, title) {
    try {
      await servicesApi.delete(token, id)
      setServices(p => p.filter(s => s.id !== id))
      toast(`"${title}" removido`)
    } catch (err) {
      toast(err.message, 'error')
    }
    setConfirm(null)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>📋 Meus Anúncios</h1>
          <p>Anúncios que você criou</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>
          ➕ Novo Anúncio
        </button>
      </div>

      {loading ? (
        <Loading />
      ) : services.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>Nenhum anúncio criado</h3>
          <p>Clique em "Novo Anúncio" para publicar seu primeiro anúncio.</p>
        </div>
      ) : (
        <div className="services-grid">
          {services.map(s => (
            <div key={s.id} className="service-card" style={{ cursor: 'default' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="service-card-icon">{s.icon}</div>
                <button className="btn btn-danger btn-sm"
                  onClick={() => setConfirm({ id: s.id, title: s.title })}>
                  🗑️
                </button>
              </div>
              <div style={{ marginBottom: 6 }}><StatusBadge status={s.status} /></div>
              <div className="service-card-title">{s.title}</div>
              <div className="service-card-summary">{s.description}</div>
              <div className="service-card-footer">
                <span className="service-card-price">{s.price}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showNew && (
        <NewServiceModal
          communityId={community?.id}
          onClose={() => setShowNew(false)}
          onCreated={s => setServices(p => [s, ...p])}
        />
      )}

      {confirm && (
        <Confirm
          title="Remover anúncio?"
          danger
          text={`"${confirm.title}" será removido permanentemente.`}
          onConfirm={() => del(confirm.id, confirm.title)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
