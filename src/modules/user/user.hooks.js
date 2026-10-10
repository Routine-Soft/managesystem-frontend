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

// Minha conta: dados frescos do servidor, salvar perfil e trocar senha. Mantém o usuário logado em dia.
export function useMinhaConta(atualizarUsuarioLogado) {
    const [perfil, setPerfil] = useState(null)
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState(null)
    const [sucesso, setSucesso] = useState(null)

    useEffect(() => {
        let ignore = false
        Promise.resolve()
            .then(() => api.buscarMe())
            .then((r) => {
                if (!ignore) {
                    setPerfil(r.data)
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
    }, [])

    // Devolvem true/false para o ModalForm fechar só quando deu certo.
    async function salvarPerfil(dados) {
        setErro(null)
        setSucesso(null)
        try {
            const r = await api.atualizarMe(dados)
            setPerfil(r.data)
            atualizarUsuarioLogado?.(r.data)
            setSucesso(r.message)
            return true
        } catch (e) {
            setErro(e)
            return false
        }
    }

    async function alterarSenha(dados) {
        setErro(null)
        setSucesso(null)
        try {
            const r = await api.alterarMinhaSenha(dados)
            setSucesso(r.message)
            return true
        } catch (e) {
            setErro(e)
            return false
        }
    }

    return { perfil, loading, erro, sucesso, salvarPerfil, alterarSenha }
}
