// src/pages/manager/ManageServicesPage.jsx
import { useState, useEffect } from 'react'
import { servicesApi } from '../../api/services'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { StatusBadge } from '../../components/ui/Badge'
import { Loading } from '../../components/ui/Loading'
import { Confirm } from '../../components/ui/Modal'

export function ManageServicesPage({ community }) {
  const { token } = useAuth()
  const toast = useToast()
  const [services, setServices] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [confirm,  setConfirm]  = useState(null)

  useEffect(() => {
    if (!community?.id) return
    servicesApi.byCommunity(token, community.id)
      .then(setServices)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [community?.id, token])

  async function del(id, title) {
    try {
      await servicesApi.managerDelete(token, id)
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
          <h1>🔧 Gerenciar Anúncios</h1>
          <p>{services.length} anúncio(s) em {community?.name}</p>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : services.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔧</div>
          <h3>Sem anúncios</h3>
          <p>Nenhum anúncio cadastrado ainda.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Anúncio</th>
                  <th>Solicitante</th>
                  <th>Status</th>
                  <th>Preço</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {services.map(s => (
                  <tr key={s.id}>
                    <td>
                      <strong>{s.icon} {s.title}</strong>
                      <br />
                      <span style={{ fontSize: 12, color: 'var(--text-soft)' }}>
                        {s.description?.slice(0, 50)}...
                      </span>
                    </td>
                    <td>{s.requester?.full_name}</td>
                    <td><StatusBadge status={s.status} /></td>
                    <td style={{ color: 'var(--green)', fontWeight: 600 }}>{s.price}</td>
                    <td>
                      <button className="btn btn-danger btn-sm"
                        onClick={() => setConfirm({ id: s.id, title: s.title })}>
                        🗑️ Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {confirm && (
        <Confirm
          title="Remover anúncio?"
          danger
          text={`O anúncio "${confirm.title}" será removido permanentemente.`}
          onConfirm={() => del(confirm.id, confirm.title)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
