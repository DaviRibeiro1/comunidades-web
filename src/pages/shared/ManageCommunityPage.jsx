// src/pages/shared/ManageCommunityPage.jsx
import { useState, useEffect } from 'react'
import { communitiesApi, servicesApi, invitesApi } from '../../api/services'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { RoleBadge, StatusBadge } from '../../components/ui/Badge'
import { Loading } from '../../components/ui/Loading'
import { Modal, Confirm } from '../../components/ui/Modal'

export function ManageCommunityPage({ community, currentRole, onDeleted }) {
  const { token }   = useAuth()
  const toast       = useToast()
  const [tab,       setTab]       = useState('members')
  const [members,   setMembers]   = useState([])
  const [services,  setServices]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')

  // modais
  const [showEdit,   setShowEdit]   = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [editForm, setEditForm]     = useState({ name: '', description: '' })
  const [confirm,  setConfirm]      = useState(null)

  // invite
  const [inviteEmail, setInviteEmail] = useState('')
  const [sentEmails,  setSentEmails]  = useState([])
  const [pendingPromotions, setPendingPromotions] = useState(new Set())
  const [promoting, setPromoting] = useState(null)

  const canEditDelete = currentRole === 'FOUNDER' || currentRole === 'OWNER'

  useEffect(() => {
    if (!community?.id) return
    setLoading(true)
    Promise.all([
      communitiesApi.members(token, community.id),
      servicesApi.byCommunity(token, community.id),
    ])
      .then(([m, s]) => {
        setMembers(m)
        setServices(s)
        setPendingPromotions(new Set(
          m.filter(member => member.promotion_pending).map(member => member.user_id)
        ))
      })
      .catch(() => {})
      .finally(() => setLoading(false))

    setEditForm({ name: community.name, description: community.description || '' })
  }, [community?.id, token])

  // filtros por aba
  const filteredMembers  = members.filter(m =>
    !search ||
    m.user?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.user?.email?.toLowerCase().includes(search.toLowerCase())
  )
  const filteredServices = services.filter(s =>
    !search ||
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  )

  async function handleEdit(e) {
    e.preventDefault()
    try {
      await communitiesApi.update(token, community.id, editForm)
      toast('Comunidade atualizada!')
      setShowEdit(false)
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  async function handleDelete() {
    try {
      await communitiesApi.delete(token, community.id)
      toast('Comunidade excluída')
      setShowDelete(false)
      onDeleted()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  async function handleRemoveMember(userId, name) {
    try {
      await communitiesApi.removeMember(token, community.id, userId)
      setMembers(p => p.filter(m => m.user_id !== userId))
      toast(`${name} removido`)
    } catch (err) {
      toast(err.message, 'error')
    }
    setConfirm(null)
  }

  async function handleChangeRole(userId, newRole) {
    try {
      await communitiesApi.changeRole(token, community.id, userId, newRole)
      setMembers(p => p.map(m => m.user_id === userId ? { ...m, role: newRole } : m))
      toast('Papel atualizado!')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  async function handlePromoteMember(userId) {
    setPromoting(userId)
    try {
      await communitiesApi.promoteMember(token, community.id, userId)
      setPendingPromotions(p => new Set([...p, userId]))
      toast('Convite de promoção enviado!')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setPromoting(null)
    }
  }

  function isPromotionPending(userId, member) {
    return pendingPromotions.has(userId) || member?.promotion_pending
  }

  async function handleDeleteService(serviceId, title) {
    try {
      await servicesApi.delete(token, serviceId)
      setServices(p => p.filter(s => s.id !== serviceId))
      toast(`"${title}" removido`)
    } catch (err) {
      toast(err.message, 'error')
    }
    setConfirm(null)
  }

  async function handleSendInvite(e) {
    e.preventDefault()
    try {
      await invitesApi.send(token, { email: inviteEmail, community_id: community.id })
      setSentEmails(p => [...p, inviteEmail])
      setInviteEmail('')
      toast(`Convite enviado para ${inviteEmail}!`)
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const TABS = [
    { id: 'members',  label: `👥 Membros (${members.length})` },
    { id: 'services', label: `🔧 Anúncios (${services.length})` },
    { id: 'invite',   label: '✉️ Convidar' },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>⚙️ Gerenciar Comunidade</h1>
          <p>Gerencie membros, anúncios e configurações</p>
        </div>
      </div>

      {/* Card info da comunidade */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: 20, marginBottom: 4 }}>🏘️ {community?.name}</h2>
              {community?.description && (
                <p style={{ color: 'var(--text-soft)', fontSize: 14, marginBottom: 12 }}>
                  {community.description}
                </p>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ background: 'var(--green-pale)', color: 'var(--green)', padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>
                  👥 {members.length} membros
                </span>
                <span style={{ background: '#EFF6FF', color: 'var(--blue)', padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>
                  🔧 {services.length} anúncios
                </span>
              </div>
            </div>

            {/* Botões editar/excluir */}
            {canEditDelete && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-outline btn-sm" onClick={() => setShowEdit(true)}>
                  ✏️ Editar
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => setShowDelete(true)}>
                  🗑️ Excluir
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Abas */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '2px solid var(--border)', paddingBottom: 0 }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setSearch('') }}
            style={{
              padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? 'var(--green)' : 'var(--text-soft)',
              borderBottom: tab === t.id ? '2px solid var(--green)' : '2px solid transparent',
              marginBottom: -2, fontFamily: "'DM Sans', sans-serif",
              transition: 'all .15s'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Busca (nas abas membros e anúncios) */}
      {tab !== 'invite' && (
        <div style={{ marginBottom: 16 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '8px 14px', maxWidth: 400
          }}>
            <span>🔍</span>
            <input
              style={{ border: 'none', background: 'transparent', fontSize: 14, outline: 'none', width: '100%', fontFamily: "'DM Sans', sans-serif" }}
              placeholder={tab === 'members' ? 'Buscar membros...' : 'Buscar anúncios...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <span style={{ cursor: 'pointer', color: 'var(--text-soft)', fontSize: 18 }}
                onClick={() => setSearch('')}>×</span>
            )}
          </div>
        </div>
      )}

      {loading ? <Loading /> : (
        <>
          {/* ── Aba Membros ── */}
          {tab === 'members' && (
            filteredMembers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <h3>{search ? 'Nenhum membro encontrado' : 'Sem membros ainda'}</h3>
              </div>
            ) : (
              <div className="card">
                <div className="card-body">
                  {filteredMembers.map(m => (
                    <div key={m.user_id} className="member-row">
                      <div className="member-avatar">
                        {m.user?.full_name?.[0]?.toUpperCase()}
                      </div>
                      <div className="member-info">
                        <div className="member-name">{m.user?.full_name}</div>
                        <div className="member-email">{m.user?.email}</div>
                      </div>
                      <RoleBadge role={m.role} />
                      <div style={{ display: 'flex', gap: 6, marginLeft: 8 }}>
                        {/* Trocar papel — só FOUNDER */}
                        {currentRole === 'FOUNDER' && m.role === 'MEMBER' && (
                          isPromotionPending(m.user_id, m) ? (
                            <button className="btn btn-outline btn-sm" disabled>
                              ⏳ Convite pendente
                            </button>
                          ) : (
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => handlePromoteMember(m.user_id)}
                              disabled={promoting === m.user_id}
                            >
                              {promoting === m.user_id ? '⌛' : '↑ Promover'}
                            </button>
                          )
                        )}
                        {currentRole === 'FOUNDER' && m.role === 'MANAGER' && (
                          <button className="btn btn-outline btn-sm"
                            onClick={() => handleChangeRole(m.user_id, 'MEMBER')}>
                            ↓ Membro
                          </button>
                        )}
                        {/* Remover */}
                        {(
                          (currentRole === 'FOUNDER' && m.role !== 'FOUNDER' && m.role !== 'OWNER') ||
                          (currentRole === 'MANAGER' && m.role === 'MEMBER')
                        ) && (
                          <button className="btn btn-danger btn-sm"
                            onClick={() => setConfirm({
                              type: 'member', userId: m.user_id, name: m.user?.full_name
                            })}>
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

          {/* ── Aba Anúncios ── */}
          {tab === 'services' && (
            filteredServices.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔧</div>
                <h3>{search ? 'Nenhum anúncio encontrado' : 'Sem anúncios ainda'}</h3>
              </div>
            ) : (
              <div className="card">
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Anúncio</th>
                        <th>Solicitante</th>
                        <th>Status</th>
                        <th>Preço</th>
                        <th>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredServices.map(s => (
                        <tr key={s.id}>
                          <td>
                            <strong>{s.icon} {s.title}</strong>
                            <br />
                            <span style={{ fontSize: 12, color: 'var(--text-soft)' }}>
                              {s.description?.slice(0, 50)}...
                            </span>
                          </td>
                          <td>{s.requester?.full_name}</td>
                          <td><StatusBadge status={s.status} /></td>
                          <td style={{ color: 'var(--green)', fontWeight: 600 }}>{s.price}</td>
                          <td>
                            <button className="btn btn-danger btn-sm"
                              onClick={() => setConfirm({
                                type: 'service', serviceId: s.id, title: s.title
                              })}>
                              🗑️ Remover
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}

          {/* ── Aba Convidar ── */}
          {tab === 'invite' && (
            <div style={{ maxWidth: 520 }}>
              <div className="invite-form">
                <h3>📨 Enviar convite</h3>
                <form onSubmit={handleSendInvite} style={{ display: 'flex', gap: 10 }}>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    required
                    style={{ flex: 1 }}
                  />
                  <button className="btn btn-primary" type="submit">→ Enviar</button>
                </form>
                <p style={{ fontSize: 12, color: 'var(--green)', marginTop: 8 }}>
                  O convidado receberá um e-mail com link de acesso. Expira em 24h.
                </p>
              </div>

              {sentEmails.length > 0 && (
                <div className="card">
                  <div className="card-body">
                    <h3 style={{ fontSize: 14, marginBottom: 12 }}>Enviados nesta sessão</h3>
                    {sentEmails.map((e, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ color: 'var(--green)' }}>✓</span>
                        <span style={{ fontSize: 14 }}>{e}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Modal Editar ── */}
      {showEdit && (
        <Modal
          title="Editar Comunidade"
          icon="✏️"
          onClose={() => setShowEdit(false)}
          footer={
            <>
              <button className="btn btn-outline btn-sm" onClick={() => setShowEdit(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleEdit}>
                ✓ Salvar
              </button>
            </>
          }
        >
          <div className="form-group">
            <label className="form-label">Nome *</label>
            <input
              className="form-input"
              value={editForm.name}
              onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Descrição</label>
            <textarea
              className="form-textarea"
              value={editForm.description}
              onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
            />
          </div>
        </Modal>
      )}

      {/* ── Modal Excluir ── */}
      {showDelete && (
        <Modal
          title="Excluir comunidade?"
          icon="⚠️"
          onClose={() => { setShowDelete(false); setDeleteConfirm('') }}
          footer={
            <>
              <button className="btn btn-outline btn-sm"
                onClick={() => { setShowDelete(false); setDeleteConfirm('') }}>
                Cancelar
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={handleDelete}
                disabled={deleteConfirm !== community?.name}
              >
                🗑️ Excluir
              </button>
            </>
          }
        >
          <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 8, padding: 12, marginBottom: 16 }}>
            <p style={{ color: 'var(--red)', fontSize: 13, fontWeight: 600 }}>
              ⚠️ Esta ação é IRREVERSÍVEL. Todos os membros, anúncios e candidaturas serão removidos permanentemente.
            </p>
          </div>
          <div className="form-group">
            <label className="form-label">
              Digite <strong>{community?.name}</strong> para confirmar:
            </label>
            <input
              className="form-input"
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder={community?.name}
              style={{ borderColor: deleteConfirm === community?.name ? 'var(--green)' : undefined }}
            />
          </div>
        </Modal>
      )}

      {/* ── Confirm genérico ── */}
      {confirm?.type === 'member' && (
        <Confirm
          title="Remover membro?"
          text={`${confirm.name} será removido da comunidade.`}
          danger
          onConfirm={() => handleRemoveMember(confirm.userId, confirm.name)}
          onCancel={() => setConfirm(null)}
        />
      )}
      {confirm?.type === 'service' && (
        <Confirm
          title="Remover anúncio?"
          text={`"${confirm.title}" será removido permanentemente.`}
          danger
          onConfirm={() => handleDeleteService(confirm.serviceId, confirm.title)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}