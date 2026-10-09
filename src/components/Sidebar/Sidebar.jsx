import { Link, NavLink } from 'react-router-dom'
import { useAuthContext } from '@/hooks/useAuthContext'
import { useIdioma } from '@/i18n/useIdioma'
import ThemeToggle from '@/components/ThemeToggle/ThemeToggle'
import IdiomaToggle from '@/components/IdiomaToggle/IdiomaToggle'
import { atualizarMe } from '@/modules/user/user.api'
import * as I from '@/components/Icones/Icones'
import Marca from './Marca'
import './Sidebar.css'

const TODOS = ['super_admin', 'admin', 'membro']

const GRUPOS = [
    {
        titulo: 'comum.menu.principal',
        itens: [
            { label: 'comum.menu.visaoGeral', path: '/inicio', Icone: I.IconePainel, papeis: TODOS },
            { label: 'comum.menu.sites', path: '/sites', Icone: I.IconeGlobo, papeis: TODOS },
            { label: 'comum.menu.contratantes', path: '/contratantes', Icone: I.IconeUsuarios, papeis: TODOS },
            { label: 'comum.menu.alertas', path: '/alertas', Icone: I.IconeSino, papeis: TODOS },
        ],
    },
    {
        titulo: 'comum.menu.superAdmin',
        itens: [
            { label: 'comum.menu.clientes', path: '/clientes', Icone: I.IconeEmpresa, papeis: ['super_admin'] },
            { label: 'comum.menu.planos', path: '/planos', Icone: I.IconeEtiqueta, papeis: ['super_admin'] },
        ],
    },
    {
        titulo: 'comum.menu.conta',
        itens: [
            { label: 'comum.menu.assinatura', path: '/assinatura', Icone: I.IconeCartao, papeis: ['admin'] },
            { label: 'comum.menu.equipe', path: '/equipe', Icone: I.IconeUsuarios, papeis: ['admin', 'membro'] },
            { label: 'comum.menu.minhaConta', path: '/minha-conta', Icone: I.IconeUsuario, papeis: TODOS },
        ],
    },
]

function iniciais(nome) {
    return String(nome ?? '').split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('')
}

export function Sidebar({ aberto = false, onFechar }) {
    const { user, hasRole, logout, atualizarUsuarioLogado } = useAuthContext()
    const { t } = useIdioma()

    const grupos = GRUPOS
        .map((g) => ({ ...g, itens: g.itens.filter((item) => hasRole(...item.papeis)) }))
        .filter((g) => g.itens.length > 0)

    // O idioma fica salvo na conta: é nele que chegam os alertas do Telegram.
    function salvarIdioma(idioma) {
        atualizarMe({ idioma }).then(() => atualizarUsuarioLogado({ idioma })).catch(() => null)
    }

    return (
        <aside id="menu-principal" className={`sidebar${aberto ? ' is-aberto' : ''}`} aria-label={t('comum.menu.principal')}>
            <div className="sidebar__topo">
                <Link to="/inicio" className="marca-link" aria-label={t('comum.irInicio')} onClick={onFechar}>
                    <Marca empresa={user?.nomeEmpresa} />
                </Link>
                <button type="button" className="icon-btn sidebar__fechar" aria-label={t('comum.fecharMenu')} onClick={onFechar}>
                    <I.IconeX />
                </button>
            </div>

            <nav className="sidebar__nav">
                {grupos.map((grupo) => (
                    <div className="sidebar__grupo" key={grupo.titulo}>
                        <span className="sidebar__titulo">{t(grupo.titulo)}</span>
                        <ul>
                            {grupo.itens.map(({ label, path, Icone }) => (
                                <li key={path}>
                                    <NavLink to={path} className="sidebar__link" onClick={onFechar}>
                                        <Icone />
                                        <span>{t(label)}</span>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>

            <div className="sidebar__rodape">
                <div className="sidebar__usuario">
                    <span className="sidebar__avatar" aria-hidden="true">{iniciais(user?.nomeCompleto)}</span>
                    <span className="sidebar__usuario-dados">
                        <strong>{user?.nomeCompleto}</strong>
                        <span>{t(`comum.papel.${user?.role}`)}</span>
                    </span>
                </div>

                <div className="sidebar__preferencias">
                    <ThemeToggle />
                    <IdiomaToggle onTrocar={salvarIdioma} />
                </div>
                <button type="button" className="btn btn--ghost btn--sm btn--block" onClick={logout}>
                    <I.IconeSair />
                    {t('comum.sair')}
                </button>
            </div>
        </aside>
    )
}

export default Sidebar
