// src/pages/auth/LoginPage.jsx
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { PasswordInput } from '../../components/ui/PasswordInput'

export function LoginPage({ onGoRequest }) {
  const { login } = useAuth()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await login(email, password)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div className="auth-left-logo">🏘️</div>
        <h1>Comunidades</h1>
        <p>Marketplace de serviços para vizinhos. Conecte-se com sua comunidade.</p>
      </div>
      <div className="auth-right">
        <h2>Bem-vindo de volta!</h2>
        <p>Entre na sua conta para acessar sua comunidade.</p>

        {error && <div className="auth-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input className="form-input" type="email" placeholder="seu@email.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Senha</label>
            <PasswordInput placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-primary btn-full" disabled={loading}>
            {loading ? '⌛ Entrando...' : '→ Entrar'}
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: 14, color: 'var(--text-soft)' }}>
          Quer fundar uma comunidade?{' '}
          <span className="auth-link" onClick={onGoRequest}>Solicite aqui</span>
        </p>
      </div>
    </div>
  )
}
