import { useCallback, useEffect, useState } from 'react'
import * as api from './user.api'

export function useEquipe() {
    const [membros, setMembros] = useState([])
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState(null)

    useEffect(() => {
        let ignore = false
        api.listarEquipe()
            .then((r) => {
                if (ignore) return
                setMembros(r.data)
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

    const substituir = useCallback((m) => {
        setMembros((lista) => (lista.some((x) => x._id === m._id) ? lista.map((x) => (x._id === m._id ? m : x)) : [...lista, m]))
    }, [])

    async function remover(id) {
        await api.removerMembro(id)
        setMembros((lista) => lista.filter((m) => m._id !== id))
    }

    return { membros, loading, erro, substituir, remover }
}
