import { useCallback, useEffect, useState } from 'react'
import * as api from './servidor.api'

const ATUALIZAR_A_CADA_MS = 30000

// Busca os dados e repete a cada 30 s enquanto a tela está aberta (e a aba visível).
// `buscar` precisa ser estável (useCallback): quando muda, busca de novo.
function useAtualizacaoPeriodica(buscar) {
    const [dados, setDados] = useState(null)
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState(null)
    const [atualizadoEm, setAtualizadoEm] = useState(null)
    const [versao, setVersao] = useState(0)

    useEffect(() => {
        let ignore = false
        const carregar = () => buscar()
            .then((r) => {
                if (ignore) return
                setDados(r.data)
                setErro(null)
                setLoading(false)
                setAtualizadoEm(Date.now())
            })
            .catch((e) => {
                if (ignore) return
                setErro(e)
                setLoading(false)
            })
        carregar()
        const timer = setInterval(() => {
            if (document.visibilityState === 'visible') carregar()
        }, ATUALIZAR_A_CADA_MS)
        return () => {
            ignore = true
            clearInterval(timer)
        }
    }, [buscar, versao])

    const recarregar = useCallback(() => setVersao((v) => v + 1), [])
    return { dados, loading, erro, atualizadoEm, recarregar, setDados }
}

export function useResumo() {
    return useAtualizacaoPeriodica(api.buscarResumo)
}

export function usePainelDoServidor(id, periodo) {
    const buscar = useCallback(() => api.buscarPainel(id, periodo), [id, periodo])
    return useAtualizacaoPeriodica(buscar)
}

// "há 12 segundos" que anda sozinho.
export function useAgora(intervaloMs = 5000) {
    const [agora, setAgora] = useState(() => Date.now())
    useEffect(() => {
        const timer = setInterval(() => setAgora(Date.now()), intervaloMs)
        return () => clearInterval(timer)
    }, [intervaloMs])
    return agora
}

// Servidores que têm containers (para ligar um sistema ao container dele). Busca uma vez ao abrir o formulário.
export function useServidoresComContainers(excluirId = null) {
    const [lista, setLista] = useState([])
    useEffect(() => {
        let ignore = false
        api.buscarResumo()
            .then((r) => {
                if (!ignore) setLista((r.data?.servidores ?? []).filter((s) => s.containers?.length && s._id !== excluirId))
            })
            .catch(() => null)
        return () => {
            ignore = true
        }
    }, [excluirId])
    return lista
}
