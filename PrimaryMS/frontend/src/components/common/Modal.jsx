import { useEffect } from 'react'
import { FiX } from 'react-icons/fi'
import './Modal.css'

/**
 * @param {object}        props
 * @param {boolean}       props.isOpen
 * @param {Function}      props.onClose
 * @param {string}        props.title
 * @param {React.ReactNode} props.children
 */
export default function Modal({ isOpen, onClose, title, children }) {
  // Close on ESC
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h3 className="modal__title">{title}</h3>
          <button className="modal__close" onClick={onClose}><FiX /></button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  )
}
