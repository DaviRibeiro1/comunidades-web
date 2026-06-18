// src/pages/shared/NotificationsPage.jsx
import { useState, useEffect } from 'react'
import { apiFetch } from '../../api/client'
import { communitiesApi } from '../../api/services'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { PromotionInviteModal } from '../../components/modals/PromotionInviteModal'

function parsePromotionFromNotification(n) {
  const communityName = n.community_name || n.metadata?.community_name
  const inviterName = n.inviter_name || n.metadata?.inviter_name

  if (communityName && inviterName) {
    return { communityName, inviterName }
  }

  const match = n.body?.match(/^(.+?)\s+te convidou para ser gerente em\s+(.+?)\.?$/i)
  if (match) {
    return { inviterName: match[1].trim(), communityName: match[2].trim() }
  }

  return {
    communityName: communityName || n.title?.replace(/^Convite para ser gerente em\s+/i, '') || '—',
    inviterName: inviterName || '—',
  }
}

export function NotificationsPage({
  notifications,
  onMarkAll,
  onMarkOne,
  onCommunitiesReload,
  onNotificationsReload,
  initialPromotionToken,
}) {
  const { token } = useAuth()
  const toast     = useToast()
  const [inviteData,  setInviteData]  = useState(null)
  const [inviteToken, setInviteToken] = useState(null)
  const [promotionInvite, setPromotionInvite] = useState(null)
  const [loading,     setLoading]     = useState(false)

  function openPromotionModal(n) {
    const { communityName, inviterName } = parsePromotionFromNotification(n)
    setPromotionInvite({
      notificationId: n.id,
      promoToken: n.reference_id,
      communityName,
      inviterName,
      isRead: n.is_read,
    })
  }

  useEffect(() => {
    if (!initialPromotionToken || notifications.length === 0) return

    const match = notifications.find(
      n => n.type === 'PROMOTION_INVITE' && n.reference_id === initialPromotionToken
    )
    if (match) {
      openPromotionModal(match)
      if (!match.is_read) onMarkOne(match.id)
    } else {
      setPromotionInvite({
        promoToken: initialPromotionToken,
        communityName: '—',
        inviterName: '—',
      })
    }

    window.history.replaceState({}, '', window.location.pathname)
  }, [initialPromotionToken, notifications])

  async function handleNotificationClick(n) {
    if (n.type === 'COMMUNITY_APPROVED' && n.is_read) return
    if (n.type === 'PROMOTION_INVITE' && n.is_read && !n.reference_id) return

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

    if (n.type === 'PROMOTION_INVITE' && n.reference_id) {
      openPromotionModal({ ...n, is_read: true })
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

  async function handleAcceptPromotion() {
    if (!promotionInvite?.promoToken) return
    setLoading(true)
    try {
      await communitiesApi.acceptPromotion(token, promotionInvite.promoToken)
      toast('🎉 Promoção aceita! Você agora é gerente.')
      setPromotionInvite(null)
      onCommunitiesReload?.()
      onNotificationsReload?.()
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeclinePromotion() {
    if (!promotionInvite?.promoToken) return
    setLoading(true)
    try {
      await communitiesApi.declinePromotion(token, promotionInvite.promoToken)
      toast('Convite de promoção recusado.')
      setPromotionInvite(null)
      onNotificationsReload?.()
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  function isClickable(n) {
    if (n.type === 'COMMUNITY_APPROVED') return !n.is_read
    if (n.type === 'PROMOTION_INVITE') return !!n.reference_id
    return false
  }

  function isDimmed(n) {
    if (n.type === 'COMMUNITY_APPROVED' && n.is_read) return true
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
                cursor: isClickable(n) ? 'pointer' : 'default',
                opacity: isDimmed(n) ? 0.6 : 1,
              }}
            >
              <div className={`notif-dot ${n.is_read ? 'read' : ''}`} />
              <div style={{ flex: 1 }}>
                <div className="notif-title">{n.title}</div>
                <div className="notif-body">{n.body}</div>

                {n.type === 'COMMUNITY_APPROVED' && !n.is_read && (
                  <span style={{
                    fontSize: 11, color: 'var(--green)',
                    fontWeight: 600, marginTop: 4, display: 'block'
                  }}>
                    → Clique para confirmar
                  </span>
                )}

                {n.type === 'COMMUNITY_APPROVED' && n.is_read && (
                  <span style={{
                    fontSize: 11, color: 'var(--text-soft)',
                    marginTop: 4, display: 'block'
                  }}>
                    ✓ Já confirmado
                  </span>
                )}

                {n.type === 'PROMOTION_INVITE' && n.reference_id && (
                  <span style={{
                    fontSize: 11, color: 'var(--green)',
                    fontWeight: 600, marginTop: 4, display: 'block'
                  }}>
                    → Clique para responder
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

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

      {promotionInvite && (
        <PromotionInviteModal
          communityName={promotionInvite.communityName}
          inviterName={promotionInvite.inviterName}
          loading={loading}
          onAccept={handleAcceptPromotion}
          onDecline={handleDeclinePromotion}
          onClose={() => setPromotionInvite(null)}
        />
      )}
    </div>
  )
}
