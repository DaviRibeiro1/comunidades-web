// src/pages/owner/PendingRequestsPage.jsx
import { useState, useEffect } from 'react'
import { requestsApi } from '../../api/services'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { Loading } from '../../components/ui/Loading'
import { Confirm } from '../../components/ui/Modal'

export function PendingRequestsPage() {
  const { token } = useAuth()
  const toast = useToast()
  const [requests, setRequests] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [confirm,  setConfirm]  = useState(null)

  useEffect(() => {
    requestsApi.pending(token)
      .then(setRequests)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  async function review(id, approve) {
    try {
      await requestsApi.review(token, id, approve)
      setRequests(p => p.filter(r => r.id !== id))
      toast(approve ? '✅ Comunidade aprovada!' : '❌ Pedido recusado')
    } catch (err) {
      toast(err.message, 'error')
    }
    setConfirm(null)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>⏳ Pedidos Pendentes</h1>
          <p>{requests.length} pedido(s) aguardando revisão</p>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <h3>Tudo em dia!</h3>
          <p>Nenhum pedido pendente no momento.</p>
        </div>
      ) : (
        requests.map(r => (
          <div key={r.id} className="request-card">
            <div className="request-card-header">
              <div>
                <div className="request-card-title">🏘️ {r.community_name}</div>
                <div className="request-card-desc">{r.community_description || 'Sem descrição'}</div>
              </div>
              <span className="status-badge" style={{ background: '#FEF3C7', color: '#92400E' }}>
                ⏳ Pendente
              </span>
            </div>
            <div className="request-card-meta">
              <div className="request-card-meta-item">👤 <strong>{r.requester_name}</strong></div>
              <div className="request-card-meta-item">📧 {r.requester_email}</div>
            </div>
            <div className="request-card-actions">
              <button
                className="btn btn-danger btn-sm"
                onClick={() => setConfirm({ id: r.id, approve: false, name: r.community_name, action: 'recusar' })}
              >
                ✕ Recusar
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setConfirm({ id: r.id, approve: true, name: r.community_name, action: 'aprovar' })}
              >
                ✓ Aprovar
              </button>
            </div>
          </div>
        ))
      )}

      {confirm && (
        <Confirm
          title={`Deseja ${confirm.action}?`}
          text={`A comunidade "${confirm.name}" será ${confirm.approve
            ? 'criada e o solicitante notificado como Gerente'
            : 'rejeitada e o solicitante notificado'}.`}
          danger={!confirm.approve}
          onConfirm={() => review(confirm.id, confirm.approve)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
