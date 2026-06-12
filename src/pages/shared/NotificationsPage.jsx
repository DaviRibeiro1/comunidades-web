// src/pages/shared/NotificationsPage.jsx
import { useState } from 'react'
import { apiFetch } from '../../api/client'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'

export function NotificationsPage({ notifications, onMarkAll, onMarkOne, onCommunitiesReload }) {
  const { token } = useAuth()
  const toast     = useToast()
  const [inviteData,  setInviteData]  = useState(null)
  const [inviteToken, setInviteToken] = useState(null)
  const [loading,     setLoading]     = useState(false)

  async function handleNotificationClick(n) {
    // ← notificações já lidas de comunidade não abrem modal
    if (n.type === 'COMMUNITY_APPROVED' && n.is_read) return

    if (!n.is_read) onMarkOne(n.id)

    if (n.type === 'COMMUNITY_APPROVED' && n.reference_id) {
      setLoading(true)
      try {
        const data = await apiFetch(`/invites/validate/${n.reference_id}`)
        setInviteData(data)
        setInviteToken(n.reference_id)
      } catch (err) {
        toast('Convite expirado ou inválido', 'error')
      } finally {
        setLoading(false)
      }
    }
  }

  async function handleConfirm() {
    setLoading(true)
    try {
      const res = await apiFetch('/invites/accept', {
        method: 'POST',
        token,
        body: { token: inviteToken }
      })
      const me = await apiFetch('/auth/me', { token: res.access_token })
      localStorage.setItem('token', res.access_token)
      localStorage.setItem('user', JSON.stringify(me))
      toast('🎉 Comunidade criada com sucesso!')
      setInviteData(null)
      setInviteToken(null)
      onCommunitiesReload()
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── helper: define cursor e interatividade por notificação ──────
  function isClickable(n) {
    if (n.type === 'COMMUNITY_APPROVED') return !n.is_read
    return false
  }

  const unread = notifications.filter(n => !n.is_read).length

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>🔔 Notificações</h1>
          <p>{unread} não lida{unread !== 1 ? 's' : ''}</p>
        </div>
        {unread > 0 && (
          <button className="btn btn-outline btn-sm" onClick={onMarkAll}>
            ✓ Marcar todas como lidas
          </button>
        )}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔔</div>
            <h3>Sem notificações</h3>
            <p>Você está em dia!</p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              className={`notif-item ${!n.is_read ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(n)}
              style={{
                cursor:  isClickable(n) ? 'pointer' : 'default',
                opacity: n.type === 'COMMUNITY_APPROVED' && n.is_read ? 0.6 : 1,
              }}
            >
              <div className={`notif-dot ${n.is_read ? 'read' : ''}`} />
              <div style={{ flex: 1 }}>
                <div className="notif-title">{n.title}</div>
                <div className="notif-body">{n.body}</div>

                {/* badge acionável — só se não lida */}
                {n.type === 'COMMUNITY_APPROVED' && !n.is_read && (
                  <span style={{
                    fontSize: 11, color: 'var(--green)',
                    fontWeight: 600, marginTop: 4, display: 'block'
                  }}>
                    → Clique para confirmar
                  </span>
                )}

                {/* badge já confirmada */}
                {n.type === 'COMMUNITY_APPROVED' && n.is_read && (
                  <span style={{
                    fontSize: 11, color: 'var(--text-soft)',
                    marginTop: 4, display: 'block'
                  }}>
                    ✓ Já confirmado
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de confirmação */}
      {inviteData && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <span className="modal-icon">🎉</span>
              <div>
                <h2>Comunidade aprovada!</h2>
                <p>Confirme os dados para acessar sua comunidade</p>
              </div>
            </div>
            <div className="modal-body">
              <div style={{
                background: 'var(--green-pale)', border: '1px solid var(--green-mid)',
                borderRadius: 8, padding: 14, marginBottom: 16
              }}>
                <p style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>
                  ✅ Seu pedido foi aprovado!
                </p>
              </div>

              <div className="detail-row">
                <span className="detail-label">🏘️ Comunidade</span>
                <span className="detail-value" style={{ fontWeight: 600 }}>
                  {inviteData.community_name}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">👤 Fundador</span>
                <span className="detail-value">{inviteData.prefill_name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">📧 E-mail</span>
                <span className="detail-value">{inviteData.email}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => { setInviteData(null); setInviteToken(null) }}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? '⌛' : '✓ Confirmar e entrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}