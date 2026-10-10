import httpClient from '@/services/httpClient'

export const buscarAssinatura = () => httpClient.get('/assinaturas/atual')
export const listarPlanos = () => httpClient.get('/planos')
export const listarPagamentos = () => httpClient.get('/assinaturas/pagamentos')
export const checkoutStripe = (planoId) => httpClient.post('/assinaturas/stripe/checkout', { planoId })
export const portalStripe = () => httpClient.post('/assinaturas/stripe/portal')
export const sincronizarStripe = (sessionId) => httpClient.post('/assinaturas/stripe/sincronizar', { sessionId })
export const cartaoMercadoPago = (planoId) => httpClient.post('/assinaturas/mercadopago/cartao', { planoId })
export const sincronizarMercadoPago = () => httpClient.post('/assinaturas/mercadopago/sincronizar')
export const cancelarCartaoMercadoPago = () => httpClient.post('/assinaturas/mercadopago/cancelar')
export const gerarPix = (planoId, documento) => httpClient.post('/assinaturas/pix', { planoId, documento })
export const sincronizarPix = () => httpClient.post('/assinaturas/pix/sincronizar')
