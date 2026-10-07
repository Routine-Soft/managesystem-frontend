import { useCallback, useEffect, useState } from 'react'
import * as api from './site.api'

export function useSites() {
    const [sites, setSites] = useState([])
    const [servidores, setServidores] = useState([])
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState(null)
    const [versao, setVersao] = useState(0)

    useEffect(() => {
        let ignore = false
        Promise.resolve()
            .then(() => Promise.all([api.listarSites(), api.listarServidoresResumo()]))
            .then(([s, srv]) => {
                if (ignore) return
                setSites(s.data)
                setServidores(srv.data)
                setErro(null)
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
    }, [versao])

    const recarregar = useCallback(() => setVersao((v) => v + 1), [])

    const substituir = useCallback((site) => {
        setSites((lista) => {
            const existe = lista.some((s) => s._id === site._id)
            const nova = existe ? lista.map((s) => (s._id === site._id ? site : s)) : [...lista, site]
            return nova.sort((a, b) => a.dominio.localeCompare(b.dominio))
        })
    }, [])

    async function remover(id) {
        await api.removerSite(id)
        setSites((lista) => lista.filter((s) => s._id !== id))
    }

    async function verificar(id) {
        const { data } = await api.verificarSite(id)
        substituir(data)
        return data
    }

    return { sites, servidores, loading, erro, recarregar, substituir, remover, verificar }
}
