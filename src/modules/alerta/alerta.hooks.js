import { useEffect, useState } from 'react'
import * as api from './alerta.api'

const CONSULTA_MS = 3000

export function useAlertas() {
    const [config, setConfig] = useState(null)
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState(null)
    const [link, setLink] = useState(null)

    useEffect(() => {
        let ignore = false
        api.buscarAlertas()
            .then((r) => {
                if (ignore) return
                setConfig(r.data)
                setLoading(false)
            })
            .catch((e) => {
                if (ignore) return
                setErro(e)
                setLoading(false)
            })
        return () => {
            ignore = true
        }
    }, [])

    // Com o link aberto, pergunta a cada 3 s se o Telegram já foi conectado.
    useEffect(() => {
        if (!link) return undefined
        const timer = setInterval(() => {
            api.buscarAlertas()
                .then((r) => {
                    if (r.data.telegram?.chatId) {
                        setConfig(r.data)
                        setLink(null)
                    }
                })
                .catch(() => null)
        }, CONSULTA_MS)
        return () => clearInterval(timer)
    }, [link])

    async function gerarLink() {
        const { data } = await api.vincularTelegram()
        setLink(data)
        return data
    }

    async function salvar(dados) {
        const r = await api.salvarAlertas(dados)
        setConfig(r.data)
        return r
    }

    async function desconectar() {
        const r = await api.desconectarTelegram()
        setConfig(r.data)
    }

    return { config, loading, erro, link, gerarLink, salvar, desconectar, testar: api.testarTelegram }
}
