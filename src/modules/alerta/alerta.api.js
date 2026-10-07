import httpClient from '@/services/httpClient'

export const buscarAlertas = () => httpClient.get('/alertas')
export const salvarAlertas = (dados) => httpClient.patch('/alertas', dados)
export const vincularTelegram = () => httpClient.post('/alertas/telegram/vincular')
export const desconectarTelegram = () => httpClient.post('/alertas/telegram/desconectar')
export const testarTelegram = () => httpClient.post('/alertas/telegram/testar')
