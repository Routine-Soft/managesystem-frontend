import { lerIdioma } from '@/i18n/idioma'

// Cliente HTTP do portal do cliente final. Sessão separada da do painel (outras chaves no navegador),
// para o programador e o cliente dele poderem usar o mesmo computador sem um derrubar o outro.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const CHAVES = { acesso: 'portalAccessToken', renovacao: 'portalRefreshToken', cliente: 'portalCliente' }

function ler(chave) {
  try {
    return localStorage.getItem(chave)
  } catch {
    return null
  }
}

export const sessaoDoPortal = {
  iniciar({ accessToken, refreshToken, contratante }) {
    localStorage.setItem(CHAVES.acesso, accessToken)
    if (refreshToken) localStorage.setItem(CHAVES.renovacao, refreshToken)
    if (contratante) localStorage.setItem(CHAVES.cliente, JSON.stringify(contratante))
  },
  encerrar() {
    Object.values(CHAVES).forEach((c) => {
      try {
        localStorage.removeItem(c)
      } catch {
        // storage indisponível
      }
    })
  },
  ativa() {
    return !!ler(CHAVES.renovacao)
  },
  cliente() {
    try {
      return JSON.parse(ler(CHAVES.cliente)) ?? null
    } catch {
      return null
    }
  },
}

let renovando = null

async function renovar() {
  const refreshToken = ler(CHAVES.renovacao)
  if (!refreshToken) return false
  if (!renovando) {
    renovando = fetch(`${API_BASE_URL}/portal/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept-Language': lerIdioma() },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (r) => {
        if (!r.ok) return false
        localStorage.setItem(CHAVES.acesso, (await r.json()).data.accessToken)
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
  const token = ler(CHAVES.acesso)
  if (token) headers.Authorization = `Bearer ${token}`
  return fetch(`${API_BASE_URL}${url}`, { ...options, headers })
}

async function requisicao(url, options = {}) {
  let response
  try {
    response = await enviar(url, options)
  } catch {
    throw { status: 0, message: lerIdioma() === 'en' ? 'Could not reach the server. Check your connection.' : 'Não foi possível falar com o servidor. Verifique sua conexão.' }
  }

  if (response.status === 401 && !url.startsWith('/portal/login')) {
    if (sessaoDoPortal.ativa() && (await renovar())) {
      response = await enviar(url, options)
    }
    if (response.status === 401) {
      sessaoDoPortal.encerrar()
      window.location.hash = '#/portal/login'
    }
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw { status: response.status, code: data.code, message: data.message || `HTTP ${response.status}`, data }
  }
  return data
}

export const portalClient = {
  get: (url) => requisicao(url, { method: 'GET' }),
  post: (url, body) => requisicao(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: (url, body) => requisicao(url, { method: 'PATCH', body: JSON.stringify(body ?? {}) }),
}

export default portalClient
