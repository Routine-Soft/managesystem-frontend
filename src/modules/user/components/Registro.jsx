import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/hooks/useAuthContext'
import { useIdioma } from '@/i18n/useIdioma'
import SeletorPais from '@/components/SeletorPais/SeletorPais'
import { adivinharPais } from '@/i18n/paises'
import AuthLayout from './AuthLayout'
import CampoSenha from '@/components/CampoSenha/CampoSenha'

const VAZIO = { nomeCompleto: '', nomeEmpresa: '', email: '', telefone: '', password: '' }

export function Registro() {
    const { registrar, isAuthenticated } = useAuthContext()
    const { t } = useIdioma()
    const navigate = useNavigate()
    const [form, setForm] = useState(() => ({ ...VAZIO, pais: adivinharPais() }))
    const [enviando, setEnviando] = useState(false)
    const [erro, setErro] = useState(null)

    if (isAuthenticated) return <Navigate to="/inicio" replace />

    const campo = (nome) => ({ value: form[nome], onChange: (e) => setForm({ ...form, [nome]: e.target.value }) })

    async function criar(e) {
        e.preventDefault()
        setErro(null)
        setEnviando(true)
        try {
            await registrar(form)
            navigate('/inicio', { replace: true })
        } catch (err) {
            setErro(err)
            setEnviando(false)
        }
    }

    return (
        <AuthLayout wide>
            <h1 className="auth-title">{t('auth.tituloRegistro')}</h1>
            <p className="auth-subtitle">{t('auth.subtituloRegistro')}</p>

            <form className="auth-form auth-form--grid" onSubmit={criar}>
                {erro && <p className="alert alert--error" role="alert">{erro.message}</p>}
                <div className="field">
                    <label className="field__label" htmlFor="reg-nome">{t('auth.seuNome')}</label>
                    <input id="reg-nome" className="input" autoComplete="name" required autoFocus {...campo('nomeCompleto')} />
                </div>
                <div className="field">
                    <label className="field__label" htmlFor="reg-empresa">{t('auth.empresa')}</label>
                    <input id="reg-empresa" className="input" autoComplete="organization" required {...campo('nomeEmpresa')} />
                </div>
                <div className="field">
                    <label className="field__label" htmlFor="reg-email">{t('auth.email')}</label>
                    <input id="reg-email" className="input" type="email" autoComplete="email" required {...campo('email')} />
                </div>
                <div className="field">
                    <label className="field__label" htmlFor="reg-telefone">{t('auth.telefone')} <small>({t('comum.opcional')})</small></label>
                    <input id="reg-telefone" className="input" type="tel" autoComplete="tel" {...campo('telefone')} />
                </div>
                <div className="field">
                    <label className="field__label" htmlFor="reg-pais">{t('auth.pais')}</label>
                    <SeletorPais id="reg-pais" value={form.pais} onChange={(pais) => setForm({ ...form, pais })} required />
                    <span className="field__hint">{t('auth.paisDica')}</span>
                </div>
                <div className="field">
                    <label className="field__label" htmlFor="reg-senha">{t('auth.senha')}</label>
                    <CampoSenha id="reg-senha" className="input" autoComplete="new-password" minLength={6} required {...campo('password')} />
                    <span className="field__hint">{t('auth.senhaDica')}</span>
                </div>
                <button type="submit" className={`btn btn--primary btn--block${enviando ? ' btn--loading' : ''}`} disabled={enviando}>
                    {enviando ? t('auth.criando') : t('auth.criarConta')}
                </button>
            </form>

            <p className="auth-footer">
                {t('auth.jaTemConta')} <Link className="link" to="/login">{t('auth.entrar')}</Link>
            </p>
        </AuthLayout>
    )
}

export default Registro
