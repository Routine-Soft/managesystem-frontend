import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useIdioma } from '@/i18n/useIdioma'
import { formatarData } from '@/i18n/formatar'
import EmptyState from '@/components/EmptyState/EmptyState'
import { IconeMais, IconeServidor, IconeSetaDireita } from '@/components/Icones/Icones'
import { useAgora, useResumo } from '../servidor.hooks'
import { contarPendenciasDeSeguranca, proximosVencimentos, tomDosDias } from '../servidor.utils'
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
                <div className="servidores-grade">
                    {servidores.map((s, i) => <ServidorCard key={s._id} servidor={s} indice={i} agora={agora} />)}
                </div>
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
