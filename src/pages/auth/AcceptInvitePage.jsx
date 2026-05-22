// src/pages/auth/AcceptInvitePage.jsx
import { useState, useEffect } from 'react'
import { apiFetch } from '../../api/client'
import { PasswordInput } from '../../components/ui/PasswordInput'

function formatCpf(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function isValidCpf(value) {
  const digits = value.replace(/\D/g, '')
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false
  const calc = (end) => {
    let sum = 0
    for (let i = 0; i < end; i++) sum += parseInt(digits[i]) * (end + 1 - i)
    const rem = (sum * 10) % 11
    return rem === 10 || rem === 11 ? 0 : rem
  }
  return calc(9) === parseInt(digits[9]) && calc(10) === parseInt(digits[10])
}

const DISABLED_STYLE = { background: 'var(--bg)', color: 'var(--text-soft)' }

export function AcceptInvitePage({ token: inviteToken }) {
  const [data,     setData]     = useState(null)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(true)
  const [cpfError, setCpfError] = useState('')
  const [form, setForm] = useState({
    full_name: '', cpf: '', address: '', password: ''
  })

  function set(key, val) { setForm(p => ({ ...p, [key]: val })) }

  // ── flags de bloqueio baseadas nos dados que vieram da API ────────
  const hasName    = !!data?.prefill_name
  const hasCpf     = !!data?.prefill_cpf
  const hasAddress = !!data?.prefill_address

  useEffect(() => {
    apiFetch(`/invites/validate/${inviteToken}`)
      .then(res => {
        setData(res)
        const cpfFormatado = formatCpf(res.prefill_cpf || '')

        // valida CPF apenas se veio pré-preenchido
        if (res.prefill_cpf && !isValidCpf(res.prefill_cpf)) {
          setCpfError('CPF inválido. Entre em contato com o administrador.')
        }

        setForm(p => ({
          ...p,
          full_name: res.prefill_name    || '',
          cpf:       cpfFormatado,
          address:   res.prefill_address || '',
        }))
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [inviteToken])

  function handleCpfChange(e) {
    const formatted = formatCpf(e.target.value)
    set('cpf', formatted)
    if (formatted.replace(/\D/g, '').length === 11) {
      setCpfError(isValidCpf(formatted) ? '' : 'CPF inválido')
    } else {
      setCpfError('')
    }
  }

  const isFormValid =
    form.full_name.trim().length > 0 &&
    form.password.length >= 6 &&
    !cpfError

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.cpf && !isValidCpf(form.cpf)) {
      setCpfError('CPF inválido')
      return
    }
    setLoading(true)
    try {
      const res = await apiFetch('/invites/accept', {
        method: 'POST',
        body: { 
          token: inviteToken,
          ...form,
          cpf: form.cpf ? form.cpf.replace(/\D/g, '') : null
        }
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

  // ── Loading ───────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <div className="spinner" />
    </div>
  )

  // ── Token inválido ────────────────────────────────────────────────
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

  // ── Caminho A — usuário já existe ─────────────────────────────────
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

  // ── Caminho B — novo usuário ──────────────────────────────────────
  // campos habilitados/desabilitados conforme dados que vieram da API
  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div className="auth-left-logo">🏘️</div>
        <h1>{hasName ? 'Bem-vindo, Fundador!' : 'Bem-vindo!'}</h1>
        <p>
          {hasName
            ? `Sua comunidade ${data?.community_name} foi aprovada!`
            : `Você foi convidado para ${data?.community_name}.`}
        </p>
      </div>
      <div className="auth-right">
        <h2>{hasName ? '🎉 Complete seu cadastro' : 'Criar sua conta'}</h2>
        <p>
          {hasName
            ? 'Seus dados foram preenchidos automaticamente. Crie apenas sua senha.'
            : 'Preencha seus dados para entrar na comunidade.'}
        </p>

        {error && <div className="auth-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>

          {/* E-mail — sempre somente leitura */}
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input
              className="form-input"
              value={data?.email || ''}
              disabled
              style={DISABLED_STYLE}
            />
          </div>

          {/* Nome — desabilitado se veio da API */}
          <div className="form-group">
            <label className="form-label">Nome Completo *</label>
            <input
              className="form-input"
              value={form.full_name}
              onChange={e => set('full_name', e.target.value)}
              disabled={hasName}
              style={hasName ? DISABLED_STYLE : {}}
              required
              placeholder="Seu nome completo"
            />
          </div>

          {/* CPF — desabilitado se veio da API, oculto se não veio */}
          {(hasCpf || !hasName) && (
            <div className="form-group">
              <label className="form-label">CPF</label>
              <input
                className="form-input"
                value={form.cpf}
                onChange={handleCpfChange}
                disabled={hasCpf}
                style={{
                  ...(hasCpf ? DISABLED_STYLE : {}),
                  ...(cpfError ? { borderColor: 'var(--red)' } : {})
                }}
                placeholder="000.000.000-00"
                maxLength={14}
              />
              {cpfError && (
                <span style={{ color:'var(--red)', fontSize:12, marginTop:4, display:'block' }}>
                  ⚠️ {cpfError}
                </span>
              )}
            </div>
          )}

          {/* Endereço — desabilitado se veio da API, oculto se não veio */}
          {(hasAddress || !hasName) && (
            <div className="form-group">
              <label className="form-label">Endereço {!hasAddress && '(opcional)'}</label>
              <input
                className="form-input"
                value={form.address}
                onChange={e => set('address', e.target.value)}
                disabled={hasAddress}
                style={hasAddress ? DISABLED_STYLE : {}}
                placeholder="Rua, número, bairro, cidade"
              />
            </div>
          )}

          {/* Senha — sempre editável */}
          <div className="form-group">
            <label className="form-label">Criar Senha *</label>
            <PasswordInput
              value={form.password}
              onChange={e => set('password', e.target.value)}
              required
              placeholder="Mínimo 6 caracteres"
              minLength={6}
            />
          </div>

          <button
            className="btn btn-primary btn-full"
            disabled={loading || !isFormValid}
          >
            {loading ? '⌛ Criando conta...' : '✓ Criar Conta e Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}