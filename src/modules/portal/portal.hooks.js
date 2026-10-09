import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIdioma } from '@/i18n/useIdioma'
import { sessaoDoPortal } from '@/services/portalClient'
import * as api from './portal.api'

// Entrar no portal (login ou criação de senha): guarda a sessão e aplica o idioma do cliente.
export function useEntrarNoPortal() {
    const { setIdioma } = useIdioma()
    const navigate = useNavigate()

    return useCallback((sessao) => {
        sessaoDoPortal.iniciar(sessao)
        if (sessao.contratante?.idioma) setIdioma(sessao.contratante.idioma)
        navigate('/portal', { replace: true })
    }, [navigate, setIdioma])
}

export function useResumoDoPortal() {
    const [dados, setDados] = useState(null)
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState(null)
    const [versao, setVersao] = useState(0)

    useEffect(() => {
        let ignore = false
        Promise.resolve()
            .then(() => api.buscarResumo())
            .then((r) => {
                if (!ignore) {
                    setDados(r.data)
                    setErro(null)
                    setLoading(false)
                }
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
    }, [versao])

    // Atualiza sozinho a cada minuto (o status do site muda).
    useEffect(() => {
        const intervalo = setInterval(() => setVersao((v) => v + 1), 60000)
        return () => clearInterval(intervalo)
    }, [])

    const recarregar = useCallback(() => setVersao((v) => v + 1), [])

    return { dados, loading, erro, recarregar }
}
