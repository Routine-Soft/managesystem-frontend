import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useIdioma } from '@/i18n/useIdioma'
import './Modal.css'

const FOCAVEIS = 'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'

export function Modal({ title, onClose, wide = false, className = '', persistente = false, children }) {
    const { t } = useIdioma()
    const [closing, setClosing] = useState(false)
    const [elementoAnterior] = useState(() => document.activeElement)
    const painelRef = useRef(null)
    const titleId = useId()

    useEffect(() => {
        const overflowAnterior = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        const alvoInicial =
            painelRef.current?.querySelector('[data-autofocus]') ??
            painelRef.current?.querySelector('input, select, textarea') ??
            painelRef.current?.querySelector(FOCAVEIS)
        alvoInicial?.focus()

        function handleKeyDown(e) {
            if (e.key === 'Escape') {
                setClosing(true)
                return
            }
            if (e.key !== 'Tab' || !painelRef.current) return

            const focaveis = painelRef.current.querySelectorAll(FOCAVEIS)
            if (focaveis.length === 0) return
            const primeiro = focaveis[0]
            const ultimo = focaveis[focaveis.length - 1]

            if (e.shiftKey && document.activeElement === primeiro) {
                e.preventDefault()
                ultimo.focus()
            } else if (!e.shiftKey && document.activeElement === ultimo) {
                e.preventDefault()
                primeiro.focus()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = overflowAnterior
            elementoAnterior?.focus?.()
        }
    }, [elementoAnterior])

    function handleAnimationEnd(e) {
        if (closing && e.target === e.currentTarget) onClose()
    }

    return createPortal(
        <div
            className={`modal-overlay${closing ? ' modal-overlay--closing' : ''}`}
            onMouseDown={(e) => { if (!persistente && e.target === e.currentTarget) setClosing(true) }}
            onAnimationEnd={handleAnimationEnd}
        >
            <div ref={painelRef} className={`modal${wide ? ' modal--wide' : ''}${className ? ` ${className}` : ''}`} role="dialog" aria-modal="true" aria-labelledby={titleId}>
                <header className="modal__header">
                    <h3 className="modal__title" id={titleId}>{title}</h3>
                    <button type="button" className="modal__close" aria-label={t('comum.fechar')} onClick={() => setClosing(true)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                    </button>
                </header>
                {typeof children === 'function' ? children(() => setClosing(true)) : children}
            </div>
        </div>,
        document.body
    )
}

export default Modal
