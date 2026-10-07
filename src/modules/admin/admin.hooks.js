import { useCallback, useEffect, useState } from 'react'
import * as api from './admin.api'

export function useClientes() {
    const [clientes, setClientes] = useState([])
    const [resumo, setResumo] = useState(null)
    const [planos, setPlanos] = useState([])
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState(null)
    const [versao, setVersao] = useState(0)

    useEffect(() => {
        let ignore = false
        Promise.all([api.listarClientes(), api.resumoClientes(), api.listarPlanos()])
            .then(([c, r, p]) => {
                if (ignore) return
                setClientes(c.data)
                setResumo(r.data)
                setPlanos(p.data)
                setErro(null)
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
    }, [versao])

    const recarregar = useCallback(() => setVersao((v) => v + 1), [])
    return { clientes, resumo, planos, loading, erro, recarregar }
}

export function usePlanosAdmin() {
    const [planos, setPlanos] = useState([])
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState(null)

    useEffect(() => {
        let ignore = false
        api.listarPlanos()
            .then((r) => {
                if (ignore) return
                setPlanos(r.data)
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

    const substituir = useCallback((p) => {
        setPlanos((lista) => (lista.some((x) => x._id === p._id) ? lista.map((x) => (x._id === p._id ? p : x)) : [...lista, p]))
    }, [])

    async function remover(id) {
        await api.removerPlano(id)
        setPlanos((lista) => lista.filter((p) => p._id !== id))
    }

    return { planos, loading, erro, substituir, remover }
}
