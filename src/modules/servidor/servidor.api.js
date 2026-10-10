import httpClient from '@/services/httpClient'

export const buscarResumo = () => httpClient.get('/resumo')
export const criarServidor = (dados) => httpClient.post('/servidores', dados)
export const atualizarServidor = (id, dados) => httpClient.patch(`/servidores/${id}`, dados)
export const removerServidor = (id) => httpClient.delete(`/servidores/${id}`)
export const novoComando = (id) => httpClient.post(`/servidores/${id}/comando`)
export const pedirInventario = (id) => httpClient.post(`/servidores/${id}/verificar`)
export const pedirAcao = (id, tipo, senha) => httpClient.post(`/servidores/${id}/acoes`, { tipo, senha })

export function buscarPainel(id, periodo) {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    return httpClient.get(`/servidores/${id}/painel?periodo=${encodeURIComponent(periodo)}&tz=${encodeURIComponent(tz)}`)
}
