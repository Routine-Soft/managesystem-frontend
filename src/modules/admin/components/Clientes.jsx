import { useState } from 'react'
import { useIdioma } from '@/i18n/useIdioma'
import { formatarData, formatarMoeda } from '@/i18n/formatar'
import Modal from '@/components/Modal/Modal'
import ModalForm from '@/components/Modal/ModalForm'
import EmptyState from '@/components/EmptyState/EmptyState'
import { IconeEmpresa, IconeRelogio, IconeCheck, IconeCadeado } from '@/components/Icones/Icones'
import { useClientes } from '../admin.hooks'
import { bloquearCliente, estenderTeste, liberarCliente } from '../admin.api'
import '@/modules/servidor/components/servidor.css'

const TOM = { trial: 'info', pendente: 'warning', ativa: 'success', inadimplente: 'danger', cancelada: 'warning', expirada: 'danger' }

function AcaoModal({ cliente, tipo, planos, onFeito, onClose }) {
    const { t } = useIdioma()
    const [dias, setDias] = useState(7)
    const [planoId, setPlanoId] = useState(planos.find((p) => p.tipo === 'pago')?._id ?? '')
    const [ate, setAte] = useState('')
    const [erro, setErro] = useState(null)

    async function salvar() {
        setErro(null)
        try {
            if (tipo === 'teste') await estenderTeste(cliente.id, Number(dias))
            else await liberarCliente(cliente.id, planoId, `${ate}T23:59:59`)
            onFeito()
            return true
        } catch (e) {
            setErro(e)
            return false
        }
    }

    return (
        <Modal title={`${tipo === 'teste' ? t('admin.estenderTeste') : t('admin.liberar')} · ${cliente.nomeEmpresa}`} onClose={onClose}>
            {(fechar) => (
                <ModalForm erro={erro} onSubmit={salvar} fechar={fechar} submitLabel={t('comum.confirmar')}>
                    {tipo === 'teste' ? (
                        <div className="field"><label className="field__label" htmlFor="ac-dias">{t('admin.dias')}</label><input id="ac-dias" className="input" type="number" min="1" max="365" value={dias} onChange={(e) => setDias(e.target.value)} data-autofocus /></div>
                    ) : (
                        <>
                            <p className="modal-form__hint">{t('admin.liberarDica')}</p>
                            <div className="field">
                                <label className="field__label" htmlFor="ac-plano">{t('admin.plano')}</label>
                                <select id="ac-plano" className="input" value={planoId} onChange={(e) => setPlanoId(e.target.value)}>
                                    {planos.map((p) => <option key={p._id} value={p._id}>{p.nome}</option>)}
                                </select>
                            </div>
                            <div className="field"><label className="field__label" htmlFor="ac-ate">{t('admin.ate')}</label><input id="ac-ate" className="input" type="date" required value={ate} onChange={(e) => setAte(e.target.value)} /></div>
                        </>
                    )}
                </ModalForm>
            )}
        </Modal>
    )
}

export function Clientes() {
    const { t, idioma } = useIdioma()
    const { clientes, resumo, planos, loading, erro, recarregar } = useClientes()
    const [busca, setBusca] = useState('')
    const [acao, setAcao] = useState(null)
    const [erroAcao, setErroAcao] = useState(null)

    const termo = busca.trim().toLowerCase()
    const filtrados = termo ? clientes.filter((c) => `${c.nomeEmpresa} ${c.email} ${c.nomeCompleto}`.toLowerCase().includes(termo)) : clientes

    async function alternarBloqueio(c) {
        setErroAcao(null)
        try {
            await bloquearCliente(c.id, !c.assinatura?.acessoRevogado)
            recarregar()
        } catch (e) {
            setErroAcao(e)
        }
    }

    return (
        <div className="page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">{t('admin.clientes')}</h1>
                    <p className="page-subtitle">{t('admin.clientesSub')}</p>
                </div>
            </header>

            {(erro || erroAcao) && <p className="alert alert--error" role="alert">{(erroAcao ?? erro).message}</p>}

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

            <section className="card bloco">
                <div className="bloco__cabecalho">
                    <input className="input" type="search" placeholder={t('admin.busca')} aria-label={t('admin.busca')} value={busca} onChange={(e) => setBusca(e.target.value)} style={{ maxWidth: 360 }} />
                </div>
                {loading ? (
                    <div aria-busy="true"><div className="skeleton skeleton--line" /><div className="skeleton skeleton--line" /><div className="skeleton skeleton--line" /></div>
                ) : filtrados.length === 0 ? (
                    <EmptyState icone={<IconeEmpresa />} titulo={t('admin.nenhumCliente')} />
                ) : (
                    <div className="table-wrap">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>{t('admin.colunas.empresa')}</th>
                                    <th>{t('admin.colunas.plano')}</th>
                                    <th>{t('admin.colunas.situacao')}</th>
                                    <th>{t('admin.colunas.uso')}</th>
                                    <th>{t('admin.colunas.acoes')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtrados.map((c) => {
                                    const a = c.assinatura
                                    return (
                                        <tr key={c.id}>
                                            <td>
                                                <strong>{c.nomeEmpresa}</strong>
                                                <div className="texto-pequeno">{c.email}{c.telefone ? ` · ${c.telefone}` : ''}</div>
                                            </td>
                                            <td>{a?.plano ?? '—'}</td>
                                            <td>
                                                {a?.acessoRevogado ? <span className="badge badge--danger">{t('admin.bloqueado')}</span> : a && <span className={`badge badge--${TOM[a.status]}`}>{t(`assinatura.status.${a.status}`)}</span>}
                                                {a?.acesso?.ate && <div className="texto-pequeno">{t('admin.ateData', { data: formatarData(a.acesso.ate, idioma) })}</div>}
                                            </td>
                                            <td className="nowrap">{t('admin.uso', { servidores: c.servidores, sites: c.sites })}</td>
                                            <td>
                                                <div className="table__actions">
                                                    <button type="button" className="icon-btn" aria-label={t('admin.estenderTeste')} title={t('admin.estenderTeste')} onClick={() => setAcao({ cliente: c, tipo: 'teste' })}><IconeRelogio /></button>
                                                    <button type="button" className="icon-btn" aria-label={t('admin.liberar')} title={t('admin.liberar')} onClick={() => setAcao({ cliente: c, tipo: 'liberar' })}><IconeCheck /></button>
                                                    <button type="button" className={`icon-btn${a?.acessoRevogado ? '' : ' icon-btn--danger'}`} aria-label={a?.acessoRevogado ? t('admin.desbloquear') : t('admin.bloquear')} title={a?.acessoRevogado ? t('admin.desbloquear') : t('admin.bloquear')} onClick={() => alternarBloqueio(c)}><IconeCadeado /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {acao && <AcaoModal cliente={acao.cliente} tipo={acao.tipo} planos={planos} onFeito={recarregar} onClose={() => setAcao(null)} />}
        </div>
    )
}

export default Clientes
