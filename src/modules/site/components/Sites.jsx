import { useState } from 'react'
import { useIdioma } from '@/i18n/useIdioma'
import { diasAte, formatarData, formatarMoeda, formatarNumero, formatarRelativo } from '@/i18n/formatar'
import EmptyState from '@/components/EmptyState/EmptyState'
import ExcluirInline from '@/components/ExcluirInline/ExcluirInline'
import Medidor from '@/components/graficos/Medidor'
import { IconeAtualizar, IconeCadeado, IconeEmail, IconeGlobo, IconeLapis, IconeMais } from '@/components/Icones/Icones'
import { tomDosDias } from '@/modules/servidor/servidor.utils'
import { useSites } from '../site.hooks'
import { vencimentoDoDominio } from '../site.utils'
import SiteModal from './SiteModal'
import './site.css'

function SeloDias({ data }) {
    const { t } = useIdioma()
    const dias = diasAte(data)
    if (dias === null) return null
    return <span className={`badge badge--${tomDosDias(dias)}`}>{dias <= 0 ? t('site.vencido') : t('site.faltam', { dias })}</span>
}

function SiteCard({ site, servidores, indice, onEditar, onRemover, onVerificar }) {
    const { t, idioma } = useIdioma()
    const [verificando, setVerificando] = useState(false)
    const venc = vencimentoDoDominio(site)
    const servidor = servidores.find((s) => s._id === site.servidorId)
    const caixas = site.emails?.caixas ?? []
    const provedor = site.emails?.provedor || site.emails?.provedorDetectado

    async function verificar() {
        setVerificando(true)
        await onVerificar(site._id).catch(() => null)
        setVerificando(false)
    }

    return (
        <article className="card site-card" style={{ '--i': indice }}>
            <header className="site-card__topo">
                <div className="site-card__nome">
                    <span className="tipo-card">{t('comum.tipoDominio')}</span>
                    <strong className="mono">{site.dominio}</strong>
                    {servidor && <span className="texto-pequeno">{t('site.servidorLigado', { nome: servidor.nome })}</span>}
                </div>
                <div className="site-card__acoes">
                    <button type="button" className="icon-btn" aria-label={t('site.verificar')} title={verificando ? t('site.verificando') : t('site.verificar')} disabled={verificando} onClick={verificar}>
                        <span className={verificando ? 'gira' : undefined}><IconeAtualizar /></span>
                    </button>
                    <button type="button" className="icon-btn" aria-label={t('comum.editar')} title={t('comum.editar')} onClick={() => onEditar(site)}><IconeLapis /></button>
                    <ExcluirInline onConfirmar={() => onRemover(site._id)} />
                </div>
            </header>

            <section className="site-card__secao">
                <h3><IconeGlobo />{t('site.dominio')}</h3>
                <div className="site-card__linha">
                    <span>{venc.data ? t('site.expiraEm', { data: formatarData(venc.data, idioma) }) : t('site.semData')}</span>
                    <SeloDias data={venc.data} />
                </div>
                <p className="texto-pequeno">
                    {[
                        site.registro?.criadoEm || site.manual?.criadoEm ? t('site.registradoEm', { data: formatarData(site.manual?.criadoEm ?? site.registro.criadoEm, idioma) }) : null,
                        site.manual?.registrador || site.registro?.registrador ? t('site.registrador', { nome: site.manual?.registrador || site.registro.registrador }) : null,
                        site.manual?.valorRenovacao ? t('site.renovacao', { valor: formatarMoeda(site.manual.valorRenovacao, site.manual.moeda, idioma) }) : null,
                        site.manual?.renovacaoAutomatica ? t('site.renovacaoAuto') : null,
                        venc.fonte ? t(venc.fonte === 'manual' ? 'site.fonteManual' : 'site.fonteRdap') : null,
                    ].filter(Boolean).join(' · ')}
                </p>
                {site.registro?.erro && !venc.data && <p className="texto-pequeno site-card__erro">{t('site.erroRdap', { erro: site.registro.erro })}</p>}
            </section>

            <section className="site-card__secao">
                <h3><IconeCadeado />{t('site.ssl')}</h3>
                {site.ssl?.expiraEm ? (
                    <div className="site-card__linha">
                        <span>{t('site.sslAte', { data: formatarData(site.ssl.expiraEm, idioma), emissor: site.ssl.emissor ?? '' })}</span>
                        <SeloDias data={site.ssl.expiraEm} />
                    </div>
                ) : (
                    <p className="texto-pequeno site-card__erro">{site.ssl?.erro ? t('site.sslErro', { erro: site.ssl.erro }) : '—'}</p>
                )}
            </section>

            <section className="site-card__secao">
                <h3><IconeEmail />{t('site.emails')}</h3>
                <div className="site-card__linha">
                    <span>{provedor ? t(site.emails?.provedor ? 'site.provedor' : 'site.provedorDetectado', { nome: provedor }) : '—'}</span>
                    {caixas.length > 0 && <span className="badge badge--info">{t('site.caixas', { n: caixas.length })}</span>}
                </div>
                {site.emails?.vencimento && (
                    <div className="site-card__linha">
                        <span className="texto-pequeno">
                            {t('site.emailVence', { data: formatarData(site.emails.vencimento, idioma) })}
                            {site.emails.valor ? ` · ${formatarMoeda(site.emails.valor, site.emails.moeda, idioma)}` : ''}
                        </span>
                        <SeloDias data={site.emails.vencimento} />
                    </div>
                )}
                {caixas.length > 0 && (
                    <ul className="caixas-uso">
                        {caixas.map((c) => {
                            const pct = c.cotaGB ? ((c.usadoGB ?? 0) / c.cotaGB) * 100 : null
                            return (
                                <li key={c.endereco}>
                                    <span className="caixas-uso__email">{c.endereco}</span>
                                    {pct !== null ? (
                                        <>
                                            <Medidor pct={pct} tom={pct >= 90 ? 'danger' : pct >= 75 ? 'warning' : 'info'} rotulo={c.endereco} />
                                            <span className="texto-pequeno mono">{t('site.uso', { usado: formatarNumero(c.usadoGB ?? 0, idioma, 1), cota: formatarNumero(c.cotaGB, idioma, 0) })}</span>
                                        </>
                                    ) : <span />}
                                </li>
                            )
                        })}
                    </ul>
                )}
            </section>

            {site.registro?.verificadoEm && <p className="texto-pequeno site-card__rodape">{t('site.consultadoEm', { quando: formatarRelativo(site.registro.verificadoEm, idioma) })}</p>}
        </article>
    )
}

export function Sites() {
    const { t } = useIdioma()
    const { sites, servidores, loading, erro, substituir, remover, verificar } = useSites()
    const [modal, setModal] = useState(null)
    const [erroAcao, setErroAcao] = useState(null)

    async function excluir(id) {
        setErroAcao(null)
        try {
            await remover(id)
            return true
        } catch (e) {
            setErroAcao(e)
            return false
        }
    }

    return (
        <div className="page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">{t('site.titulo')}</h1>
                    <p className="page-subtitle">{t('site.subtitulo')}</p>
                </div>
                <div className="page-header__acoes">
                    <button type="button" className="btn btn--primary" onClick={() => setModal({})}><IconeMais />{t('site.adicionar')}</button>
                </div>
            </header>

            {(erro || erroAcao) && <p className="alert alert--error" role="alert">{(erroAcao ?? erro).message}</p>}

            {loading ? (
                <div className="sites-grade" aria-busy="true">
                    {[0, 1].map((i) => <div key={i} className="card site-card"><div className="skeleton skeleton--line" style={{ width: '50%' }} /><div className="skeleton skeleton--line" /><div className="skeleton skeleton--line" /><div className="skeleton skeleton--line" style={{ width: '70%' }} /></div>)}
                </div>
            ) : sites.length === 0 ? (
                <div className="card">
                    <EmptyState icone={<IconeGlobo />} titulo={t('site.nenhum')} texto={t('site.nenhumTexto')}>
                        <button type="button" className="btn btn--primary" onClick={() => setModal({})}><IconeMais />{t('site.adicionar')}</button>
                    </EmptyState>
                </div>
            ) : (
                <div className="sites-grade">
                    {sites.map((s, i) => (
                        <SiteCard key={s._id} site={s} servidores={servidores} indice={i} onEditar={(site) => setModal({ site })} onRemover={excluir} onVerificar={verificar} />
                    ))}
                </div>
            )}

            {modal && <SiteModal site={modal.site} servidores={servidores} onSalvo={substituir} onClose={() => setModal(null)} />}
        </div>
    )
}

export default Sites
