import { useEffect, useRef, useState } from 'react'

// Largura do elemento em pixels, atualizada quando ele muda de tamanho (os gráficos se desenham nessa largura).
// Começa em 0: o gráfico só se desenha depois de medir, para nunca alargar o cartão (celular).
export function useLargura(inicial = 0) {
    const ref = useRef(null)
    const [largura, setLargura] = useState(inicial)

    useEffect(() => {
        const elemento = ref.current
        if (!elemento) return undefined
        const observador = new ResizeObserver(([entrada]) => {
            setLargura(Math.round(entrada.contentRect.width))
        })
        observador.observe(elemento)
        return () => observador.disconnect()
    }, [])

    return [ref, largura]
}
