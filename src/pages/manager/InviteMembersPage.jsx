// src/pages/manager/InviteMembersPage.jsx
import { useState } from 'react'
import { invitesApi } from '../../api/services'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'

export function InviteMembersPage({ community }) {
  const { token } = useAuth()
  const toast = useToast()
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState([])

  async function handleInvite(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await invitesApi.send(token, { email, community_id: community?.id })
      setSent(p => [...p, email])
      setEmail('')
      toast(`Convite enviado para ${email}!`)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>✉️ Convidar Membros</h1>
          <p>Envie convites para {community?.name}</p>
        </div>
      </div>

      <div style={{ maxWidth: 520 }}>
        <div className="invite-form">
          <h3>📨 Novo convite</h3>
          <form onSubmit={handleInvite} style={{ display: 'flex', gap: 10 }}>
            <input
              className="form-input"
              type="email"
              placeholder="email@exemplo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" disabled={loading}>
              {loading ? '⌛' : '→ Enviar'}
            </button>
          </form>
          <p style={{ fontSize: 12, color: 'var(--green)', marginTop: 8 }}>
            O convidado receberá um e-mail com link de acesso. Expira em 24h.
          </p>
        </div>

        {sent.length > 0 && (
          <div className="card">
            <div className="card-body">
              <h3 style={{ fontSize: 15, marginBottom: 14 }}>Enviados nesta sessão</h3>
              {sent.map((e, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--green)' }}>✓</span>
                  <span style={{ fontSize: 14 }}>{e}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
