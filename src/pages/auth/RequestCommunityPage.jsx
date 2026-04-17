// src/pages/auth/RequestCommunityPage.jsx
import { useState } from 'react'
import { requestsApi } from '../../api/services'
import { useToast } from '../../contexts/ToastContext'

export function RequestCommunityPage({ onBack }) {
  const toast = useToast()
  const [loading,   setLoading]   = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    requester_name: '', requester_email: '',
    community_name: '', community_description: '',
  })

  function set(key, val) { setForm(p => ({ ...p, [key]: val })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await requestsApi.create(form)
      setSubmitted(true)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div className="auth-left-logo">🏘️</div>
        <h1>Comunidades</h1>
        <p>Seu pedido foi enviado com sucesso!</p>
      </div>
      <div className="auth-right" style={{ alignItems: 'center', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h2>Pedido enviado!</h2>
        <p>O administrador irá revisar e você será notificado por e-mail.</p>
        <button className="btn btn-outline" style={{ marginTop: 24 }} onClick={onBack}>
          ← Voltar ao login
        </button>
      </div>
    </div>
  )

  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div className="auth-left-logo">🏘️</div>
        <h1>Fundar uma Comunidade</h1>
        <p>Preencha o formulário e aguarde a aprovação do administrador.</p>
      </div>
      <div className="auth-right">
        <h2>Solicitar Comunidade</h2>
        <p>Preencha seus dados e as informações da comunidade.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Seu nome completo</label>
            <input className="form-input" value={form.requester_name}
              onChange={e => set('requester_name', e.target.value)} required
              placeholder="Nome Sobrenome" />
          </div>
          <div className="form-group">
            <label className="form-label">Seu e-mail</label>
            <input className="form-input" type="email" value={form.requester_email}
              onChange={e => set('requester_email', e.target.value)} required
              placeholder="seu@email.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Nome da comunidade</label>
            <input className="form-input" value={form.community_name}
              onChange={e => set('community_name', e.target.value)} required
              placeholder="Ex: Jardim Primavera" />
          </div>
          <div className="form-group">
            <label className="form-label">Descrição (opcional)</label>
            <textarea className="form-textarea" value={form.community_description}
              onChange={e => set('community_description', e.target.value)}
              placeholder="Conte sobre sua comunidade..." />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-outline" onClick={onBack}>← Voltar</button>
            <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>
              {loading ? '⌛ Enviando...' : '✓ Enviar Pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
