import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useIdioma } from '@/i18n/useIdioma'
import { sessaoDoPortal } from '@/services/portalClient'
import AuthLayout from '@/modules/user/components/AuthLayout'
import { entrar } from '../portal.api'
import { useEntrarNoPortal } from '../portal.hooks'
import CampoSenha from '@/components/CampoSenha/CampoSenha'

export function PortalLogin() {
    const { t } = useIdioma()
    const entrarNoPortal = useEntrarNoPortal()
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [enviando, setEnviando] = useState(false)
    const [erro, setErro] = useState(null)

    if (sessaoDoPortal.ativa()) return <Navigate to="/portal" replace />

    async function enviar(e) {
        e.preventDefault()
        setErro(null)
        setEnviando(true)
        try {
            const { data } = await entrar(email, senha)
            entrarNoPortal(data)
        } catch (err) {
            setErro(err)
            setEnviando(false)
        }
    }

    return (
        <AuthLayout>
            <h1 className="auth-title">{t('portal.login.titulo')}</h1>
            <p className="auth-subtitle">{t('portal.login.subtitulo')}</p>

            <form className="auth-form" onSubmit={enviar}>
                {erro && <p className="alert alert--error" role="alert">{erro.message}</p>}
                <div className="field">
                    <label className="field__label" htmlFor="pl-email">{t('auth.email')}</label>
                    <input id="pl-email" className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
                </div>
                <div className="field">
                    <label className="field__label" htmlFor="pl-senha">{t('auth.senha')}</label>
                    <CampoSenha id="pl-senha" className="input" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
                </div>
                <button type="submit" className={`btn btn--primary btn--block${enviando ? ' btn--loading' : ''}`} disabled={enviando}>
                    {enviando ? t('auth.entrando') : t('auth.entrar')}
                </button>
            </form>

            <p className="auth-footer">{t('portal.login.esqueceu')}</p>
            <p className="auth-footer auth-footer--outro">
                {t('portal.login.ehDev')} <Link className="link" to="/login">{t('portal.login.irPainel')}</Link>
            </p>
        </AuthLayout>
    )
}

export default PortalLogin
