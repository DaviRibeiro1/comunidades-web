// src/components/modals/ServiceDetailModal.jsx
import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { StatusBadge } from '../ui/Badge'
import { applicationsApi } from '../../api/services'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'

export function ServiceDetailModal({ service, onClose }) {
  const { token } = useAuth()
  const toast = useToast()
  const [applying, setApplying] = useState(false)
  const [message,  setMessage]  = useState('')
  const [applied,  setApplied]  = useState(false)

  async function handleApply() {
    setApplying(true)
    try {
      await applicationsApi.apply(token, service.id, { message })
      setApplied(true)
      toast('Candidatura enviada com sucesso!')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setApplying(false)
    }
  }

  return (
    <Modal
      title={service.title}
      subtitle="Detalhes do anúncio"
      icon={service.icon}
      onClose={onClose}
      footer={
        !applied ? (
          <>
            <button className="btn btn-outline btn-sm" onClick={onClose}>Fechar</button>
            <button className="btn btn-primary btn-sm" onClick={handleApply} disabled={applying}>
              {applying ? '⌛' : '🤝'} Candidatar-se
            </button>
          </>
        ) : (
          <button className="btn btn-outline btn-sm" onClick={onClose}>Fechar</button>
        )
      }
    >
      {applied ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
          <p style={{ fontWeight: 600 }}>Candidatura enviada!</p>
          <p style={{ fontSize: 13, color: 'var(--text-soft)' }}>
            O solicitante irá entrar em contato com você.
          </p>
        </div>
      ) : (
        <>
          <StatusBadge status={service.status} />
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: 16 }}>
              {service.description}
            </p>
            <div className="detail-row">
              <span className="detail-label">💰 Preço</span>
              <span className="detail-value" style={{ color: 'var(--green)', fontWeight: 600 }}>{service.price}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">👤 Solicitante</span>
              <span className="detail-value">{service.requester?.full_name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">📧 Contato</span>
              <span className="detail-value">{service.requester?.email}</span>
            </div>
          </div>
          <div className="form-group" style={{ marginTop: 16 }}>
            <label className="form-label">Mensagem (opcional)</label>
            <textarea
              className="form-textarea"
              placeholder="Apresente-se e explique por que você é a pessoa certa..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              style={{ minHeight: 80 }}
            />
          </div>
        </>
      )}
    </Modal>
  )
}
