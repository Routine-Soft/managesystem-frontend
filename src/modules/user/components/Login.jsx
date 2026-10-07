import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/hooks/useAuthContext'
import { useIdioma } from '@/i18n/useIdioma'
import { IconeCheck } from '@/components/Icones/Icones'
import AuthLayout from './AuthLayout'

export function Login() {
    const { login, isAuthenticated } = useAuthContext()
    const { t } = useIdioma()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [enviando, setEnviando] = useState(false)
    const [erro, setErro] = useState(null)

    if (isAuthenticated) return <Navigate to="/inicio" replace />

    async function entrar(e) {
        e.preventDefault()
        setErro(null)
        setEnviando(true)
        try {
            const user = await login(email, senha)
            navigate(user.role === 'super_admin' ? '/clientes' : '/inicio', { replace: true })
        } catch (err) {
            setErro(err)
            setEnviando(false)
        }
    }

    return (
        <AuthLayout>
            <h1 className="auth-title">{t('auth.tituloLogin')}</h1>
            <p className="auth-subtitle">{t('auth.slogan')}</p>
            <ul className="auth-destaques">
                {t('auth.destaques').map((d) => <li key={d}><IconeCheck />{d}</li>)}
            </ul>

            <form className="auth-form" onSubmit={entrar}>
                {erro && <p className="alert alert--error" role="alert">{erro.message}</p>}
                <div className="field">
                    <label className="field__label" htmlFor="login-email">{t('auth.email')}</label>
                    <input id="login-email" className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
                </div>
                <div className="field">
                    <label className="field__label" htmlFor="login-senha">{t('auth.senha')}</label>
                    <input id="login-senha" className="input" type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
                </div>
                <button type="submit" className={`btn btn--primary btn--block${enviando ? ' btn--loading' : ''}`} disabled={enviando}>
                    {enviando ? t('auth.entrando') : t('auth.entrar')}
                </button>
            </form>

            <p className="auth-footer">
                {t('auth.semConta')} <Link className="link" to="/registro">{t('auth.criarConta')}</Link>
            </p>
        </AuthLayout>
    )
}

export default Login
