import { lerIdioma } from '@/i18n/idioma'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

class TokenManager {
  getAccessToken() {
    return localStorage.getItem('accessToken')
  }

  getRefreshToken() {
    return localStorage.getItem('refreshToken')
  }

  setTokens(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken)
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
  }

  clearTokens() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('currentUser')
  }

  temSessao() {
    return !!this.getRefreshToken()
  }
}

const tokenManager = new TokenManager()

function irParaLogin() {
  tokenManager.clearTokens()
  window.location.hash = '#/login'
}

// Várias chamadas que recebem 401 ao mesmo tempo esperam uma única renovação do token.
let renovando = null

async function renovarToken() {
  const refreshToken = tokenManager.getRefreshToken()
  if (!refreshToken) return false
  if (!renovando) {
    renovando = fetch(`${API_BASE_URL}/users/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept-Language': lerIdioma() },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (r) => {
        if (!r.ok) return false
        const data = await r.json()
        tokenManager.setTokens(data.data.accessToken)
        return true
      })
      .catch(() => false)
      .finally(() => {
        renovando = null
      })
  }
  return renovando
}

async function enviar(url, options) {
  const headers = { 'Accept-Language': lerIdioma(), ...options.headers }
  if (options.body) headers['Content-Type'] = 'application/json'
  const accessToken = tokenManager.getAccessToken()
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`
  return fetch(`${API_BASE_URL}${url}`, { ...options, headers })
}

async function makeRequest(url, options = {}) {
  let response
  try {
    response = await enviar(url, options)
  } catch {
    throw { status: 0, message: lerIdioma() === 'en' ? 'Could not reach the server. Check your connection.' : 'Não foi possível falar com o servidor. Verifique sua conexão.' }
  }

  if (response.status === 401 && !url.startsWith('/users/login') && tokenManager.temSessao()) {
    if (await renovarToken()) {
      response = await enviar(url, options)
    } else {
      irParaLogin()
    }
  }

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    if (response.status === 402 && data.code === 'ASSINATURA_INATIVA') {
      window.dispatchEvent(new CustomEvent('assinatura:inativa', { detail: { motivo: data.message } }))
    }
    throw { status: response.status, code: data.code, message: data.message || `HTTP ${response.status}`, data }
  }

  return data
}

export const httpClient = {
  get: (url) => makeRequest(url, { method: 'GET' }),
  post: (url, body) => makeRequest(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: (url, body) => makeRequest(url, { method: 'PATCH', body: JSON.stringify(body ?? {}) }),
  delete: (url) => makeRequest(url, { method: 'DELETE' }),
  tokenManager,
}

export default httpClient
