import portalClient from '@/services/portalClient'

export const dadosDoLink = (token) => portalClient.get(`/portal/acesso/${encodeURIComponent(token)}`)
export const criarSenha = (token, password) => portalClient.post(`/portal/acesso/${encodeURIComponent(token)}`, { password })
export const entrar = (email, password) => portalClient.post('/portal/login', { email, password })
export const sair = () => portalClient.post('/portal/logout')
export const buscarResumo = () => portalClient.get(`/portal/resumo?tz=${encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC')}`)
export const salvarIdioma = (idioma) => portalClient.patch('/portal/me', { idioma })
export const pagarFatura = (id) => portalClient.post(`/portal/faturas/${id}/pagar`)
export const conferirFatura = (id) => portalClient.post(`/portal/faturas/${id}/conferir`)
export const linkDoTelegram = () => portalClient.post('/portal/telegram/vincular')
export const desconectarTelegram = () => portalClient.post('/portal/telegram/desconectar')
