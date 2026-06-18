import { Modal } from '../ui/Modal'

export function PromotionInviteModal({
  communityName,
  inviterName,
  loading,
  onAccept,
  onDecline,
  onClose,
}) {
  return (
    <Modal
      title="Convite para ser gerente"
      subtitle="Você foi convidado para assumir um papel de liderança"
      icon="⭐"
      onClose={onClose}
      footer={
        <>
          <button
            className="btn btn-outline btn-sm"
            onClick={onDecline}
            disabled={loading}
          >
            Recusar
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={onAccept}
            disabled={loading}
          >
            {loading ? '⌛' : '✓ Aceitar'}
          </button>
        </>
      }
    >
      <div style={{
        background: 'var(--green-pale)',
        border: '1px solid var(--green-mid)',
        borderRadius: 8,
        padding: 14,
        marginBottom: 16,
      }}>
        <p style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>
          Você recebeu um convite de promoção!
        </p>
      </div>

      <div className="detail-row">
        <span className="detail-label">🏘️ Comunidade</span>
        <span className="detail-value" style={{ fontWeight: 600 }}>
          {communityName || '—'}
        </span>
      </div>
      <div className="detail-row">
        <span className="detail-label">👤 Convidado por</span>
        <span className="detail-value">{inviterName || '—'}</span>
      </div>
    </Modal>
  )
}
