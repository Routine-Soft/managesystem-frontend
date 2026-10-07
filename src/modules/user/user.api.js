import httpClient from '@/services/httpClient'

export const registrar = (dados) => httpClient.post('/users/registro', dados)
export const login = (dados) => httpClient.post('/users/login', dados)
export const logout = () => httpClient.post('/users/logout')
export const buscarMe = () => httpClient.get('/users/me')
export const atualizarMe = (dados) => httpClient.patch('/users/me', dados)
export const alterarMinhaSenha = (dados) => httpClient.post('/users/me/senha', dados)

export const listarEquipe = () => httpClient.get('/users/equipe')
export const criarMembro = (dados) => httpClient.post('/users/equipe', dados)
export const atualizarMembro = (id, dados) => httpClient.patch(`/users/equipe/${id}`, dados)
export const redefinirSenhaMembro = (id, novaSenha) => httpClient.patch(`/users/equipe/${id}/senha`, { novaSenha })
export const removerMembro = (id) => httpClient.delete(`/users/equipe/${id}`)
