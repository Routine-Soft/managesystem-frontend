import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useIdioma } from '@/i18n/useIdioma'
import { useAuthContext } from '@/hooks/useAuthContext'
import ThemeToggle from '@/components/ThemeToggle/ThemeToggle'
import IdiomaToggle from '@/components/IdiomaToggle/IdiomaToggle'
import Marca from '@/components/Sidebar/Marca'
import { IconeServidor, IconeUsuario, IconeX } from '@/components/Icones/Icones'
import { rolarPara } from '../landing.utils'

const SECOES = ['recursos', 'paraQuem', 'comoFunciona', 'planos', 'duvidas']
const ID_DA_SECAO = { recursos: 'recursos', paraQuem: 'para-quem', comoFunciona: 'como-funciona', planos: 'planos', duvidas: 'duvidas' }

// Duas portas de entrada bem separadas: o painel do desenvolvedor e o portal do cliente final.
function EscolhaDeAcesso({ onEscolher }) {
    const { t } = useIdioma()
    return (
        <div className="lp-acesso" role="menu" aria-label={t('landing.escolhaAcesso')}>
            <p className="lp-acesso__titulo">{t('landing.escolhaAcesso')}</p>
            <Link to="/login" className="lp-acesso__opcao" role="menuitem" onClick={onEscolher}>
                <span className="lp-acesso__icone"><IconeServidor /></span>
                <span><strong>{t('landing.acessoDev.titulo')}</strong><small>{t('landing.acessoDev.texto')}</small></span>
            </Link>
            <Link to="/portal/login" className="lp-acesso__opcao lp-acesso__opcao--cliente" role="menuitem" onClick={onEscolher}>
                <span className="lp-acesso__icone"><IconeUsuario /></span>
                <span><strong>{t('landing.acessoCliente.titulo')}</strong><small>{t('landing.acessoCliente.texto')}</small></span>
            </Link>
        </div>
    )
}

export function LandingHeader() {
    const { t } = useIdioma()
    const { isAuthenticated } = useAuthContext()
    const [menuAberto, setMenuAberto] = useState(false)
    const [acessoAberto, setAcessoAberto] = useState(false)
    const [rolou, setRolou] = useState(() => window.scrollY > 8)
    const acessoRef = useRef(null)

    useEffect(() => {
        const aoRolar = () => setRolou(window.scrollY > 8)
        window.addEventListener('scroll', aoRolar, { passive: true })
        return () => window.removeEventListener('scroll', aoRolar)
    }, [])

    // Fecha a escolha de acesso ao clicar fora ou apertar Esc.
    useEffect(() => {
        if (!acessoAberto) return undefined
        const fora = (e) => { if (!acessoRef.current?.contains(e.target)) setAcessoAberto(false) }
        const esc = (e) => { if (e.key === 'Escape') setAcessoAberto(false) }
        document.addEventListener('mousedown', fora)
        document.addEventListener('keydown', esc)
        return () => {
            document.removeEventListener('mousedown', fora)
            document.removeEventListener('keydown', esc)
        }
    }, [acessoAberto])

    function irPara(secao) {
        setMenuAberto(false)
        rolarPara(ID_DA_SECAO[secao])
    }

    return (
        <header className={`lp-header${rolou ? ' is-rolado' : ''}`}>
            <div className="lp-container lp-header__linha">
                <Link to="/" className="marca-link" aria-label="ServerFall"><Marca /></Link>

                <nav className="lp-nav" aria-label={t('comum.menu.principal')}>
                    {SECOES.map((s) => <button key={s} type="button" className="lp-nav__link" onClick={() => irPara(s)}>{t(`landing.menu.${s}`)}</button>)}
                </nav>

                <div className="lp-header__acoes">
                    <span className="lp-header__toggles"><IdiomaToggle /></span>
                    {isAuthenticated ? (
                        <Link to="/inicio" className="btn btn--primary btn--sm">{t('landing.irPainel')}</Link>
                    ) : (
                        <>
                            <div className="lp-header__entrar" ref={acessoRef}>
                                <button type="button" className="btn btn--ghost btn--sm" aria-haspopup="menu" aria-expanded={acessoAberto} onClick={() => setAcessoAberto((v) => !v)}>
                                    {t('landing.entrar')}
                                    <svg className="lp-seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                                </button>
                                {acessoAberto && <EscolhaDeAcesso onEscolher={() => setAcessoAberto(false)} />}
                            </div>
                            <Link to="/registro" className="btn btn--primary btn--sm lp-header__criar">{t('landing.criarConta')}</Link>
                        </>
                    )}
                    <button type="button" className="icon-btn lp-header__menu" aria-label={menuAberto ? t('landing.menu.fechar') : t('landing.menu.abrir')} aria-expanded={menuAberto} onClick={() => setMenuAberto((v) => !v)}>
                        {menuAberto ? <IconeX /> : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
                        )}
                    </button>
                </div>
            </div>

            {menuAberto && (
                <div className="lp-menu-celular">
                    {SECOES.map((s) => <button key={s} type="button" className="lp-menu-celular__link" onClick={() => irPara(s)}>{t(`landing.menu.${s}`)}</button>)}
                    <div className="lp-menu-celular__toggles"><IdiomaToggle /><ThemeToggle /></div>
                    {isAuthenticated ? (
                        <Link to="/inicio" className="btn btn--primary btn--block">{t('landing.irPainel')}</Link>
                    ) : (
                        <>
                            <Link to="/registro" className="btn btn--primary btn--block">{t('landing.criarConta')}</Link>
                            <EscolhaDeAcesso onEscolher={() => setMenuAberto(false)} />
                        </>
                    )}
                </div>
            )}
        </header>
    )
}

export default LandingHeader
