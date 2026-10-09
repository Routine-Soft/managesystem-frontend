import { useState } from 'react'
import { useIdioma } from '@/i18n/useIdioma'
import { formatarMoeda } from '@/i18n/formatar'
import Modal from '@/components/Modal/Modal'
import ModalForm from '@/components/Modal/ModalForm'
import EmptyState from '@/components/EmptyState/EmptyState'
import ExcluirInline from '@/components/ExcluirInline/ExcluirInline'
import { IconeEtiqueta, IconeLapis, IconeMais } from '@/components/Icones/Icones'
import { usePlanosAdmin } from '../admin.hooks'
import { atualizarPlano, criarPlano } from '../admin.api'

const VAZIO = { nome: '', descricao: '', tipo: 'pago', precoUSD: '', stripePriceId: '', duracaoDiasTrial: '', limiteServidores: '', limiteSites: '', ativo: true }

function PlanoModal({ plano, onSalvo, onClose }) {
    const { t } = useIdioma()
    const [form, setForm] = useState(() => (plano ? { ...VAZIO, ...Object.fromEntries(Object.entries(plano).map(([k, v]) => [k, v ?? ''])) } : VAZIO))
    const [erro, setErro] = useState(null)
    const campo = (nome) => ({ value: form[nome], onChange: (e) => setForm({ ...form, [nome]: e.target.value }) })

    async function salvar() {
        setErro(null)
        try {
            const dados = { ...form }
            delete dados._id
            delete dados.createdAt
            delete dados.updatedAt
            delete dados.__v
            const { data } = plano ? await atualizarPlano(plano._id, dados) : await criarPlano(dados)
            onSalvo(data)
            return true
        } catch (e) {
            setErro(e)
            return false
        }
    }

    return (
        <Modal title={plano ? t('admin.editarPlano') : t('admin.novoPlano')} onClose={onClose} wide>
            {(fechar) => (
                <ModalForm erro={erro} onSubmit={salvar} fechar={fechar}>
                    <div className="form-grid">
                        <div className="field"><label className="field__label" htmlFor="pl-nome">{t('admin.campos.nome')}</label><input id="pl-nome" className="input" required data-autofocus {...campo('nome')} /></div>
                        <div className="field">
                            <label className="field__label" htmlFor="pl-tipo">{t('admin.campos.tipo')}</label>
                            <select id="pl-tipo" className="input" {...campo('tipo')}>
                                <option value="pago">{t('admin.campos.pago')}</option>
                                <option value="gratis">{t('admin.campos.gratis')}</option>
                            </select>
                        </div>
                        <div className="field field--full"><label className="field__label" htmlFor="pl-desc">{t('admin.campos.descricao')}</label><input id="pl-desc" className="input" {...campo('descricao')} /></div>
                        {form.tipo === 'pago' ? (
                            <>
                                <div className="field"><label className="field__label" htmlFor="pl-usd">{t('admin.campos.precoUSD')}</label><input id="pl-usd" className="input" type="number" min="0" step="0.01" {...campo('precoUSD')} /></div>
                                <div className="field field--full">
                                    <label className="field__label" htmlFor="pl-stripe">{t('admin.campos.stripePriceId')}</label>
                                    <input id="pl-stripe" className="input mono" placeholder="price_..." {...campo('stripePriceId')} />
                                    <span className="field__hint">{t('admin.campos.stripeDica')}</span>
                                </div>
                            </>
                        ) : (
                            <div className="field"><label className="field__label" htmlFor="pl-dias">{t('admin.campos.duracaoDiasTrial')}</label><input id="pl-dias" className="input" type="number" min="1" {...campo('duracaoDiasTrial')} /></div>
                        )}
                        <div className="field"><label className="field__label" htmlFor="pl-srv">{t('admin.campos.limiteServidores')}</label><input id="pl-srv" className="input" type="number" min="1" placeholder={t('admin.campos.semLimite')} {...campo('limiteServidores')} /></div>
                        <div className="field"><label className="field__label" htmlFor="pl-sites">{t('admin.campos.limiteSites')}</label><input id="pl-sites" className="input" type="number" min="1" placeholder={t('admin.campos.semLimite')} {...campo('limiteSites')} /></div>
                        <label className="check field--full"><input type="checkbox" checked={!!form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} />{t('admin.campos.ativo')}</label>
                    </div>
                </ModalForm>
            )}
        </Modal>
    )
}

export function PlanosAdmin() {
    const { t, idioma } = useIdioma()
    const { planos, loading, erro, substituir, remover } = usePlanosAdmin()
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
                    <h1 className="page-title">{t('admin.planos')}</h1>
                    <p className="page-subtitle">{t('admin.planosSub')}</p>
                </div>
                <div className="page-header__acoes">
                    <button type="button" className="btn btn--primary" onClick={() => setModal({})}><IconeMais />{t('admin.novoPlano')}</button>
                </div>
            </header>

            {(erro || erroAcao) && <p className="alert alert--error" role="alert">{(erroAcao ?? erro).message}</p>}

            <section className="card bloco">
                {loading ? (
                    <div aria-busy="true"><div className="skeleton skeleton--line" /><div className="skeleton skeleton--line" /></div>
                ) : planos.length === 0 ? (
                    <EmptyState icone={<IconeEtiqueta />} titulo={t('admin.nenhumPlano')}>
                        <button type="button" className="btn btn--primary" onClick={() => setModal({})}><IconeMais />{t('admin.novoPlano')}</button>
                    </EmptyState>
                ) : (
                    <ul className="linhas">
                        {planos.map((p) => (
                            <li key={p._id}>
                                <span style={{ display: 'grid', minWidth: 0 }}>
                                    <strong>{p.nome}</strong>
                                    <span className="texto-pequeno">
                                        {p.tipo === 'gratis'
                                            ? `${t('admin.campos.gratis')} · ${p.duracaoDiasTrial ?? '—'} ${t('admin.dias').toLowerCase()}`
                                            : formatarMoeda(p.precoUSD, 'USD', idioma)}
                                        {' · '}{p.limiteServidores ?? '∞'} / {p.limiteSites ?? '∞'}
                                    </span>
                                </span>
                                <span style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                                    {!p.ativo && <span className="badge badge--neutro">{t('admin.inativo')}</span>}
                                    {p.tipo === 'pago' && !p.stripePriceId && <span className="badge badge--warning">{t('admin.semStripe')}</span>}
                                    <button type="button" className="icon-btn" aria-label={t('comum.editar')} title={t('comum.editar')} onClick={() => setModal({ plano: p })}><IconeLapis /></button>
                                    <ExcluirInline onConfirmar={() => excluir(p._id)} />
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {modal && <PlanoModal plano={modal.plano} onSalvo={substituir} onClose={() => setModal(null)} />}
        </div>
    )
}

export default PlanosAdmin
