import { Modal } from '../ui/Modal'

export function PromotionInviteModal({
  community,
  loading,
  onAccept,
  onDecline,
  onClose,
}) {
  const communityName = community?.name || 'sua comunidade'

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
      }}>
        <p style={{ fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.5, margin: 0 }}>
          Você foi convidado para ser gerente da comunidade{' '}
          <strong style={{ color: 'var(--green)' }}>{communityName}</strong>.
        </p>
      </div>
    </Modal>
  )
}
