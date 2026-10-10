import { useState } from 'react'
import { useIdioma } from '@/i18n/useIdioma'
import { formatarData, formatarMoeda } from '@/i18n/formatar'
import EmailQuebravel from '@/components/EmailQuebravel/EmailQuebravel'
import {
    IconeBusca, IconeMais, IconeLapis, IconeLixeira, IconeCheck, IconeX, IconeTrocar, IconeRelogioMais,
    IconeChave, IconeCadeado, IconeCadeadoAberto, IconeTelefone, IconeGrafico,
} from '@/components/Icones/Icones'
import { useClientes } from '../admin.hooks'
import { iniciais, linkWhatsapp, podeEstenderTeste, tempoDeCasa } from '../admin.utils'
import { DetalhesAssinanteModal, EditarAssinanteModal, NovoAssinanteModal, RedefinirSenhaModal, TrocarPlanoModal } from './AssinanteModais'
import '@/modules/servidor/components/servidor.css'
import './assinantes.css'

const TOM = { trial: 'info', pendente: 'warning', ativa: 'success', inadimplente: 'danger', cancelada: 'muted', expirada: 'muted' }
const DIAS_EXTRAS_DE_TESTE = 3

// Assinantes da plataforma (modelo: ClinicasADM do SoftwareClinic): tabela com busca e as ações de cada conta.
export function Clientes() {
    const { t, idioma } = useIdioma()
    const { clientes, resumo, planos, loading, erro, erroAcao, sucesso, criar, editar, excluir, redefinirSenha, trocarPlano, estenderTeste, definirBloqueio } = useClientes()
    const [busca, setBusca] = useState('')
    const [modal, setModal] = useState(null) // { tipo, assinante }
    const [confirmando, setConfirmando] = useState(null) // { id, acao: 'excluir' | 'revogar' }

    const termo = busca.trim().toLowerCase()
    const filtrados = termo ? clientes.filter((c) => `${c.nomeEmpresa} ${c.email} ${c.nomeCompleto}`.toLowerCase().includes(termo)) : clientes
    const fechar = () => setModal(null)

    async function confirmar(c) {
        if (confirmando.acao === 'excluir') await excluir(c.id)
        else await definirBloqueio(c.id, true)
        setConfirmando(null)
    }

    return (
        <div className="page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">{t('admin.clientes')}</h1>
                    <p className="page-subtitle">{t('admin.clientesSub')}</p>
                </div>
                <div className="page-header__acoes">
                    {!loading && <span className="badge badge--primary">{t(clientes.length === 1 ? 'admin.contagemUm' : 'admin.contagem', { n: clientes.length })}</span>}
                    <button type="button" className="btn btn--primary" onClick={() => setModal({ tipo: 'novo' })}><IconeMais />{t('admin.novoAssinante')}</button>
                </div>
            </header>

            {erro && <p className="alert alert--error" role="alert">{erro.message}</p>}
            {erroAcao && !modal && <p className="alert alert--error" role="alert">{erroAcao.message}</p>}
            {sucesso && <p className="alert alert--success" role="status">{sucesso}</p>}

            {resumo && (
                <div className="kpis">
                    <div className="card kpi" style={{ '--i': 0 }}><span className="kpi__rotulo">{t('admin.resumo.clientes')}</span><strong className="kpi__valor mono">{resumo.clientes}</strong></div>
                    <div className="card kpi" style={{ '--i': 1 }}><span className="kpi__rotulo">{t('admin.resumo.ativos')}</span><strong className="kpi__valor mono">{resumo.porStatus.ativa ?? 0}</strong></div>
                    <div className="card kpi" data-tom="warning" style={{ '--i': 2 }}><span className="kpi__rotulo">{t('admin.resumo.teste')}</span><strong className="kpi__valor mono">{resumo.porStatus.trial ?? 0}</strong></div>
                    <div className="card kpi" style={{ '--i': 3 }}>
                        <span className="kpi__rotulo">{t('admin.resumo.receita')}</span>
                        <strong className="kpi__valor mono">{resumo.receitaDoMes.length ? resumo.receitaDoMes.map((r) => formatarMoeda(r.total, r.moeda, idioma)).join(' + ') : formatarMoeda(0, 'BRL', idioma)}</strong>
                    </div>
                    <div className="card kpi" style={{ '--i': 4 }}><span className="kpi__rotulo">{t('admin.resumo.servidores')}</span><strong className="kpi__valor mono">{resumo.servidores}</strong></div>
                </div>
            )}

            <section className="card table-wrap">
                <div className="assinantes-toolbar">
                    <div className="search">
                        <IconeBusca />
                        <input className="input" type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={t('admin.busca')} aria-label={t('admin.busca')} />
                    </div>
                </div>

                <table className="table">
                    <thead>
                        <tr>
                            <th>{t('admin.colunas.assinante')}</th>
                            <th>{t('admin.colunas.contato')}</th>
                            <th>{t('admin.colunas.plano')}</th>
                            <th>{t('admin.colunas.situacao')}</th>
                            <th>{t('admin.colunas.acoes')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [0, 1, 2].map((i) => (
                                <tr key={i}>{[70, 55, 40, 35, 45].map((l, col) => <td key={col}><div className="skeleton skeleton--line" style={{ width: `${l}%` }} /></td>)}</tr>
                            ))
                        ) : filtrados.length === 0 ? (
                            <tr><td className="table__empty" colSpan={5}>{busca ? t('admin.nadaNaBusca') : t('admin.nenhumCliente')}</td></tr>
                        ) : filtrados.map((c) => {
                            const a = c.assinatura
                            const revogado = !!a?.acessoRevogado
                            const bloqueado = a && !a.acesso?.liberado
                            const tempo = tempoDeCasa(c.criadoEm, idioma)
                            const whats = linkWhatsapp(c.telefone)
                            return (
                                <tr key={c.id}>
                                    <td>
                                        <div className="assinante-pessoa">
                                            <div className="assinante-pessoa__avatar" aria-hidden="true">{iniciais(c.nomeCompleto)}</div>
                                            <div className="assinante-pessoa__dados">
                                                <span className="assinante-pessoa__nome">{c.nomeEmpresa}</span>
                                                <span className="assinante-pessoa__sub">{c.nomeCompleto}</span>
                                                <span className="assinante-pessoa__sub" title={formatarData(c.criadoEm, idioma)}>
                                                    {tempo ? t('admin.clienteHa', { tempo }) : t('admin.clienteDesdeHoje')} ({formatarData(c.criadoEm, idioma)})
                                                </span>
                                                <span className="assinante-uso">
                                                    {[['servidores', 'servidor', 'servidores'], ['sites', 'site', 'sites'], ['contratantes', 'cliente', 'clientes'], ['usuarios', 'usuario', 'usuarios']].map(([campo, um, varios]) => (
                                                        <span key={campo}><strong>{c[campo]}</strong> {t(`admin.uso.${c[campo] === 1 ? um : varios}`)}</span>
                                                    ))}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="assinante-contato">
                                            <span><EmailQuebravel email={c.email} /></span>
                                            {whats ? (
                                                <a className="assinante-whats" href={whats} target="_blank" rel="noopener noreferrer" title={t('admin.abrirWhatsapp')}><IconeTelefone />{c.telefone}</a>
                                            ) : c.telefone && <span>{c.telefone}</span>}
                                        </div>
                                    </td>
                                    <td>
                                        {a?.plano ? (
                                            <div className="assinante-plano">
                                                <span>{a.plano}</span>
                                                <span className="assinante-plano__preco">
                                                    {a.planoTipo === 'gratis' ? t('assinatura.pagina.gratis') : `${formatarMoeda(a.precoUSD ?? 0, 'USD', idioma)} · ${t(`assinatura.cobranca.${a.cobranca}`)}`}
                                                </span>
                                            </div>
                                        ) : <span className="assinante-pessoa__sub">{t('admin.semAssinatura')}</span>}
                                        {c.pago.length > 0 && <span className="assinante-plano__pago">{t('admin.totalPagoValor', { valor: c.pago.map((p) => formatarMoeda(p.total, p.moeda, idioma)).join(' + ') })}</span>}
                                    </td>
                                    <td>
                                        <div className="assinante-situacao">
                                            <span className="badge-linha">
                                                {revogado && <span className="badge badge--danger">{t('admin.acessoRevogado')}</span>}
                                                {!revogado && bloqueado && <span className="badge badge--danger">{t('admin.bloqueado')}</span>}
                                                {a && !revogado && <span className={`badge badge--${TOM[a.status] ?? 'muted'}`}>{t(`assinatura.status.${a.status}`)}</span>}
                                            </span>
                                            {a?.acesso?.ate && (
                                                <span className="assinante-situacao__ate">{a.acesso.liberado ? t('admin.acessoAte', { data: formatarData(a.acesso.ate, idioma) }) : t('admin.venceuEm', { data: formatarData(a.acesso.ate, idioma) })}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        {confirmando?.id === c.id ? (
                                            <div className="assinante-confirmar">
                                                <span>{confirmando.acao === 'excluir' ? t('admin.apagarConfirma') : t('admin.revogarConfirma')}</span>
                                                <button type="button" className="icon-btn icon-btn--danger" aria-label={t('comum.confirmar')}
                                                    title={confirmando.acao === 'excluir' ? t('admin.apagarDica') : t('admin.revogarDica')} onClick={() => confirmar(c)}>
                                                    <IconeCheck />
                                                </button>
                                                <button type="button" className="icon-btn" aria-label={t('comum.cancelar')} onClick={() => setConfirmando(null)}><IconeX /></button>
                                            </div>
                                        ) : (
                                            <div className="table__actions assinante-acoes">
                                                <button type="button" className="icon-btn" title={t('admin.detalhes')} aria-label={`${t('admin.detalhes')}: ${c.nomeEmpresa}`} onClick={() => setModal({ tipo: 'detalhes', assinante: c })}><IconeGrafico /></button>
                                                <button type="button" className="icon-btn" title={t('comum.editar')} aria-label={`${t('comum.editar')}: ${c.nomeEmpresa}`} onClick={() => setModal({ tipo: 'editar', assinante: c })}><IconeLapis /></button>
                                                <button type="button" className="icon-btn" title={t('admin.trocarPlano')} aria-label={`${t('admin.trocarPlano')}: ${c.nomeEmpresa}`} onClick={() => setModal({ tipo: 'plano', assinante: c })}><IconeTrocar /></button>
                                                <button type="button" className="icon-btn" title={t('admin.redefinirSenha')} aria-label={`${t('admin.redefinirSenha')}: ${c.nomeEmpresa}`} onClick={() => setModal({ tipo: 'senha', assinante: c })}><IconeChave /></button>
                                                {podeEstenderTeste(a) && (
                                                    <button type="button" className="icon-btn" title={t('admin.estenderDias', { n: DIAS_EXTRAS_DE_TESTE })} aria-label={`${t('admin.estenderDias', { n: DIAS_EXTRAS_DE_TESTE })}: ${c.nomeEmpresa}`} onClick={() => estenderTeste(c.id, DIAS_EXTRAS_DE_TESTE)}><IconeRelogioMais /></button>
                                                )}
                                                {revogado ? (
                                                    <button type="button" className="icon-btn" title={t('admin.restabelecer')} aria-label={`${t('admin.restabelecer')}: ${c.nomeEmpresa}`} onClick={() => definirBloqueio(c.id, false)}><IconeCadeadoAberto /></button>
                                                ) : (
                                                    <button type="button" className="icon-btn" title={t('admin.revogar')} aria-label={`${t('admin.revogar')}: ${c.nomeEmpresa}`} onClick={() => setConfirmando({ id: c.id, acao: 'revogar' })}><IconeCadeado /></button>
                                                )}
                                                <button type="button" className="icon-btn icon-btn--danger" title={t('comum.excluir')} aria-label={`${t('comum.excluir')}: ${c.nomeEmpresa}`} onClick={() => setConfirmando({ id: c.id, acao: 'excluir' })}><IconeLixeira /></button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </section>

            <p className="page-subtitle">{t('admin.excluirAviso')}</p>

            {modal?.tipo === 'novo' && <NovoAssinanteModal erro={erroAcao} onSave={criar} onClose={fechar} />}
            {modal?.tipo === 'editar' && <EditarAssinanteModal key={modal.assinante.id} assinante={modal.assinante} erro={erroAcao} onSave={editar} onClose={fechar} />}
            {modal?.tipo === 'senha' && <RedefinirSenhaModal key={modal.assinante.id} assinante={modal.assinante} erro={erroAcao} onSave={redefinirSenha} onClose={fechar} />}
            {modal?.tipo === 'plano' && <TrocarPlanoModal key={modal.assinante.id} assinante={modal.assinante} planos={planos} erro={erroAcao} onSave={trocarPlano} onClose={fechar} />}
            {modal?.tipo === 'detalhes' && <DetalhesAssinanteModal key={modal.assinante.id} assinante={modal.assinante} onClose={fechar} />}
        </div>
    )
}

export default Clientes
