import { useState, useEffect } from 'react'
import { apiFetch } from '../../api/client'

export function AcceptInvitePage({ token: inviteToken }) {
  const [data,    setData]    = useState(null)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    full_name: '', cpf: '', address: '', password: ''
  })

  function set(key, val) { setForm(p => ({ ...p, [key]: val })) }

  useEffect(() => {
    apiFetch(`/invites/validate/${inviteToken}`)
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [inviteToken])

  async function handleAccept(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await apiFetch('/invites/accept', {
        method: 'POST',
        body: { token: inviteToken, ...form }
      })
      const me = await apiFetch('/auth/me', { token: res.access_token })
      localStorage.setItem('token', res.access_token)
      localStorage.setItem('user', JSON.stringify(me))
      window.location.href = '/'
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  async function handleExistingUser() {
    setLoading(true)
    try {
      const res = await apiFetch('/invites/accept', {
        method: 'POST',
        body: { token: inviteToken }
      })
      const me = await apiFetch('/auth/me', { token: res.access_token })
      localStorage.setItem('token', res.access_token)
      localStorage.setItem('user', JSON.stringify(me))
      window.location.href = '/'
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <div className="spinner" />
    </div>
  )

  // Token inválido
  if (error && !data) return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div className="auth-left-logo">🏘️</div>
        <h1>Comunidades</h1>
      </div>
      <div className="auth-right" style={{ alignItems:'center', textAlign:'center' }}>
        <div style={{ fontSize:64 }}>❌</div>
        <h2 style={{ marginTop:16 }}>Convite inválido</h2>
        <p style={{ color:'var(--text-soft)' }}>{error}</p>
      </div>
    </div>
  )

  // Caminho A — usuário já existe, só entra
  if (data?.user_exists) return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div className="auth-left-logo">🏘️</div>
        <h1>Comunidades</h1>
        <p>Você foi convidado para {data.community_name}!</p>
      </div>
      <div className="auth-right" style={{ alignItems:'center', textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🏘️</div>
        <h2>Entrar na comunidade</h2>
        <p style={{ marginBottom:8 }}>
          Entre em <strong>{data.community_name}</strong> com sua conta existente.
        </p>
        <p style={{ color:'var(--text-soft)', fontSize:13, marginBottom:24 }}>
          {data.email}
        </p>
        {error && <div className="auth-error">⚠️ {error}</div>}
        <button
          className="btn btn-primary btn-full"
          onClick={handleExistingUser}
          disabled={loading}
        >
          {loading ? '⌛' : '→ Entrar na Comunidade'}
        </button>
      </div>
    </div>
  )

  // Caminho B — novo usuário, completa cadastro
  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div className="auth-left-logo">🏘️</div>
        <h1>Bem-vindo, Gerente!</h1>
        <p>Complete seu cadastro para acessar {data?.community_name}.</p>
      </div>
      <div className="auth-right">
        <h2>Complete seu cadastro</h2>
        <p>Preencha os dados abaixo para criar sua conta.</p>

        {error && <div className="auth-error">⚠️ {error}</div>}

        <form onSubmit={handleAccept}>
          {/* Email somente leitura */}
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input
              className="form-input"
              value={data?.email || ''}
              disabled
              style={{ background:'var(--bg)', color:'var(--text-soft)' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Nome Completo *</label>
            <input className="form-input" value={form.full_name}
              onChange={e => set('full_name', e.target.value)}
              required placeholder="Seu nome completo" />
          </div>

          <div className="form-group">
            <label className="form-label">CPF *</label>
            <input className="form-input" value={form.cpf}
              onChange={e => set('cpf', e.target.value)}
              required placeholder="000.000.000-00" maxLength={14} />
          </div>

          <div className="form-group">
            <label className="form-label">Endereço *</label>
            <input className="form-input" value={form.address}
              onChange={e => set('address', e.target.value)}
              required placeholder="Rua, número, bairro, cidade" />
          </div>

          <div className="form-group">
            <label className="form-label">Criar Senha *</label>
            <input className="form-input" type="password"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              required placeholder="Mínimo 6 caracteres" minLength={6} />
          </div>

          <button
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? '⌛ Criando conta...' : '✓ Criar Conta e Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}