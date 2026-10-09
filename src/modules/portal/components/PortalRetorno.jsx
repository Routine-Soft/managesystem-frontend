import { useEffect, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { useIdioma } from '@/i18n/useIdioma'
import { formatarMoeda } from '@/i18n/formatar'
import { IconeCheck } from '@/components/Icones/Icones'
import { sessaoDoPortal } from '@/services/portalClient'
import { conferirFatura } from '../portal.api'
import PortalLayout from './PortalLayout'

const TENTATIVAS = 8
const INTERVALO_MS = 4000

// Volta do Mercado Pago / Stripe: confere algumas vezes se o pagamento já caiu (o Pix pode levar alguns segundos).
export function PortalRetorno() {
    const { t, idioma } = useIdioma()
    const [params] = useSearchParams()
    const faturaId = params.get('fatura')
    const [fatura, setFatura] = useState(null)
    const [terminou, setTerminou] = useState(false)
    const [erro, setErro] = useState(null)

    useEffect(() => {
        if (!faturaId) return undefined
        let ignore = false
        let tentativa = 0
        let espera = null

        const conferir = () => conferirFatura(faturaId)
            .then((r) => {
                if (ignore) return
                setFatura(r.data)
                tentativa++
                if (r.data.status === 'paga' || tentativa >= TENTATIVAS) setTerminou(true)
                else espera = setTimeout(conferir, INTERVALO_MS)
            })
            .catch((e) => {
                if (!ignore) {
                    setErro(e)
                    setTerminou(true)
                }
            })

        Promise.resolve().then(conferir)
        return () => {
            ignore = true
            clearTimeout(espera)
        }
    }, [faturaId])

    if (!sessaoDoPortal.ativa()) return <Navigate to="/portal/login" replace />
    if (!faturaId) return <Navigate to="/portal" replace />

    const paga = fatura?.status === 'paga'

    return (
        <PortalLayout>
            <section className="card portal-retorno">
                {erro ? (
                    <p className="alert alert--error" role="alert">{erro.message}</p>
                ) : paga ? (
                    <>
                        <span className="portal-retorno__icone"><IconeCheck /></span>
                        <h1 className="page-title">{t('portal.retorno.pago')}</h1>
                        <p className="texto-suave">{t('portal.retorno.obrigado', { valor: formatarMoeda(fatura.total, fatura.moeda, idioma) })}</p>
                    </>
                ) : terminou ? (
                    <>
                        <h1 className="page-title">{t('portal.retorno.aguardando')}</h1>
                        <p className="texto-suave">{t('portal.retorno.aguardandoTexto')}</p>
                    </>
                ) : (
                    <>
                        <div className="portal-retorno__girando" aria-hidden="true" />
                        <h1 className="page-title">{t('portal.retorno.conferindo')}</h1>
                    </>
                )}
                <Link className="btn btn--primary" to="/portal">{t('portal.retorno.voltar')}</Link>
            </section>
        </PortalLayout>
    )
}

export default PortalRetorno
