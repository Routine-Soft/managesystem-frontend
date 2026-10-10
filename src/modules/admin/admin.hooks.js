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

    // Cada ação devolve true/false (o ModalForm só fecha quando deu certo) e mostra a mensagem do servidor.
    const [erroAcao, setErroAcao] = useState(null)
    const [sucesso, setSucesso] = useState(null)
    async function executar(acao) {
        setErroAcao(null)
        setSucesso(null)
        try {
            const r = await acao()
            setSucesso(r?.message ?? null)
            recarregar()
            return true
        } catch (e) {
            setErroAcao(e)
            return false
        }
    }

    return {
        clientes, resumo, planos, loading, erro, erroAcao, sucesso, recarregar,
        criar: (dados) => executar(() => api.criarCliente(dados)),
        editar: (id, dados) => executar(() => api.editarCliente(id, dados)),
        excluir: (id) => executar(() => api.excluirCliente(id)),
        redefinirSenha: (id, novaSenha) => executar(() => api.redefinirSenhaCliente(id, novaSenha)),
        trocarPlano: (id, planoId, ate) => executar(() => api.liberarCliente(id, planoId, ate)),
        estenderTeste: (id, dias) => executar(() => api.estenderTeste(id, dias)),
        definirBloqueio: (id, bloqueado) => executar(() => api.bloquearCliente(id, bloqueado)),
    }
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
