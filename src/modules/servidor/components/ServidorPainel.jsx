import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useIdioma } from '@/i18n/useIdioma'
import { formatarRelativo } from '@/i18n/formatar'
import ExcluirInline from '@/components/ExcluirInline/ExcluirInline'
import { IconeAtualizar, IconeLapis, IconeSetaEsquerda, IconeTerminal, IconeCaixa } from '@/components/Icones/Icones'
import { useAgora, usePainelDoServidor } from '../servidor.hooks'
import { pedirInventario, removerServidor } from '../servidor.api'
import EditarServidorModal from './EditarServidorModal'
import ComandoModal from './ComandoModal'
import ComandoInstalacao from './ComandoInstalacao'
import CardStatus from './painel/CardStatus'
import CardRam from './painel/CardRam'
import CardCpuDisco from './painel/CardCpuDisco'
import CardContainers from './painel/CardContainers'
import CardRequisicoes from './painel/CardRequisicoes'
import CardDominioSsl from './painel/CardDominioSsl'
import CardDependencias from './painel/CardDependencias'
import CardSistema from './painel/CardSistema'
import CardLogs from './painel/CardLogs'
import CardHistorico from './painel/CardHistorico'
import CardOcorrencias from './painel/CardOcorrencias'
import './servidor.css'

function Esqueleto() {
    return (
        <div className="painel-grade" aria-busy="true">
            {[0, 1, 2, 3].map((i) => (
                <div key={i} className="card bloco">
                    <div className="skeleton skeleton--line" style={{ width: '40%' }} />
                    <div className="skeleton skeleton--line" style={{ width: '70%', height: 40 }} />
                    <div className="skeleton skeleton--line" />
                    <div className="skeleton skeleton--line" style={{ width: '85%' }} />
                </div>
            ))}
        </div>
    )
}

export function ServidorPainel() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { t, idioma } = useIdioma()
    const [periodo, setPeriodo] = useState('24h')
    const { dados, loading, erro, atualizadoEm, recarregar } = usePainelDoServidor(id, periodo)
    const agora = useAgora(5000)
    const [modal, setModal] = useState(null)
    const [aviso, setAviso] = useState(null)

    const s = dados?.servidor

    async function pedir() {
        setAviso(null)
        try {
            const r = await pedirInventario(id)
            setAviso({ tipo: 'success', texto: r.message })
        } catch (e) {
            setAviso({ tipo: 'error', texto: e.message })
        }
    }

    async function excluir() {
        try {
            await removerServidor(id)
            navigate('/inicio', { replace: true })
            return true
        } catch (e) {
            setAviso({ tipo: 'error', texto: e.message })
            return false
        }
    }

    return (
        <div className="page painel">
            <Link to="/inicio" className="voltar"><IconeSetaEsquerda />{t('servidor.visaoGeral')}</Link>

            <header className="page-header painel__cabecalho">
                <div>
                    <span className="painel__sobretitulo">{t('servidor.painelDoServidor')}</span>
                    <h1 className="page-title">{s?.nome ?? '…'}</h1>
                    {atualizadoEm && <p className="page-subtitle">{t('comum.tempo.atualizadoHa', { tempo: formatarRelativo(atualizadoEm, idioma, agora) })}</p>}
                </div>
                {s && (
                    <div className="page-header__acoes">
                        <button type="button" className="icon-btn" aria-label={t('servidor.atualizarAgora')} title={t('servidor.atualizarAgora')} onClick={recarregar}><IconeAtualizar /></button>
                        <button type="button" className="icon-btn" aria-label={t('servidor.verificarAgora')} title={t('servidor.verificarDica')} onClick={pedir}><IconeCaixa /></button>
                        <button type="button" className="icon-btn" aria-label={t('servidor.comandoInstalacao')} title={t('servidor.comandoInstalacao')} onClick={() => setModal('comando')}><IconeTerminal /></button>
                        <button type="button" className="icon-btn" aria-label={t('comum.editar')} title={t('comum.editar')} onClick={() => setModal('editar')}><IconeLapis /></button>
                        <ExcluirInline rotulo={t('servidor.excluirServidor')} onConfirmar={excluir} />
                    </div>
                )}
            </header>

            {aviso && <p className={`alert alert--${aviso.tipo}`} role={aviso.tipo === 'error' ? 'alert' : 'status'}>{aviso.texto}</p>}
            {erro && !dados && (
                <p className="alert alert--error" role="alert">
                    {erro.message} <button type="button" className="link" onClick={recarregar}>{t('comum.tentarDeNovo')}</button>
                </p>
            )}

            {loading && !dados ? <Esqueleto /> : s && (
                <>
                    {s.status === 'aguardando' && (
                        <section className="card bloco painel__instalar">
                            <div className="bloco__cabecalho"><h2 className="bloco__titulo"><IconeTerminal />{t('servidor.instalar.titulo')}</h2></div>
                            <ComandoInstalacao aguardando />
                            <button type="button" className="btn btn--primary" onClick={() => setModal('comando')}>{t('servidor.comandoInstalacao')}</button>
                        </section>
                    )}

                    <div className="painel-grade">
                        <div className="painel-coluna">
                            <CardStatus servidor={s} disponibilidade={dados.disponibilidade} incidentes={dados.incidentes} agora={agora} />
                            {/* Sistema em container de outro servidor (sem agente próprio): mostra o container no lugar de RAM/CPU/disco. */}
                            {s.containerAtual && !s.agente?.ultimoContato ? (
                                <CardContainers servidor={{ containers: [s.containerAtual] }} agora={agora} titulo={t('servidor.containers.doServidor')} />
                            ) : (
                                <>
                                    <CardRam servidor={s} serie={dados.serie} picoRam24h={dados.picoRam24h} periodo={periodo} setPeriodo={setPeriodo} />
                                    <CardCpuDisco servidor={s} />
                                    <CardContainers servidor={s} agora={agora} />
                                </>
                            )}
                            <CardRequisicoes serie={dados.serie} periodo={periodo} />
                            <CardOcorrencias incidentes={dados.incidentes} agora={agora} />
                        </div>
                        <div className="painel-coluna">
                            <CardDominioSsl servidor={s} site={dados.site} agora={agora} />
                            <CardDependencias servidor={s} agora={agora} />
                            <CardSistema servidor={s} />
                            <CardLogs servidor={s} />
                            <CardHistorico eventos={dados.eventos} />
                        </div>
                    </div>
                </>
            )}

            {modal === 'editar' && s && <EditarServidorModal servidor={s} onSalvo={recarregar} onClose={() => setModal(null)} />}
            {modal === 'comando' && <ComandoModal servidorId={id} onClose={() => setModal(null)} />}
        </div>
    )
}

export default ServidorPainel
