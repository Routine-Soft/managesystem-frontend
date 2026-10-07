import { useState } from 'react'
import { useAuthContext } from '@/hooks/useAuthContext'
import { useIdioma } from '@/i18n/useIdioma'
import IdiomaToggle from '@/components/IdiomaToggle/IdiomaToggle'
import { atualizarMe, alterarMinhaSenha } from '../user.api'

function Mensagem({ msg }) {
    if (!msg) return null
    return <p className={`alert alert--${msg.tipo}`} role={msg.tipo === 'error' ? 'alert' : 'status'}>{msg.texto}</p>
}

export function MinhaConta() {
    const { user, atualizarUsuarioLogado } = useAuthContext()
    const { t } = useIdioma()
    const [form, setForm] = useState({ nomeCompleto: user?.nomeCompleto ?? '', email: user?.email ?? '', telefone: user?.telefone ?? '', nomeEmpresa: user?.nomeEmpresa ?? '' })
    const [senha, setSenha] = useState({ currentPassword: '', newPassword: '' })
    const [salvando, setSalvando] = useState(null)
    const [msgDados, setMsgDados] = useState(null)
    const [msgSenha, setMsgSenha] = useState(null)
    const ehAdmin = ['admin', 'super_admin'].includes(user?.role)

    async function salvarDados(e) {
        e.preventDefault()
        setMsgDados(null)
        setSalvando('dados')
        try {
            const r = await atualizarMe(ehAdmin ? form : { ...form, nomeEmpresa: undefined })
            atualizarUsuarioLogado(r.data)
            setMsgDados({ tipo: 'success', texto: r.message })
        } catch (err) {
            setMsgDados({ tipo: 'error', texto: err.message })
        } finally {
            setSalvando(null)
        }
    }

    async function salvarSenha(e) {
        e.preventDefault()
        setMsgSenha(null)
        setSalvando('senha')
        try {
            const r = await alterarMinhaSenha(senha)
            setSenha({ currentPassword: '', newPassword: '' })
            setMsgSenha({ tipo: 'success', texto: r.message })
        } catch (err) {
            setMsgSenha({ tipo: 'error', texto: err.message })
        } finally {
            setSalvando(null)
        }
    }

    function trocarIdioma(idioma) {
        atualizarMe({ idioma }).then(() => atualizarUsuarioLogado({ idioma })).catch(() => null)
    }

    const campo = (nome) => ({ value: form[nome], onChange: (e) => setForm({ ...form, [nome]: e.target.value }) })

    return (
        <div className="page page--narrow">
            <header className="page-header">
                <div>
                    <h1 className="page-title">{t('conta.minhaConta')}</h1>
                    <p className="page-subtitle">{t('conta.minhaContaSub')}</p>
                </div>
            </header>

            <form className="card bloco" style={{ '--i': 0 }} onSubmit={salvarDados}>
                <div className="bloco__cabecalho"><h2 className="bloco__titulo">{t('conta.dados')}</h2></div>
                <div className="form-grid">
                    <div className="field"><label className="field__label" htmlFor="mc-nome">{t('conta.nome')}</label><input id="mc-nome" className="input" required {...campo('nomeCompleto')} /></div>
                    <div className="field"><label className="field__label" htmlFor="mc-email">{t('conta.email')}</label><input id="mc-email" className="input" type="email" required {...campo('email')} /></div>
                    <div className="field"><label className="field__label" htmlFor="mc-tel">{t('conta.telefone')}</label><input id="mc-tel" className="input" type="tel" {...campo('telefone')} /></div>
                    {ehAdmin && <div className="field"><label className="field__label" htmlFor="mc-emp">{t('conta.empresa')}</label><input id="mc-emp" className="input" required {...campo('nomeEmpresa')} /></div>}
                    <div className="field field--full">
                        <span className="field__label">{t('conta.idioma')}</span>
                        <div><IdiomaToggle onTrocar={trocarIdioma} /></div>
                    </div>
                </div>
                <Mensagem msg={msgDados} />
                <div className="form-actions">
                    <button type="submit" className={`btn btn--primary${salvando === 'dados' ? ' btn--loading' : ''}`} disabled={!!salvando}>
                        {salvando === 'dados' ? t('comum.salvando') : t('comum.salvarAlteracoes')}
                    </button>
                </div>
            </form>

            <form className="card bloco" style={{ '--i': 1, marginTop: 16 }} onSubmit={salvarSenha}>
                <div className="bloco__cabecalho"><h2 className="bloco__titulo">{t('conta.senha')}</h2></div>
                <div className="form-grid">
                    <div className="field"><label className="field__label" htmlFor="mc-atual">{t('conta.senhaAtual')}</label><input id="mc-atual" className="input" type="password" autoComplete="current-password" required value={senha.currentPassword} onChange={(e) => setSenha({ ...senha, currentPassword: e.target.value })} /></div>
                    <div className="field"><label className="field__label" htmlFor="mc-nova">{t('conta.novaSenha')}</label><input id="mc-nova" className="input" type="password" autoComplete="new-password" minLength={6} required value={senha.newPassword} onChange={(e) => setSenha({ ...senha, newPassword: e.target.value })} /><span className="field__hint">{t('auth.senhaDica')}</span></div>
                </div>
                <Mensagem msg={msgSenha} />
                <div className="form-actions">
                    <button type="submit" className={`btn btn--primary${salvando === 'senha' ? ' btn--loading' : ''}`} disabled={!!salvando}>
                        {salvando === 'senha' ? t('comum.salvando') : t('conta.alterarSenha')}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default MinhaConta
