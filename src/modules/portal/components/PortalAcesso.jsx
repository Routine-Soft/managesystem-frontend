import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useIdioma } from '@/i18n/useIdioma'
import AuthLayout from '@/modules/user/components/AuthLayout'
import { criarSenha, dadosDoLink } from '../portal.api'
import { useEntrarNoPortal } from '../portal.hooks'

// Link que o programador mandou: o cliente cria (ou troca) a senha e já entra no portal.
export function PortalAcesso() {
    const { token } = useParams()
    const { t, setIdioma } = useIdioma()
    const entrarNoPortal = useEntrarNoPortal()
    const [dados, setDados] = useState(null)
    const [erroLink, setErroLink] = useState(null)
    const [senha, setSenha] = useState('')
    const [confirmacao, setConfirmacao] = useState('')
    const [enviando, setEnviando] = useState(false)
    const [erro, setErro] = useState(null)

    useEffect(() => {
        let ignore = false
        Promise.resolve()
            .then(() => dadosDoLink(token))
            .then((r) => {
                if (ignore) return
                setDados(r.data)
                if (r.data.idioma) setIdioma(r.data.idioma)
            })
            .catch((e) => {
                if (!ignore) setErroLink(e)
            })
        return () => {
            ignore = true
        }
    }, [token, setIdioma])

    const diferentes = confirmacao && senha !== confirmacao

    async function enviar(e) {
        e.preventDefault()
        if (diferentes) return
        setErro(null)
        setEnviando(true)
        try {
            const { data } = await criarSenha(token, senha)
            entrarNoPortal(data)
        } catch (err) {
            setErro(err)
            setEnviando(false)
        }
    }

    if (erroLink) {
        return (
            <AuthLayout>
                <h1 className="auth-title">{t('portal.acesso.linkInvalido')}</h1>
                <p className="alert alert--warning">{erroLink.message}</p>
                <p className="auth-footer"><Link className="link" to="/portal/login">{t('portal.acesso.irParaLogin')}</Link></p>
            </AuthLayout>
        )
    }

    if (!dados) {
        return (
            <AuthLayout>
                <div aria-busy="true"><div className="skeleton skeleton--line" style={{ width: '60%' }} /><div className="skeleton skeleton--line" /></div>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout>
            <h1 className="auth-title">{t('portal.acesso.ola', { nome: dados.nome })}</h1>
            <p className="auth-subtitle">{dados.temSenha ? t('portal.acesso.trocar') : t('portal.acesso.criar', { empresa: dados.empresa })}</p>

            <form className="auth-form" onSubmit={enviar}>
                {erro && <p className="alert alert--error" role="alert">{erro.message}</p>}
                <div className="field">
                    <label className="field__label" htmlFor="pa-email">{t('auth.email')}</label>
                    <input id="pa-email" className="input" type="email" autoComplete="username" value={dados.email} readOnly />
                </div>
                <div className="field">
                    <label className="field__label" htmlFor="pa-senha">{t('portal.acesso.novaSenha')}</label>
                    <input id="pa-senha" className="input" type="password" autoComplete="new-password" minLength={6} value={senha} onChange={(e) => setSenha(e.target.value)} required autoFocus />
                    <span className="field__hint">{t('auth.senhaDica')}</span>
                </div>
                <div className="field">
                    <label className="field__label" htmlFor="pa-conf">{t('portal.acesso.confirmar')}</label>
                    <input id="pa-conf" className="input" type="password" autoComplete="new-password" value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} required aria-invalid={diferentes || undefined} />
                    {diferentes && <span className="field__hint field__hint--erro">{t('portal.acesso.diferentes')}</span>}
                </div>
                <button type="submit" className={`btn btn--primary btn--block${enviando ? ' btn--loading' : ''}`} disabled={enviando || diferentes}>
                    {enviando ? t('comum.salvando') : t('portal.acesso.entrar')}
                </button>
            </form>
        </AuthLayout>
    )
}

export default PortalAcesso
