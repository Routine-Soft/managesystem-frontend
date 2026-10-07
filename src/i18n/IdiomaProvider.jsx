import { useCallback, useEffect, useMemo, useState } from 'react'
import { IdiomaContext } from './IdiomaContext'
import { lerIdioma, salvarIdioma } from './idioma'
import { traduzir } from './textos'

export function IdiomaProvider({ children }) {
    const [idioma, setIdioma] = useState(lerIdioma)

    useEffect(() => {
        salvarIdioma(idioma)
    }, [idioma])

    const t = useCallback((chave, params) => traduzir(idioma, chave, params), [idioma])
    const valor = useMemo(() => ({ idioma, setIdioma, t }), [idioma, t])

    return <IdiomaContext.Provider value={valor}>{children}</IdiomaContext.Provider>
}

export default IdiomaProvider
