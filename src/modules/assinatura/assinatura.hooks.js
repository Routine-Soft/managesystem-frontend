import { useCallback, useEffect, useState } from 'react'
import * as api from './assinatura.api'

// Assinatura, planos e pagamentos da tela de assinatura.
export function useAssinatura({ comPagamentos = false } = {}) {
    const [assinatura, setAssinatura] = useState(null)
    const [planos, setPlanos] = useState([])
    const [pagamentos, setPagamentos] = useState([])
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState(null)
    const [versao, setVersao] = useState(0)

    useEffect(() => {
        let ignore = false
        Promise.resolve()
            .then(() => {
                if (ignore) return null
                setLoading(true)
                return Promise.all([api.buscarAssinatura(), api.listarPlanos(), comPagamentos ? api.listarPagamentos() : { data: [] }])
            })
            .then((r) => {
                if (ignore || !r) return
                setAssinatura(r[0].data)
                setPlanos(r[1].data)
                setPagamentos(r[2].data)
                setErro(null)
                setLoading(false)
            })
            .catch((e) => {
                if (!ignore) {
                    setErro(e)
                    setLoading(false)
                }
            })
        return () => {
            ignore = true
        }
    }, [comPagamentos, versao])

    const recarregar = useCallback(() => setVersao((v) => v + 1), [])

    // Avisa a barra do topo e a trava de acesso que a assinatura mudou.
    const aplicarAssinatura = useCallback((nova) => {
        setAssinatura(nova)
        window.dispatchEvent(new CustomEvent('assinatura:atualizada', { detail: nova }))
    }, [])

    // Cartão: Mercado Pago no Brasil, Stripe fora (o backend diz qual está disponível em formasDePagamento).
    async function irParaCheckout(planoId) {
        const { data } = assinatura?.formasDePagamento?.cartaoMercadoPago ? await api.cartaoMercadoPago(planoId) : await api.checkoutStripe(planoId)
        window.location.href = data.url
    }

    async function cancelarCartao() {
        const { data } = await api.cancelarCartaoMercadoPago()
        aplicarAssinatura(data)
    }

    async function irParaPortal() {
        const { data } = await api.portalStripe()
        window.location.href = data.url
    }

    return { assinatura, planos, pagamentos, loading, erro, recarregar, aplicarAssinatura, irParaCheckout, irParaPortal, cancelarCartao }
}
