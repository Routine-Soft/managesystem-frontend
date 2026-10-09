import httpClient from '@/services/httpClient'

export const listarContratantes = () => httpClient.get('/contratantes')
export const criarContratante = (dados) => httpClient.post('/contratantes', dados)
export const atualizarContratante = (id, dados) => httpClient.patch(`/contratantes/${id}`, dados)
export const removerContratante = (id) => httpClient.delete(`/contratantes/${id}`)
export const gerarLinkDeAcesso = (id) => httpClient.post(`/contratantes/${id}/link`)
export const listarFaturas = (id) => httpClient.get(`/contratantes/${id}/faturas`)
export const gerarFatura = (id) => httpClient.post(`/contratantes/${id}/faturas`)
export const alterarFatura = (id, acao) => httpClient.patch(`/faturas/${id}`, { acao })

export const listarServidores = () => httpClient.get('/servidores')
export const listarSites = () => httpClient.get('/sites')

export const buscarRecebimentos = () => httpClient.get('/recebimentos')
export const conectarMercadoPago = (accessToken) => httpClient.post('/recebimentos/mercadopago', { accessToken })
export const conectarStripe = (chave) => httpClient.post('/recebimentos/stripe', { chave })
export const desconectarRecebimento = (gateway) => httpClient.delete(`/recebimentos/${gateway}`)
