// src/components/ui/Modal.jsx
import { useEffect } from 'react'

export function Modal({ title, subtitle, icon, onClose, children, footer }) {
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  return (
    <div
      className="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal">
        <div className="modal-header">
          {icon && <span className="modal-icon">{icon}</span>}
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

export function Confirm({ title, text, onConfirm, onCancel, danger }) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button className="btn btn-outline btn-sm" onClick={onCancel}>Cancelar</button>
          <button
            className={`btn btn-sm ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            Confirmar
          </button>
        </>
      }
    >
      <p style={{ fontSize: 14, color: 'var(--text-mid)' }}>{text}</p>
    </Modal>
  )
}
