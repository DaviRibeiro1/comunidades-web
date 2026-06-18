// src/pages/shared/NotificationsPage.jsx
import { useState, useEffect } from 'react'
import { apiFetch } from '../../api/client'
import { communitiesApi } from '../../api/services'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { PromotionInviteModal } from '../../components/modals/PromotionInviteModal'

function getRespondedPromotionTokens() {
  try {
    return new Set(JSON.parse(localStorage.getItem('responded_promotion_tokens') || '[]'))
  } catch {
    return new Set()
  }
}

function markPromotionResponded(promoToken) {
  if (!promoToken) return
  const tokens = getRespondedPromotionTokens()
  tokens.add(promoToken)
  localStorage.setItem('responded_promotion_tokens', JSON.stringify([...tokens]))
}

function isPromotionResponded(n) {
  if (!n?.reference_id) return true
  if (getRespondedPromotionTokens().has(n.reference_id)) return true
  const status = String(n.status || n.metadata?.status || '').toUpperCase()
  return ['ACCEPTED', 'DECLINED', 'RESOLVED', 'COMPLETED'].includes(status)
}

function resolvePromotionCommunity(n, communities = []) {
  const communityId =
    n.community_id ||
    n.metadata?.community_id ||
    n.community?.id

  const fromList = communityId
    ? communities.find(c => String(c.id) === String(communityId))
    : null

  if (fromList) return fromList

  const bodyMatch = n.body?.match(
    /(?:gerente(?:\s+da comunidade|\s+em)|ser gerente em)\s+(.+?)\.?$/i
  )
  const nameFromBody = bodyMatch?.[1]?.trim()
  if (nameFromBody) {
    const byName = communities.find(
      c => c.name?.toLowerCase() === nameFromBody.toLowerCase()
    )
    if (byName) return byName
  }

  const parsed = parsePromotionFromNotification(n)
  if (parsed.community?.name) {
    const byParsedName = communities.find(
      c => c.name?.toLowerCase() === parsed.community.name.toLowerCase()
    )
    if (byParsedName) return byParsedName
  }

  return parsed.community
}

function parsePromotionFromNotification(n) {
  const community =
    n.community ||
    n.metadata?.community ||
    (n.community_name || n.metadata?.community_name
      ? { name: n.community_name || n.metadata?.community_name }
      : null)

  const communityName =
    community?.name ||
    n.community_name ||
    n.metadata?.community_name

  const titleMatch = n.title?.match(/(?:gerente|promoção)\s+(?:em|da)\s+(.+?)$/i)

  const bodyPatterns = [
    /^(.+?)\s+te convidou para ser gerente em\s+(.+?)\.?$/i,
    /convidado\s+por\s+(.+?)\s+para ser gerente(?:\s+da comunidade|\s+em)\s+(.+?)\.?$/i,
    /convite de\s+(.+?)\s+para ser gerente em\s+(.+?)\.?$/i,
  ]

  for (const pattern of bodyPatterns) {
    const match = n.body?.match(pattern)
    if (match) {
      const parsedCommunityName = communityName || match[2]?.trim() || titleMatch?.[1]?.trim()
      return {
        community: community || (parsedCommunityName ? { name: parsedCommunityName } : null),
      }
    }
  }

  const resolvedName = communityName || titleMatch?.[1]?.trim()

  return {
    community: community || (resolvedName ? { name: resolvedName } : null),
  }
}

export function NotificationsPage({
  notifications,
  communities = [],
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
  const [respondedTokens, setRespondedTokens] = useState(() => getRespondedPromotionTokens())

  function openPromotionModal(n) {
    if (isPromotionResponded(n)) return

    const community = resolvePromotionCommunity(n, communities)
    setPromotionInvite({
      notificationId: n.id,
      promoToken: n.reference_id,
      community,
      isRead: n.is_read,
    })
  }

  useEffect(() => {
    if (!initialPromotionToken || notifications.length === 0) return

    const match = notifications.find(
      n => n.type === 'PROMOTION_INVITE' && n.reference_id === initialPromotionToken
    )

    if (match && !isPromotionResponded(match)) {
      openPromotionModal(match)
      if (!match.is_read) onMarkOne(match.id)
    }

    window.history.replaceState({}, '', window.location.pathname)
  }, [initialPromotionToken, notifications])

  async function handleNotificationClick(n) {
    if (n.type === 'COMMUNITY_APPROVED' && n.is_read) return
    if (n.type === 'PROMOTION_INVITE' && isPromotionResponded(n)) return

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

    if (n.type === 'PROMOTION_INVITE' && n.reference_id && !isPromotionResponded(n)) {
      openPromotionModal(n)
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
      markPromotionResponded(promotionInvite.promoToken)
      setRespondedTokens(getRespondedPromotionTokens())
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
      markPromotionResponded(promotionInvite.promoToken)
      setRespondedTokens(getRespondedPromotionTokens())
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
    if (n.type === 'PROMOTION_INVITE') {
      return !!n.reference_id && !isPromotionResponded(n)
    }
    return false
  }

  function isDimmed(n) {
    if (n.type === 'COMMUNITY_APPROVED' && n.is_read) return true
    if (n.type === 'PROMOTION_INVITE' && isPromotionResponded(n)) return true
    return false
  }

  function promotionRespondedLabel(n) {
    const status = String(n.status || n.metadata?.status || '').toUpperCase()
    if (status === 'ACCEPTED') return '✓ Promoção aceita'
    if (status === 'DECLINED') return '✓ Convite recusado'
    return '✓ Já respondido'
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

                {n.type === 'PROMOTION_INVITE' && n.reference_id && !isPromotionResponded(n) && (
                  <span style={{
                    fontSize: 11, color: 'var(--green)',
                    fontWeight: 600, marginTop: 4, display: 'block'
                  }}>
                    → Clique para responder
                  </span>
                )}

                {n.type === 'PROMOTION_INVITE' && isPromotionResponded(n) && (
                  <span style={{
                    fontSize: 11, color: 'var(--text-soft)',
                    marginTop: 4, display: 'block'
                  }}>
                    {promotionRespondedLabel(n)}
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
          community={promotionInvite.community}
          loading={loading}
          onAccept={handleAcceptPromotion}
          onDecline={handleDeclinePromotion}
          onClose={() => setPromotionInvite(null)}
        />
      )}
    </div>
  )
}
