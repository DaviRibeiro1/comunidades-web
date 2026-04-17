// src/components/modals/NewServiceModal.jsx
import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { servicesApi } from '../../api/services'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'

const ICONS = ['🔧','🎨','🔌','🚿','🪣','📦','🎸','📚','🌿','🐾','🍕','🚗','🏗️','🧹','🌱']
const STATUSES = [
  { value: 'OPEN',       label: 'Aberto' },
  { value: 'URGENT',     label: 'Urgente' },
  { value: 'VOLUNTEER',  label: 'Voluntários' },
  { value: 'NEEDS_HELP', label: 'Precisa de ajuda' },
]

export function NewServiceModal({ communityId, onClose, onCreated }) {
  const { token } = useAuth()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    icon: '🔧', title: '', description: '', price: 'A negociar', status: 'OPEN',
  })

  function set(key, val) { setForm(p => ({ ...p, [key]: val })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const s = await servicesApi.create(token, { ...form, community_id: communityId })
      onCreated(s)
      toast('Anúncio publicado!')
      onClose()
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="Novo Anúncio"
      subtitle="Publique um anúncio para sua comunidade"
      icon="➕"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-outline btn-sm" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={loading}>
            {loading ? '⌛' : '✓'} Publicar
          </button>
        </>
      }
    >
      <div style={{ marginBottom: 12 }}>
        <label className="form-label">Ícone</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {ICONS.map(ic => (
            <button
              key={ic} type="button"
              style={{
                fontSize: 22,
                background: form.icon === ic ? 'var(--green-pale)' : 'var(--bg)',
                border: `2px solid ${form.icon === ic ? 'var(--green)' : 'var(--border)'}`,
                borderRadius: 8, padding: '4px 8px', cursor: 'pointer',
              }}
              onClick={() => set('icon', ic)}
            >{ic}</button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Título *</label>
        <input className="form-input" value={form.title}
          onChange={e => set('title', e.target.value)} required
          placeholder="Ex: Preciso de pintor" />
      </div>

      <div className="form-group">
        <label className="form-label">Descrição *</label>
        <textarea className="form-textarea" value={form.description}
          onChange={e => set('description', e.target.value)} required
          placeholder="Descreva o anúncio detalhadamente..." />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="form-group">
          <label className="form-label">Preço</label>
          <input className="form-input" value={form.price}
            onChange={e => set('price', e.target.value)} placeholder="A negociar" />
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-select" value={form.status}
            onChange={e => set('status', e.target.value)}>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>
    </Modal>
  )
}
