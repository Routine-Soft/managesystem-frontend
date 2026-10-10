import { useSyncExternalStore } from 'react'
import { useIdioma } from '@/i18n/useIdioma'
import { assinarInstalacao, podeInstalar, instalarApp } from '@/utils/instalarApp'
import { Icone } from '@/components/Icones/Icones'

// Só aparece quando o navegador permite instalar (Chrome, Edge ou Android, com o app ainda não instalado).
export function BotaoInstalar() {
    const { t } = useIdioma()
    const disponivel = useSyncExternalStore(assinarInstalacao, podeInstalar, () => false)
    if (!disponivel) return null

    return (
        <button type="button" className="btn btn--ghost btn--sm btn--block sidebar__instalar" onClick={instalarApp}>
            <Icone>
                <path d="M12 3v12M7 10l5 5 5-5" />
                <rect x="3" y="17" width="18" height="4" rx="1" />
            </Icone>
            {t('comum.instalarApp')}
        </button>
    )
}

export default BotaoInstalar
