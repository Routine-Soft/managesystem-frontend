import { useEffect, useState } from 'react'
import httpClient from '@/services/httpClient'
import { useIdioma } from '@/i18n/useIdioma'
import * as userApi from '@/modules/user/user.api'

const CURRENT_USER_KEY = 'currentUser'

function lerUsuario() {
    try {
        return JSON.parse(localStorage.getItem(CURRENT_USER_KEY)) ?? null
    } catch {
        return null
    }
}

export function useAuth() {
    const { idioma, setIdioma } = useIdioma()
    const [user, setUser] = useState(() => (httpClient.tokenManager.temSessao() ? lerUsuario() : null))

    // O httpClient avisa quando a sessão venceu de vez (não deu para renovar): a tela desloga.
    useEffect(() => {
        const deslogar = () => setUser(null)
        window.addEventListener('sessao:expirada', deslogar)
        return () => window.removeEventListener('sessao:expirada', deslogar)
    }, [])

    function iniciarSessao({ accessToken, refreshToken, user: logado }) {
        httpClient.tokenManager.setTokens(accessToken, refreshToken)
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(logado))
        setUser(logado)
        // O idioma salvo na conta vale em qualquer computador.
        if (logado.idioma && logado.idioma !== idioma) setIdioma(logado.idioma)
        return logado
    }

    async function login(email, password) {
        const resposta = await userApi.login({ email, password })
        return iniciarSessao(resposta.data)
    }

    async function registrar(dados) {
        const resposta = await userApi.registrar({ ...dados, idioma })
        return iniciarSessao(resposta.data)
    }

    async function logout() {
        await userApi.logout().catch(() => null)
        httpClient.tokenManager.clearTokens()
        setUser(null)
    }

    function atualizarUsuarioLogado(dados) {
        const atualizado = { ...user, ...dados }
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(atualizado))
        setUser(atualizado)
    }

    function hasRole(...papeis) {
        return papeis.includes(user?.role)
    }

    return { user, isAuthenticated: !!user, login, registrar, logout, hasRole, atualizarUsuarioLogado }
}

export default useAuth
