// src/pages/owner/PendingRequestsPage.jsx
import { useState, useEffect } from 'react'
import { requestsApi } from '../../api/services'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { Loading } from '../../components/ui/Loading'
import { Modal, Confirm } from '../../components/ui/Modal'

function RequestDetailModal({ request: r, onClose, onApprove, onReject }) {
  return (
    <Modal
      title="Detalhes do Pedido"
      icon="🏘️"
      subtitle={r.community_name}
      onClose={onClose}
      footer={
        <>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onReject(r)}
          >
            ✕ Recusar
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onApprove(r)}
          >
            ✓ Aprovar
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <section>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-soft)', marginBottom: 8 }}>
            Solicitante
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <DetailRow icon="👤" label="Nome"     value={r.requester_name} />
            <DetailRow icon="📧" label="E-mail"   value={r.requester_email} />
            <DetailRow icon="🪪" label="CPF"      value={r.requester_cpf || '—'} />
            <DetailRow icon="📍" label="Endereço" value={r.requester_address || '—'} />
          </div>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

        <section>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-soft)', marginBottom: 8 }}>
            Comunidade
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <DetailRow icon="🏘️" label="Nome"      value={r.community_name} />
            <DetailRow icon="📝" label="Descrição" value={r.community_description || 'Sem descrição'} />
          </div>
        </section>
      </div>
    </Modal>
  )
}

function DetailRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', gap: 8, fontSize: 14, alignItems: 'flex-start' }}>
      <span style={{ minWidth: 20 }}>{icon}</span>
      <span style={{ color: 'var(--text-soft)', minWidth: 70 }}>{label}:</span>
      <span style={{ color: 'var(--text)', wordBreak: 'break-word' }}>{value}</span>
    </div>
  )
}

export function PendingRequestsPage() {
  const { token } = useAuth()
  const toast = useToast()
  const [requests,  setRequests]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [confirm,   setConfirm]   = useState(null)
  const [detailOf,  setDetailOf]  = useState(null)

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
    setDetailOf(null)
  }

  function openConfirm(r, approve) {
    setDetailOf(null)
    setConfirm({ id: r.id, approve, name: r.community_name, action: approve ? 'aprovar' : 'recusar' })
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
                <div className="request-card-meta-item" style={{ marginTop: 4 }}>
                  👤 <strong>{r.requester_name}</strong>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <span className="status-badge" style={{ background: '#FEF3C7', color: '#92400E' }}>
                  ⏳ Pendente
                </span>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setDetailOf(r)}
                >
                  🔍 Ver detalhes
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {detailOf && (
        <RequestDetailModal
          request={detailOf}
          onClose={() => setDetailOf(null)}
          onApprove={r => openConfirm(r, true)}
          onReject={r  => openConfirm(r, false)}
        />
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
