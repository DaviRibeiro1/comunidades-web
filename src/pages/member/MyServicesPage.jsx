// src/pages/member/MyServicesPage.jsx
import { useState, useEffect } from 'react'
import { servicesApi } from '../../api/services'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { Loading } from '../../components/ui/Loading'
import { Confirm } from '../../components/ui/Modal'
import { NewServiceModal } from '../../components/modals/NewServiceModal'
import { EditServiceModal } from '../../components/modals/EditServiceModal'

export function MyServicesPage({ community }) {
  const { token } = useAuth()
  const toast = useToast()
  const [services,  setServices]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [showNew,   setShowNew]   = useState(false)
  const [confirm,   setConfirm]   = useState(null)
  
  // Novo estado para controlar qual anúncio está sendo editado
  const [editingService, setEditingService] = useState(null)

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
            <div key={s.id} className="service-card" style={{ cursor: 'default', padding: 0, overflow: 'hidden' }}>
              
              {/* Foto do anúncio destacada no topo */}
              <div style={{ width: '100%', height: '160px', backgroundColor: 'var(--bg-soft)', position: 'relative' }}>
                {s.photo_url || s.image_url ? (
                  <img 
                    src={s.photo_url || s.image_url} 
                    alt={s.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                    📷
                  </div>
                )}
                
                {/* Badge de categoria sobreposto na imagem */}
                <div style={{ 
                  position: 'absolute', top: 8, left: 8, 
                  background: 'rgba(0,0,0,0.6)', color: 'white', 
                  padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500 
                }}>
                  {s.category === 'PRODUCT' ? '📦 Produto' : '🔧 Serviço'}
                </div>
              </div>

              {/* Informações de texto */}
              <div style={{ padding: '16px' }}>
                <div className="service-card-title" style={{ fontSize: '16px', marginBottom: '4px' }}>
                  {s.title}
                </div>
                <div className="service-card-summary" style={{ 
                  marginBottom: '12px', fontSize: '13px', color: 'var(--text-soft)', 
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' 
                }}>
                  {s.description}
                </div>
                <div className="service-card-price" style={{ color: 'var(--green)', fontWeight: 600, marginBottom: '16px' }}>
                  {s.price}
                </div>

                {/* Botões de Ação (Editar e Excluir) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button 
                    className="btn btn-outline btn-sm" 
                    onClick={() => setEditingService(s)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => setConfirm({ id: s.id, title: s.title })}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    🗑️ Excluir
                  </button>
                </div>
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

      {/* Modal de Edição */}
      {editingService && (
        <EditServiceModal
          service={editingService}
          onClose={() => setEditingService(null)}
          onUpdated={(updatedService) => {
            // Atualiza apenas o card que foi editado sem precisar recarregar a página
            setServices(p => p.map(s => s.id === updatedService.id ? updatedService : s))
          }}
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