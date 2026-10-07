import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useIdioma } from '@/i18n/useIdioma'
import { IconeCheck, IconeRelogio } from '@/components/Icones/Icones'
import { sincronizarStripe } from '../assinatura.api'
import './assinatura.css'

// Volta do checkout do Stripe: confirma a assinatura na hora, sem esperar o aviso (webhook).
export function AssinaturaRetorno() {
    const { t } = useIdioma()
    const [params] = useSearchParams()
    const sessionId = params.get('session_id')
    const [situacao, setSituacao] = useState('confirmando')

    useEffect(() => {
        let ignore = false
        sincronizarStripe(sessionId)
            .then(({ data }) => {
                if (ignore) return
                window.dispatchEvent(new CustomEvent('assinatura:atualizada', { detail: data }))
                setSituacao(data.status === 'ativa' ? 'ok' : 'pendente')
            })
            .catch(() => { if (!ignore) setSituacao('pendente') })
        return () => {
            ignore = true
        }
    }, [sessionId])

    return (
        <div className="page page--narrow">
            <section className="card assinatura-retorno" data-situacao={situacao === 'ok' ? 'ativa' : situacao === 'confirmando' ? 'verificando' : 'pendente'} role="status">
                <div className="assinatura-retorno__icone">{situacao === 'ok' ? <IconeCheck /> : <IconeRelogio />}</div>
                <h1 className="assinatura-retorno__titulo">
                    {situacao === 'confirmando' ? t('assinatura.retorno.confirmando') : situacao === 'ok' ? t('assinatura.retorno.ok') : t('assinatura.retorno.pendente')}
                </h1>
                {situacao !== 'confirmando' && (
                    <p className="assinatura-retorno__texto">{situacao === 'ok' ? t('assinatura.retorno.okTexto') : t('assinatura.retorno.pendenteTexto')}</p>
                )}
                <div className="assinatura-retorno__acoes">
                    <Link to="/inicio" className="btn btn--primary">{t('assinatura.retorno.irPainel')}</Link>
                    <Link to="/assinatura" className="btn btn--ghost">{t('assinatura.retorno.verAssinatura')}</Link>
                </div>
            </section>
        </div>
    )
}

export default AssinaturaRetorno
