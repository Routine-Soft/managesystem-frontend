import httpClient from '@/services/httpClient'

export const listarSites = () => httpClient.get('/sites')
export const criarSite = (dados) => httpClient.post('/sites', dados)
export const atualizarSite = (id, dados) => httpClient.patch(`/sites/${id}`, dados)
export const removerSite = (id) => httpClient.delete(`/sites/${id}`)
export const verificarSite = (id) => httpClient.post(`/sites/${id}/verificar`)
export const listarServidoresResumo = () => httpClient.get('/servidores')
