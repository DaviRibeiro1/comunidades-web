// src/components/modals/ServiceDetailModal.jsx
import { useState } from 'react'
import { Modal } from '../ui/Modal'
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
      toast('Mensagem enviada com sucesso!')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setApplying(false)
    }
  }

  return (
    <Modal
      onClose={onClose}
      footer={
        !applied ? (
          <>
            <button className="btn btn-outline btn-sm" onClick={onClose}>Fechar</button>
            <button className="btn btn-primary btn-sm" onClick={handleApply} disabled={applying}>
              {applying ? '⌛' : '🤝'} Enviar Mensagem
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
          <p style={{ fontWeight: 600 }}>Mensagem enviada!</p>
          <p style={{ fontSize: 13, color: 'var(--text-soft)' }}>
            O anunciante irá entrar em contato com você.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Nova Imagem de Destaque no topo */}
          <div style={{ 
            width: '100%', 
            height: '200px', 
            backgroundColor: 'var(--bg-soft)', 
            borderRadius: '8px', 
            overflow: 'hidden' 
          }}>
            {service.photo_url ? (
              <img 
                src={service.photo_url} 
                alt={service.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                📷
              </div>
            )}
          </div>

          {/* Título e Subtítulo movidos para baixo da foto */}
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px 0', color: 'var(--text)' }}>
              {service.title}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-soft)', margin: 0 }}>
              Detalhes do anúncio
            </p>
          </div>

          <p style={{ fontSize: '14px', color: 'var(--text-mid)', lineHeight: 1.6 }}>
            {service.description}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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

          <div className="form-group" style={{ marginTop: 8 }}>
            <label className="form-label">Mensagem</label>
            <textarea
              className="form-textarea"
              placeholder="Envie uma mensagem para o anunciante"
              value={message}
              onChange={e => setMessage(e.target.value)}
              style={{ minHeight: 80 }}
            />
          </div>
        </div>
      )}
    </Modal>
  )
}
