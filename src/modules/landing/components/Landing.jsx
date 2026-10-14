import { Link } from 'react-router-dom'
import { useIdioma } from '@/i18n/useIdioma'
import { formatarMoeda } from '@/i18n/formatar'
import {
    IconeAtividade, IconeMemoria, IconeAlerta, IconeAtualizar, IconeEscudo, IconeGlobo, IconeCadeado, IconeEmail,
    IconeTelegram, IconeCartao, IconeUsuarios, IconePix, IconeCheck, IconeX, IconeServidor, IconeUsuario, IconeTerminal,
} from '@/components/Icones/Icones'
import Marca from '@/components/Sidebar/Marca'
import ThemeToggle from '@/components/ThemeToggle/ThemeToggle'
import { usePlanosPublicos, useRevelarAoRolar } from '../landing.hooks'
import { ordenarPlanos, rolarPara } from '../landing.utils'
import LandingHeader from './LandingHeader'
import './landing.css'

const ICONES_DOS_RECURSOS = [IconeAtividade, IconeMemoria, IconeAlerta, IconeAtualizar, IconeEscudo, IconeGlobo, IconeCadeado, IconeEmail, IconeTelegram, IconeServidor, IconeUsuarios, IconePix]
const PROVEDORES = ['AWS', 'Hostinger', 'Hetzner', 'DigitalOcean', 'Vultr', 'Vercel', 'Railway', 'Render']

// Painel de mentira no topo: mostra em segundos o que o produto faz.
function PainelDemonstracao() {
    const { t } = useIdioma()
    const servidores = t('landing.mock.servidores')
    return (
        <div className="lp-demo" aria-hidden="true">
            <div className="lp-demo__barra"><i /><i /><i /><span>{t('landing.mock.titulo')}</span></div>
            <div className="lp-demo__corpo">
                {servidores.map((s, i) => (
                    <div key={s.nome} className="lp-demo__servidor" style={{ '--i': i }}>
                        <span className={`lp-demo__ponto lp-demo__ponto--${s.tom}`} />
                        <strong className="mono">{s.nome}</strong>
                        <span className={`lp-demo__status lp-demo__status--${s.tom}`}>{s.status}</span>
                        <span className="lp-demo__ms mono">{s.ms}</span>
                    </div>
                ))}
                <div className="lp-demo__medidores">
                    {[['ram', 62], ['cpu', 18], ['disco', 41]].map(([chave, pct]) => (
                        <div key={chave} className="lp-demo__medidor">
                            <span>{t(`landing.mock.${chave}`)}</span>
                            <div className="lp-demo__trilha"><b style={{ '--pct': `${pct}%` }} /></div>
                            <span className="mono">{pct}%</span>
                        </div>
                    ))}
                </div>
                <svg className="lp-demo__grafico" viewBox="0 0 300 70" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="lp-area" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path d="M0 55 L30 48 L60 52 L90 30 L120 38 L150 22 L180 30 L210 15 L240 26 L270 12 L300 18 L300 70 L0 70 Z" fill="url(#lp-area)" />
                    <path d="M0 55 L30 48 L60 52 L90 30 L120 38 L150 22 L180 30 L210 15 L240 26 L270 12 L300 18" fill="none" stroke="currentColor" strokeWidth="2.5" />
                </svg>
                <div className="lp-demo__alerta"><IconeTelegram /><span>{t('landing.mock.alerta')}</span></div>
            </div>
        </div>
    )
}

function Hero() {
    const { t } = useIdioma()
    return (
        <section className="lp-hero">
            <div className="lp-container lp-hero__grade">
                <div className="lp-hero__texto">
                    <span className="lp-selo">{t('landing.hero.selo')}</span>
                    <h1 className="lp-hero__titulo">{t('landing.hero.titulo')} <span className="lp-gradiente">{t('landing.hero.destaque')}</span></h1>
                    <p className="lp-hero__sub">{t('landing.hero.texto')}</p>
                    <div className="lp-hero__ctas">
                        <Link to="/registro" className="btn btn--primary lp-btn-grande">{t('landing.hero.cta')}</Link>
                        <button type="button" className="btn btn--ghost lp-btn-grande" onClick={() => rolarPara('planos')}>{t('landing.hero.ctaPlanos')}</button>
                    </div>
                    <p className="lp-hero__nota"><IconeCheck />{t('landing.hero.semCartao')}</p>
                    <p className="lp-hero__links">
                        {t('landing.hero.jaTem')} <Link className="link" to="/login">{t('landing.acessoDev.titulo')}</Link>
                        <span aria-hidden="true"> · </span>
                        <Link className="link" to="/portal/login">{t('landing.hero.souCliente')}</Link>
                    </p>
                </div>
                <PainelDemonstracao />
            </div>
            <div className="lp-container lp-provedores">
                <span>{t('landing.provedores')}</span>
                <ul>{PROVEDORES.map((p) => <li key={p}>{p}</li>)}</ul>
            </div>
        </section>
    )
}

function Dor() {
    const { t } = useIdioma()
    return (
        <section className="lp-secao">
            <div className="lp-container">
                <h2 className="lp-titulo revelar">{t('landing.dor.titulo')}</h2>
                <div className="lp-dor">
                    <div className="lp-dor__lado lp-dor__lado--antes revelar">
                        <h3>{t('landing.dor.antesTitulo')}</h3>
                        <ul>{t('landing.dor.antes').map((item) => <li key={item}><IconeX />{item}</li>)}</ul>
                    </div>
                    <div className="lp-dor__lado lp-dor__lado--depois revelar">
                        <h3>{t('landing.dor.depoisTitulo')}</h3>
                        <ul>{t('landing.dor.depois').map((item) => <li key={item}><IconeCheck />{item}</li>)}</ul>
                    </div>
                </div>
            </div>
        </section>
    )
}

function Recursos() {
    const { t } = useIdioma()
    return (
        <section id="recursos" className="lp-secao lp-secao--suave">
            <div className="lp-container">
                <h2 className="lp-titulo revelar">{t('landing.recursos.titulo')}</h2>
                <p className="lp-subtitulo revelar">{t('landing.recursos.subtitulo')}</p>
                <div className="lp-recursos">
                    {t('landing.recursos.itens').map((r, i) => {
                        const Icone = ICONES_DOS_RECURSOS[i] ?? IconeCheck
                        return (
                            <article key={r.titulo} className="card lp-recurso revelar" style={{ '--i': i % 4 }}>
                                <span className="lp-recurso__icone"><Icone /></span>
                                <h3>{r.titulo}</h3>
                                <p>{r.texto}</p>
                            </article>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

function ParaQuem() {
    const { t } = useIdioma()
    return (
        <section id="para-quem" className="lp-secao">
            <div className="lp-container">
                <h2 className="lp-titulo revelar">{t('landing.paraQuem.titulo')}</h2>
                <div className="lp-publicos">
                    <article className="card lp-publico revelar">
                        <span className="lp-publico__rotulo"><IconeServidor />{t('landing.paraQuem.dev.rotulo')}</span>
                        <h3>{t('landing.paraQuem.dev.titulo')}</h3>
                        <p>{t('landing.paraQuem.dev.texto')}</p>
                        <ul>{t('landing.paraQuem.dev.itens').map((item) => <li key={item}><IconeCheck />{item}</li>)}</ul>
                        <Link to="/registro" className="btn btn--primary">{t('landing.paraQuem.dev.cta')}</Link>
                    </article>
                    <article className="card lp-publico lp-publico--cliente revelar" style={{ '--i': 1 }}>
                        <span className="lp-publico__rotulo"><IconeUsuario />{t('landing.paraQuem.cliente.rotulo')}</span>
                        <h3>{t('landing.paraQuem.cliente.titulo')}</h3>
                        <p>{t('landing.paraQuem.cliente.texto')}</p>
                        <ul>{t('landing.paraQuem.cliente.itens').map((item) => <li key={item}><IconeCheck />{item}</li>)}</ul>
                        <div className="lp-selos-demo" aria-hidden="true">
                            <span className="portal-selo-mini">● {t('portal.indicadores.sistema.ok')}</span>
                            <span className="portal-selo-mini">● {t('portal.indicadores.seguranca.ok')}</span>
                            <span className="portal-selo-mini">● {t('portal.indicadores.pagamento.ok')}</span>
                        </div>
                        <Link to="/portal/login" className="btn btn--ghost lp-btn-cliente">{t('landing.paraQuem.cliente.cta')}</Link>
                        <small className="lp-publico__aviso">{t('landing.paraQuem.cliente.aviso')}</small>
                    </article>
                </div>
            </div>
        </section>
    )
}

function ComoFunciona() {
    const { t } = useIdioma()
    return (
        <section id="como-funciona" className="lp-secao lp-secao--suave">
            <div className="lp-container">
                <h2 className="lp-titulo revelar">{t('landing.como.titulo')}</h2>
                <ol className="lp-passos">
                    {t('landing.como.passos').map((p, i) => (
                        <li key={p.titulo} className="card lp-passo revelar" style={{ '--i': i }}>
                            <span className="lp-passo__numero">{i + 1}</span>
                            <h3>{p.titulo}</h3>
                            <p>{p.texto}</p>
                            {i === 1 && <code className="lp-passo__comando"><IconeTerminal />{t('landing.como.comando')}</code>}
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    )
}

function Planos() {
    const { t, idioma } = useIdioma()
    const { planos, cotacaoUSD, loading } = usePlanosPublicos()
    const limite = (n, um, varios, ilimitado) => (n ? t(n === 1 ? um : varios, { n }) : t(ilimitado))

    return (
        <section id="planos" className="lp-secao">
            <div className="lp-container">
                <h2 className="lp-titulo revelar">{t('landing.planos.titulo')}</h2>
                <p className="lp-subtitulo revelar">{t('landing.planos.subtitulo')}</p>
                {loading ? (
                    <p className="lp-subtitulo">{t('landing.planos.carregando')}</p>
                ) : (
                    <div className="lp-planos">
                        {ordenarPlanos(planos).map((p, i) => {
                            const gratis = p.tipo === 'gratis'
                            const emReais = !gratis && idioma === 'pt' && cotacaoUSD ? Math.round(p.precoUSD * cotacaoUSD * 100) / 100 : null
                            return (
                                <article key={p._id} className="card lp-plano" data-tipo={p.tipo} style={{ '--i': i }}>
                                    <h3 className="lp-plano__nome">{p.nome}</h3>
                                    {p.descricao && <p className="lp-plano__descricao">{p.descricao}</p>}
                                    <p className="lp-plano__preco">
                                        <strong>{gratis ? t('landing.planos.gratis') : formatarMoeda(p.precoUSD, 'USD', idioma)}</strong>
                                        <span>{gratis ? t('landing.planos.porDias', { dias: p.duracaoDiasTrial ?? 15 }) : t('landing.planos.porMes')}</span>
                                    </p>
                                    {emReais && <p className="lp-plano__reais">{t('landing.planos.emReais', { valor: formatarMoeda(emReais, 'BRL', idioma) })}</p>}
                                    <ul>
                                        <li><IconeCheck />{limite(p.limiteServidores, 'landing.planos.umServidor', 'landing.planos.servidores', 'landing.planos.servidoresIlimitados')}</li>
                                        <li><IconeCheck />{limite(p.limiteSites, 'landing.planos.umSite', 'landing.planos.sites', 'landing.planos.sitesIlimitados')}</li>
                                        {t('landing.planos.incluso').map((item) => <li key={item}><IconeCheck />{item}</li>)}
                                        {gratis && <li><IconeCheck />{t('landing.planos.semCartao')}</li>}
                                    </ul>
                                    <Link to="/registro" className={`btn ${gratis ? 'btn--ghost' : 'btn--primary'} btn--block`}>{gratis ? t('landing.planos.comecar') : t('landing.planos.assinar')}</Link>
                                </article>
                            )
                        })}
                    </div>
                )}
                <p className="lp-planos__nota revelar"><IconeCartao />{t('landing.planos.pagamento')}</p>
            </div>
        </section>
    )
}

function Duvidas() {
    const { t } = useIdioma()
    return (
        <section id="duvidas" className="lp-secao lp-secao--suave">
            <div className="lp-container lp-container--estreito">
                <h2 className="lp-titulo revelar">{t('landing.duvidas.titulo')}</h2>
                <div className="lp-duvidas">
                    {t('landing.duvidas.itens').map((d) => (
                        <details key={d.p} className="card lp-duvida revelar">
                            <summary>{d.p}</summary>
                            <p>{d.r}</p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    )
}

function ChamadaFinal() {
    const { t } = useIdioma()
    return (
        <section className="lp-secao">
            <div className="lp-container">
                <div className="lp-final revelar">
                    <h2>{t('landing.final.titulo')}</h2>
                    <p>{t('landing.final.texto')}</p>
                    <Link to="/registro" className="btn lp-final__btn lp-btn-grande">{t('landing.final.cta')}</Link>
                </div>
            </div>
        </section>
    )
}

function Rodape() {
    const { t } = useIdioma()
    return (
        <footer className="lp-rodape">
            <div className="lp-container lp-rodape__grade">
                <div className="lp-rodape__marca">
                    <Marca />
                    <p>{t('landing.rodape.texto')}</p>
                </div>
                <nav aria-label={t('landing.rodape.produto')}>
                    <h4>{t('landing.rodape.produto')}</h4>
                    {[['recursos', 'recursos'], ['comoFunciona', 'como-funciona'], ['planos', 'planos'], ['duvidas', 'duvidas']].map(([chave, id]) => (
                        <button key={id} type="button" className="lp-rodape__link" onClick={() => rolarPara(id)}>{t(`landing.menu.${chave}`)}</button>
                    ))}
                </nav>
                <nav aria-label={t('landing.rodape.acesso')}>
                    <h4>{t('landing.rodape.acesso')}</h4>
                    <Link className="lp-rodape__link" to="/registro">{t('landing.criarConta')}</Link>
                    <Link className="lp-rodape__link" to="/login">{t('landing.acessoDev.titulo')}</Link>
                    <Link className="lp-rodape__link" to="/portal/login">{t('landing.acessoCliente.titulo')}</Link>
                </nav>
            </div>
            <div className="lp-container lp-rodape__base">
                <span>© {new Date().getFullYear()} ServerFall. {t('landing.rodape.direitos')}</span>
                <ThemeToggle />
            </div>
        </footer>
    )
}

// Página inicial pública (landing page): o que é, para quem, recursos, planos e as duas portas de entrada.
export function Landing() {
    useRevelarAoRolar()
    return (
        <div className="lp">
            <div className="lp__fundo" aria-hidden="true" />
            <LandingHeader />
            <main>
                <Hero />
                <Dor />
                <Recursos />
                <ParaQuem />
                <ComoFunciona />
                <Planos />
                <Duvidas />
                <ChamadaFinal />
            </main>
            <Rodape />
        </div>
    )
}

export default Landing
