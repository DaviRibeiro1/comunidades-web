// src/pages/manager/ManageMembersPage.jsx
import { useState, useEffect } from 'react'
import { communitiesApi } from '../../api/services'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { RoleBadge } from '../../components/ui/Badge'
import { Loading } from '../../components/ui/Loading'
import { Confirm } from '../../components/ui/Modal'

export function ManageMembersPage({ community }) {
  const { token } = useAuth()
  const toast = useToast()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState(null)

  useEffect(() => {
    if (!community?.id) return
    communitiesApi.members(token, community.id)
      .then(setMembers)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [community?.id, token])

  async function remove(userId, name) {
    try {
      await communitiesApi.removeMember(token, community.id, userId)
      setMembers(p => p.filter(m => m.user_id !== userId))
      toast(`${name} removido da comunidade`)
    } catch (err) {
      toast(err.message, 'error')
    }
    setConfirm(null)
  }

  async function changeRole(userId, newRole) {
    try {
      await communitiesApi.changeRole(token, community.id, userId, newRole)
      setMembers(p => p.map(m => m.user_id === userId ? { ...m, role: newRole } : m))
      toast('Papel atualizado!')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>👥 Gerenciar Membros</h1>
          <p>{members.length} membro(s) em {community?.name}</p>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="card">
          <div className="card-body">
            {members.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">👤</div>
                <h3>Sem membros ainda</h3>
                <p>Convide pessoas para sua comunidade.</p>
              </div>
            ) : (
              members.map(m => (
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
                    {m.role === 'MEMBER' && (
                      <button className="btn btn-outline btn-sm"
                        onClick={() => changeRole(m.user_id, 'MANAGER')}>
                        ↑ Promover
                      </button>
                    )}
                    {m.role === 'MANAGER' && (
                      <button className="btn btn-outline btn-sm"
                        onClick={() => changeRole(m.user_id, 'MEMBER')}>
                        ↓ Rebaixar
                      </button>
                    )}
                    <button className="btn btn-danger btn-sm"
                      onClick={() => setConfirm({ userId: m.user_id, name: m.user?.full_name })}>
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {confirm && (
        <Confirm
          title="Remover membro?"
          danger
          text={`${confirm.name} será removido da comunidade.`}
          onConfirm={() => remove(confirm.userId, confirm.name)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
