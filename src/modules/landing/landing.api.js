import httpClient from '@/services/httpClient'

export const buscarPlanosPublicos = () => httpClient.get('/planos/publicos')
