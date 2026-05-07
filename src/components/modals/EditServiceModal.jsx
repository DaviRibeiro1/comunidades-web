// src/components/modals/EditServiceModal.jsx
import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { servicesApi } from '../../api/services'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dm2vqfwnd'
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'comunidades_preset'

const CATEGORIES = [
  { value: 'SERVICE', label: 'Serviço (Pintor, Diarista...)' },
  { value: 'PRODUCT', label: 'Produto (Venda, Doação...)' }
]

export function EditServiceModal({ service, onClose, onUpdated }) {
  const { token } = useAuth()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  
  // Carrega a URL da imagem existente (verificando os possíveis nomes do campo no backend)
  const existingImageUrl = service?.photo_url || service?.image_url || null
  const [previewUrl, setPreviewUrl] = useState(existingImageUrl)
  
  const [form, setForm] = useState({
    image: null, // Fica null a menos que o usuário escolha um arquivo novo
    title: service?.title || '', 
    description: service?.description || '', 
    price: service?.price || '',
    category: service?.category || 'SERVICE' // Carrega a categoria existente ou o padrão
  })

  function set(key, val) { setForm(p => ({ ...p, [key]: val })) }

  function handleImageChange(e) {
    const file = e.target.files[0]
    if (file) {
      set('image', file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  async function uploadImageToCloudinary(file) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Falha ao fazer upload da nova imagem no Cloudinary')
    }

    const data = await response.json()
    return data.secure_url 
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      // Inicia com a URL da foto existente
      let finalPhotoUrl = existingImageUrl

      // Se o usuário selecionou uma nova foto, faz o upload e substitui a URL
      if (form.image) {
        finalPhotoUrl = await uploadImageToCloudinary(form.image)
      }

      // Monta o payload em JSON
      const payload = {
        title: form.title,
        description: form.description,
        price: form.price,
        category: form.category,
        photo_url: finalPhotoUrl // Envia a URL nova ou a que já existia
      }

      const updatedService = await servicesApi.update(token, service.id, payload)
      
      onUpdated(updatedService)
      toast('Anúncio atualizado com sucesso!')
      onClose()
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="Editar Anúncio"
      subtitle="Atualize as informações do seu anúncio"
      icon="✏️"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-outline btn-sm" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={loading}>
            {loading ? '⌛' : '✓'} Salvar Alterações
          </button>
        </>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <label className="form-label">Imagem Principal</label>
        <label style={{
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: 140, 
          border: '2px dashed var(--border)', 
          borderRadius: 8, 
          cursor: 'pointer',
          background: previewUrl ? 'transparent' : 'var(--bg)',
          color: 'var(--text-muted)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <input 
            type="file" 
            accept="image/*" 
            style={{ display: 'none' }} 
            onChange={handleImageChange} 
          />
          {previewUrl ? (
            <>
              <img 
                src={previewUrl} 
                alt="Preview do anúncio" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              <div style={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                background: 'rgba(0,0,0,0.6)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 500
              }}>
                Trocar foto
              </div>
            </>
          ) : (
            <>
              <span style={{ fontSize: 32, marginBottom: 8 }}>📷</span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>Toque para adicionar uma foto</span>
            </>
          )}
        </label>
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

      {/* Grid com Preço e Categoria lado a lado */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="form-group">
          <label className="form-label">Preço</label>
          <input className="form-input" value={form.price}
            onChange={e => set('price', e.target.value)} placeholder="A negociar" />
        </div>
        
        <div className="form-group">
          <label className="form-label">Categoria *</label>
          <select className="form-select" value={form.category}
            onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>
    </Modal>
  )
}