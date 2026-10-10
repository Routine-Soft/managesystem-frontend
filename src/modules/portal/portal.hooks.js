import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIdioma } from '@/i18n/useIdioma'
import { sessaoDoPortal } from '@/services/portalClient'
import { assinarInstalacao, ehAndroid, ehIOS, instalarApp, podeInstalar, rodandoComoApp } from '@/utils/instalarApp'
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

// Parte técnica de um servidor: busca ao abrir, ao trocar o período e a cada minuto (com a aba visível).
export function usePainelDoServidorNoPortal(id, periodo) {
    const [dados, setDados] = useState(null)
    const [erro, setErro] = useState(null)

    useEffect(() => {
        let ignore = false
        const carregar = () => api.buscarPainelDoServidor(id, periodo)
            .then((r) => {
                if (!ignore) {
                    setDados(r.data)
                    setErro(null)
                }
            })
            .catch((e) => {
                if (!ignore) setErro(e)
            })
        carregar()
        const intervalo = setInterval(() => {
            if (document.visibilityState === 'visible') carregar()
        }, 60000)
        return () => {
            ignore = true
            clearInterval(intervalo)
        }
    }, [id, periodo])

    return { dados, erro }
}

const CHAVE_DISPENSADO = 'portalInstalarDispensado'

function lerDispensado() {
    try {
        return localStorage.getItem(CHAVE_DISPENSADO) === '1'
    } catch {
        return false
    }
}

// Instalar o portal como app. O botão aparece sempre (menos quando já está aberto pelo ícone):
// se o navegador já liberou a janela de instalar, abre ela; senão mostra o passo a passo do aparelho
// (o Chrome só libera depois de uns segundos de uso, e Safari/Firefox nunca liberam).
export function useInstalarPortal() {
    const disponivel = useSyncExternalStore(assinarInstalacao, podeInstalar, () => false)
    const [dispensado, setDispensado] = useState(lerDispensado)
    const [passoAPasso, setPassoAPasso] = useState(null)
    const modo = rodandoComoApp() ? null : disponivel ? 'janela' : 'passos'
    const plataforma = ehIOS() ? 'ios' : ehAndroid() ? 'android' : 'computador'

    function instalar() {
        if (modo === 'janela') instalarApp()
        else setPassoAPasso(plataforma)
    }

    function dispensar() {
        setDispensado(true)
        try {
            localStorage.setItem(CHAVE_DISPENSADO, '1')
        } catch {
            // storage indisponível: o aviso some só nesta visita
        }
    }

    return { modo, instalar, dispensar, dispensado, passoAPasso, fecharPassoAPasso: () => setPassoAPasso(null) }
}
