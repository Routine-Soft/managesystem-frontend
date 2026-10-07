import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthContext } from '@/hooks/useAuthContext'
import { useIdioma } from '@/i18n/useIdioma'
import { IconeX } from '@/components/Icones/Icones'
import { buscarAssinatura } from '../assinatura.api'
import { avisoDeVencimento } from '../assinatura.utils'
import './aviso-vencimento.css'

function hoje() {
    return new Date().toLocaleDateString('en-CA')
}

// Barra fina no topo: teste, Pix ou cartão em atraso perto de vencer. Fechar esconde até amanhã.
export function AvisoVencimento() {
    const { user } = useAuthContext()
    const { t } = useIdioma()
    const { pathname } = useLocation()
    const [assinatura, setAssinatura] = useState(null)
    const [fechada, setFechada] = useState(false)
    const ehAdmin = user?.role === 'admin'

    useEffect(() => {
        if (!ehAdmin) return undefined
        let ignore = false
        buscarAssinatura().then(({ data }) => { if (!ignore) setAssinatura(data) }).catch(() => null)
        return () => {
            ignore = true
        }
    }, [ehAdmin])

    useEffect(() => {
        function aoAtualizar(e) {
            if (e.detail) setAssinatura(e.detail)
        }
        window.addEventListener('assinatura:atualizada', aoAtualizar)
        return () => window.removeEventListener('assinatura:atualizada', aoAtualizar)
    }, [])

    const aviso = ehAdmin ? avisoDeVencimento(assinatura) : null
    if (!aviso) return null

    const chave = `aviso-vencimento:${user?.tenantId}:${assinatura.acesso.ate}`
    let fechadaHoje = false
    try {
        fechadaHoje = localStorage.getItem(chave) === hoje()
    } catch {
        // sem storage
    }
    if (fechada || fechadaHoje) return null

    function fechar() {
        try {
            localStorage.setItem(chave, hoje())
        } catch {
            // sem storage: fecha até recarregar
        }
        setFechada(true)
    }

    const quando = aviso.dias <= 0 ? t('assinatura.aviso.hoje') : aviso.dias === 1 ? t('assinatura.aviso.amanha') : t('assinatura.aviso.emDias', { dias: aviso.dias })

    return (
        <div className="aviso-vencimento" data-tom={aviso.tom} role={aviso.tom === 'danger' ? 'alert' : 'status'}>
            <span className="aviso-vencimento__texto">{t(`assinatura.aviso.${aviso.tipo}`, { quando })}</span>
            {pathname !== '/assinatura' && (
                <Link to="/assinatura" className="aviso-vencimento__pagar">{t(`assinatura.aviso.${aviso.botao}`)}</Link>
            )}
            <button type="button" className="aviso-vencimento__fechar" aria-label={t('assinatura.aviso.fechar')} title={t('assinatura.aviso.fechar')} onClick={fechar}>
                <IconeX />
            </button>
        </div>
    )
}

export default AvisoVencimento
