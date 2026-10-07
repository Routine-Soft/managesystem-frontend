import { useState } from 'react'
import { useIdioma } from '@/i18n/useIdioma'
import { IconeCopiar, IconeCheck } from '@/components/Icones/Icones'

export function BotaoCopiar({ texto, className = 'btn btn--ghost btn--sm' }) {
    const { t } = useIdioma()
    const [copiado, setCopiado] = useState(false)

    async function copiar() {
        try {
            await navigator.clipboard.writeText(texto)
        } catch {
            // navegador sem permissão: seleciona o texto para a pessoa copiar na mão
            return
        }
        setCopiado(true)
        setTimeout(() => setCopiado(false), 2000)
    }

    return (
        <button type="button" className={className} onClick={copiar} aria-live="polite">
            {copiado ? <IconeCheck /> : <IconeCopiar />}
            {copiado ? t('comum.copiado') : t('comum.copiar')}
        </button>
    )
}

export default BotaoCopiar
