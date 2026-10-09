import { useCallback, useEffect, useState } from 'react'
import * as api from './contratante.api'

// Lista de clientes finais + o que pode ser ligado a eles (servidores e sites) + contas de recebimento.
export function useContratantes() {
    const [contratantes, setContratantes] = useState([])
    const [servidores, setServidores] = useState([])
    const [sites, setSites] = useState([])
    const [recebimentos, setRecebimentos] = useState(null)
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState(null)

    useEffect(() => {
        let ignore = false
        Promise.resolve()
            .then(() => Promise.all([api.listarContratantes(), api.listarServidores(), api.listarSites(), api.buscarRecebimentos().catch(() => ({ data: null }))]))
            .then(([c, srv, s, r]) => {
                if (ignore) return
                setContratantes(c.data)
                setServidores(srv.data)
                setSites(s.data)
                setRecebimentos(r.data)
                setLoading(false)
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
    }, [])

    const substituir = useCallback((contratante) => {
        setContratantes((lista) => {
            const existe = lista.some((c) => c._id === contratante._id)
            const nova = existe ? lista.map((c) => (c._id === contratante._id ? contratante : c)) : [...lista, contratante]
            return nova.sort((a, b) => a.nome.localeCompare(b.nome))
        })
    }, [])

    async function remover(id) {
        await api.removerContratante(id)
        setContratantes((lista) => lista.filter((c) => c._id !== id))
    }

    return { contratantes, servidores, sites, recebimentos, setRecebimentos, loading, erro, substituir, remover }
}

export function useFaturas(contratanteId) {
    const [faturas, setFaturas] = useState([])
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState(null)

    useEffect(() => {
        let ignore = false
        Promise.resolve()
            .then(() => api.listarFaturas(contratanteId))
            .then((r) => {
                if (!ignore) {
                    setFaturas(r.data)
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
    }, [contratanteId])

    function trocar(fatura) {
        setFaturas((lista) => {
            const existe = lista.some((f) => f._id === fatura._id)
            const nova = existe ? lista.map((f) => (f._id === fatura._id ? fatura : f)) : [fatura, ...lista]
            return nova.sort((a, b) => new Date(b.vencimento) - new Date(a.vencimento))
        })
    }

    async function gerar() {
        const { data } = await api.gerarFatura(contratanteId)
        trocar(data)
        return data
    }

    async function alterar(id, acao) {
        const { data } = await api.alterarFatura(id, acao)
        trocar(data)
        return data
    }

    return { faturas, loading, erro, gerar, alterar }
}
