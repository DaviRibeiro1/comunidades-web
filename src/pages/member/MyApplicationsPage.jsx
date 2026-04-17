// src/pages/member/MyApplicationsPage.jsx
import { useState, useEffect } from 'react'
import { applicationsApi } from '../../api/services'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { Loading } from '../../components/ui/Loading'
import { Confirm } from '../../components/ui/Modal'

const APP_STATUS = {
  PENDING:  { label: '⏳ Pendente',  cls: 'app-PENDING'  },
  ACCEPTED: { label: '✅ Aceita',    cls: 'app-ACCEPTED' },
  REJECTED: { label: '❌ Recusada',  cls: 'app-REJECTED' },
}

export function MyApplicationsPage() {
  const { token } = useAuth()
  const toast = useToast()
  const [applications, setApplications] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [confirm,      setConfirm]      = useState(null)

  useEffect(() => {
    applicationsApi.myApplications(token)
      .then(setApplications)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  async function cancel(id) {
    try {
      await applicationsApi.cancel(token, id)
      setApplications(p => p.filter(a => a.id !== id))
      toast('Candidatura cancelada')
    } catch (err) {
      toast(err.message, 'error')
    }
    setConfirm(null)
  }

  const stats = {
    pending:  applications.filter(a => a.status === 'PENDING').length,
    accepted: applications.filter(a => a.status === 'ACCEPTED').length,
    rejected: applications.filter(a => a.status === 'REJECTED').length,
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>✅ Minhas Candidaturas</h1>
          <p>{applications.length} candidatura(s)</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="stat-card">
          <div className="stat-card-label">Pendentes</div>
          <div className="stat-card-value stat-amber">{stats.pending}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Aceitas</div>
          <div className="stat-card-value stat-green">{stats.accepted}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Recusadas</div>
          <div className="stat-card-value stat-red">{stats.rejected}</div>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : applications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>Nenhuma candidatura</h3>
          <p>Candidate-se a serviços na tela inicial.</p>
        </div>
      ) : (
        applications.map(a => {
          const s = APP_STATUS[a.status] || APP_STATUS.PENDING
          return (
            <div key={a.id} className="application-card">
              <div style={{ fontSize: 28 }}>{a.service?.icon || '🔧'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <strong style={{ fontSize: 15 }}>{a.service?.title}</strong>
                  <span className={`application-status ${s.cls}`}>{s.label}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 6 }}>
                  Solicitante: {a.service?.requester?.full_name}
                </div>
                {a.message && (
                  <div style={{ fontSize: 13, color: 'var(--text-mid)', fontStyle: 'italic' }}>
                    "{a.message}"
                  </div>
                )}
                {a.status === 'PENDING' && (
                  <button className="btn btn-danger btn-sm" style={{ marginTop: 10 }}
                    onClick={() => setConfirm({ id: a.id, title: a.service?.title })}>
                    ✕ Cancelar candidatura
                  </button>
                )}
              </div>
            </div>
          )
        })
      )}

      {confirm && (
        <Confirm
          title="Cancelar candidatura?"
          danger
          text={`Deseja cancelar sua candidatura para "${confirm.title}"?`}
          onConfirm={() => cancel(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
