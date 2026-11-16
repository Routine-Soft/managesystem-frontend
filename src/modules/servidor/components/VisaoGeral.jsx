import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useIdioma } from '@/i18n/useIdioma'
import { formatarBytes, formatarData, formatarMoeda, formatarPct } from '@/i18n/formatar'
import EmptyState from '@/components/EmptyState/EmptyState'
import Medidor from '@/components/graficos/Medidor'
import { IconeMais, IconeNuvem, IconeServidor, IconeSetaDireita } from '@/components/Icones/Icones'
import { useAgora, useResumo } from '../servidor.hooks'
import { TOM_DO_STATUS, agruparPorServidor, contarPendenciasDeSeguranca, detalheEmBytes, detalheEmNucleos, numeroDeNucleos, hostDaUrl, pct, proximosVencimentos, resumoDoSistema, tomDoUso, tomDosDias } from '../servidor.utils'
import DetalheUso from './DetalheUso'
import NovoServidorModal from './NovoServidorModal'
import ServidorCard from './ServidorCard'
import './servidor.css'

function Kpi({ rotulo, valor, sub, tom, indice }) {
    return (
        <div className="card kpi" data-tom={tom} style={{ '--i': indice }}>
            <span className="kpi__rotulo">{rotulo}</span>
            <strong className="kpi__valor mono">{valor}</strong>
            {sub && <span className="kpi__sub">{sub}</span>}
        </div>
    )
}

// A máquina (servidor com o agente) como cabeçalho, com os sistemas que rodam nela em container logo abaixo.
function GrupoServidor({ servidor: s, sistemas, indice, agora, moedaPadrao, cotacoes }) {
    const { t, idioma } = useIdioma()
    const a = s.atual ?? {}
    const gb = (v) => formatarBytes(v, idioma, 1)
    const cpus = s.sistema?.cpus
    const nucleos = (n) => numeroDeNucleos(n, idioma)
    const totalNucleos = (n) => t('servidor.grupo.nucleos', { n: numeroDeNucleos(n, idioma) })
    const medidas = [
        { rotulo: 'CPU', valor: a.cpu, detalhe: cpus && a.cpu != null ? detalheEmNucleos((a.cpu / 100) * cpus, cpus, nucleos, totalNucleos) : null },
        { rotulo: 'RAM', valor: pct(a.ramUsada, a.ramTotal), detalhe: detalheEmBytes(a.ramUsada, a.ramTotal, gb) },
        { rotulo: t('servidor.disco.titulo'), valor: pct(a.discoUsado, a.discoTotal), detalhe: detalheEmBytes(a.discoUsado, a.discoTotal, gb) },
    ]
    const subtitulo = resumoDoSistema(s.sistema, t, formatarBytes, idioma) ?? (s.url ? hostDaUrl(s.url) : null)
    return (
        <section className="card grupo-servidor" style={{ '--i': indice }}>
            <header className="grupo-servidor__topo">
                <span className="grupo-servidor__icone" aria-hidden="true"><IconeServidor /></span>
                <div className="grupo-servidor__nome">
                    <span className="tipo-card">{t('comum.tipoServidor')}</span>
                    <strong>{s.nome}</strong>
                    {subtitulo && <span className="texto-pequeno">{subtitulo}</span>}
                    <span className="texto-pequeno grupo-servidor__info">
                        {s.custo?.provedor && <span><IconeNuvem />{s.custo.provedor}</span>}
                        {s.custo?.valor != null && <span className="mono">{formatarMoeda(s.custo.valor, s.custo.moeda, idioma)}/{t('servidor.grupo.mes')}</span>}
                        <span>{sistemas.length === 1 ? t('servidor.grupo.umContainer') : t('servidor.grupo.containers', { n: sistemas.length })}</span>
                    </span>
                </div>
                <span className={`badge badge--${TOM_DO_STATUS[s.status]}${s.status === 'online' ? ' badge--live' : ''}`}>{t(`servidor.status.${s.status}`)}</span>
            </header>
            {s.status !== 'aguardando' && (
                <ul className="grupo-servidor__medidas">
                    {medidas.map((m) => (
                        <li key={m.rotulo}>
                            <span>{m.rotulo}</span>
                            <Medidor pct={m.valor} tom={tomDoUso(m.valor)} rotulo={`${m.rotulo} ${formatarPct(m.valor, idioma)}`} />
                            <strong className="mono">{formatarPct(m.valor, idioma)}</strong>
                            <DetalheUso detalhe={m.detalhe} />
                        </li>
                    ))}
                </ul>
            )}
            <Link to={`/servidores/${s._id}`} className="btn btn--ghost btn--sm grupo-servidor__ver">
                {t('servidor.grupo.verServidor')}
                <IconeSetaDireita />
            </Link>
            <div className="servidores-grade grupo-servidor__sistemas">
                {sistemas.map((x, i) => <ServidorCard key={x._id} servidor={x} nucleosDaMaquina={cpus} indice={i} agora={agora} moedaPadrao={moedaPadrao} cotacoes={cotacoes} />)}
            </div>
        </section>
    )
}

export function VisaoGeral() {
    const { t, idioma } = useIdioma()
    const { dados, loading, erro, recarregar } = useResumo()
    const agora = useAgora(10000)
    const [novo, setNovo] = useState(false)

    const servidores = dados?.servidores ?? []
    const sites = dados?.sites ?? []
    const noAr = servidores.filter((s) => ['online', 'lento'].includes(s.status)).length
    const vencimentos = proximosVencimentos(servidores, sites)
    const vencendo30 = vencimentos.filter((v) => v.dias <= 30).length
    const seguranca = contarPendenciasDeSeguranca(servidores)
    const { grupos, outros } = agruparPorServidor(servidores)

    return (
        <div className="page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">{t('servidor.visaoGeral')}</h1>
                    <p className="page-subtitle">{t('servidor.visaoGeralSub')}</p>
                </div>
                <div className="page-header__acoes">
                    <button type="button" className="btn btn--primary" onClick={() => setNovo(true)}>
                        <IconeMais />
                        {t('servidor.adicionar')}
                    </button>
                </div>
            </header>

            {erro && !dados && (
                <div className="alert alert--error" role="alert">
                    {erro.message} <button type="button" className="link" onClick={recarregar}>{t('comum.tentarDeNovo')}</button>
                </div>
            )}

            {loading ? (
                <div className="kpis" aria-busy="true">
                    {[0, 1, 2, 3].map((i) => <div key={i} className="card kpi"><div className="skeleton skeleton--line" style={{ width: '60%' }} /><div className="skeleton skeleton--line" style={{ width: '40%', height: 30 }} /></div>)}
                </div>
            ) : dados && (
                <div className="kpis">
                    <Kpi indice={0} rotulo={t('servidor.kpi.noAr')} valor={noAr} sub={t('servidor.kpi.deTotal', { total: servidores.length })} tom={noAr < servidores.length ? 'danger' : 'success'} />
                    <Kpi indice={1} rotulo={t('servidor.kpi.quedas')} valor={dados.quedas30d} tom={dados.quedas30d ? 'warning' : 'success'} />
                    <Kpi indice={2} rotulo={t('servidor.kpi.seguranca')} valor={seguranca} tom={seguranca ? 'danger' : 'success'} />
                    <Kpi indice={3} rotulo={t('servidor.kpi.vencendo')} valor={vencendo30} sub={t('servidor.kpi.vencendoSub')} tom={vencendo30 ? 'warning' : 'success'} />
                </div>
            )}

            {loading ? (
                <div className="servidores-grade">
                    {[0, 1, 2].map((i) => <div key={i} className="card servidor-card"><div className="skeleton skeleton--line" style={{ width: '50%' }} /><div className="skeleton skeleton--line" /><div className="skeleton skeleton--line" /><div className="skeleton skeleton--line" style={{ width: '70%' }} /></div>)}
                </div>
            ) : dados && servidores.length === 0 ? (
                <div className="card">
                    <EmptyState icone={<IconeServidor />} titulo={t('servidor.nenhum')} texto={t('servidor.nenhumTexto')}>
                        <button type="button" className="btn btn--primary" onClick={() => setNovo(true)}><IconeMais />{t('servidor.adicionar')}</button>
                    </EmptyState>
                </div>
            ) : (
                <>
                    {grupos.map((g, i) => (
                        <GrupoServidor key={g.servidor._id} servidor={g.servidor} sistemas={g.sistemas} indice={i} agora={agora} moedaPadrao={dados.moedaPadrao} cotacoes={dados.cotacoes} />
                    ))}
                    {outros.length > 0 && (
                        <section className="grupo-outros">
                            {grupos.length > 0 && (
                                <header className="grupo-outros__topo">
                                    <h2 className="bloco__titulo">{t('servidor.grupo.outros')}</h2>
                                    <p className="texto-pequeno">{t('servidor.grupo.outrosSub')}</p>
                                </header>
                            )}
                            <div className="servidores-grade">
                                {outros.map((s, i) => <ServidorCard key={s._id} servidor={s} indice={i} agora={agora} moedaPadrao={dados.moedaPadrao} cotacoes={dados.cotacoes} />)}
                            </div>
                        </section>
                    )}
                </>
            )}

            {dados && (
                <section className="card bloco vencimentos" style={{ '--i': 2 }}>
                    <div className="bloco__cabecalho">
                        <h2 className="bloco__titulo">{t('servidor.proximosVencimentos')}</h2>
                    </div>
                    {vencimentos.length === 0 ? (
                        <p className="texto-suave">{t('servidor.semVencimentos')}</p>
                    ) : (
                        <ul className="linhas">
                            {vencimentos.map((v) => (
                                <li key={v.chave}>
                                    <Link to={v.link} className="vencimento">
                                        <span>
                                            <strong>{v.nome}</strong>
                                            <span className="texto-pequeno">{t(`servidor.tipoVencimento.${v.tipo}`)} · {formatarData(v.data, idioma)}</span>
                                        </span>
                                        <span className={`badge badge--${tomDosDias(v.dias)}`}>
                                            {v.dias <= 0 ? t('servidor.dominioSsl.vencido') : t('servidor.dominioSsl.faltam', { dias: v.dias })}
                                        </span>
                                        <IconeSetaDireita />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            )}

            {novo && <NovoServidorModal onCriado={recarregar} onClose={() => setNovo(false)} />}
        </div>
    )
}

export default VisaoGeral
