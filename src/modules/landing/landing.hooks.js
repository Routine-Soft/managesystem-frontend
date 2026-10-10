import { useEffect, useState } from 'react'
import { buscarPlanosPublicos } from './landing.api'

// Planos ativos para a página inicial (rota pública, sem login).
export function usePlanosPublicos() {
    const [dados, setDados] = useState({ planos: [], cotacaoUSD: null })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let ignore = false
        Promise.resolve()
            .then(() => buscarPlanosPublicos())
            .then((r) => {
                if (!ignore) {
                    setDados(r.data)
                    setLoading(false)
                }
            })
            .catch(() => {
                if (!ignore) setLoading(false)
            })
        return () => {
            ignore = true
        }
    }, [])

    return { ...dados, loading }
}

// Seções que aparecem ao rolar: ganham a classe "is-visivel" quando entram na tela.
export function useRevelarAoRolar() {
    useEffect(() => {
        const elementos = document.querySelectorAll('.revelar')
        if (!('IntersectionObserver' in window)) {
            elementos.forEach((el) => el.classList.add('is-visivel'))
            return undefined
        }
        const observador = new IntersectionObserver((entradas) => {
            for (const e of entradas) {
                if (e.isIntersecting) {
                    e.target.classList.add('is-visivel')
                    observador.unobserve(e.target)
                }
            }
        }, { threshold: 0.12 })
        elementos.forEach((el) => observador.observe(el))
        return () => observador.disconnect()
    }, [])
}
