import { useContext } from 'react'
import { IdiomaContext } from './IdiomaContext'

export function useIdioma() {
    const contexto = useContext(IdiomaContext)
    if (!contexto) {
        throw new Error('useIdioma deve ser usado dentro de IdiomaProvider')
    }
    return contexto
}

export default useIdioma
