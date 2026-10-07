import { useState } from 'react'
import { useIdioma } from '@/i18n/useIdioma'
import { IconeLixeira, IconeCheck, IconeX } from '@/components/Icones/Icones'
import './ExcluirInline.css'

// Confirmação no próprio lugar: o botão vira "Excluir? ✓ ✗".
export function ExcluirInline({ onConfirmar, rotulo }) {
    const { t } = useIdioma()
    const [confirmando, setConfirmando] = useState(false)
    const [excluindo, setExcluindo] = useState(false)

    async function confirmar() {
        setExcluindo(true)
        const ok = await onConfirmar()
        if (!ok) {
            setExcluindo(false)
            setConfirmando(false)
        }
    }

    if (!confirmando) {
        return (
            <button type="button" className="icon-btn icon-btn--danger" aria-label={rotulo ?? t('comum.excluir')} title={rotulo ?? t('comum.excluir')} onClick={() => setConfirmando(true)}>
                <IconeLixeira />
            </button>
        )
    }

    return (
        <span className="excluir-inline" role="group">
            <span className="excluir-inline__texto">{t('comum.excluirConfirma')}</span>
            <button type="button" className="icon-btn icon-btn--danger" aria-label={t('comum.confirmar')} disabled={excluindo} onClick={confirmar}>
                <IconeCheck />
            </button>
            <button type="button" className="icon-btn" aria-label={t('comum.cancelar')} disabled={excluindo} onClick={() => setConfirmando(false)} autoFocus>
                <IconeX />
            </button>
        </span>
    )
}

export default ExcluirInline
