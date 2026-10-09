import { useState } from 'react'
import Modal from '@/components/Modal/Modal'
import ModalForm from '@/components/Modal/ModalForm'
import { useIdioma } from '@/i18n/useIdioma'
import { IconeMais, IconeX } from '@/components/Icones/Icones'
import { atualizarSite, criarSite } from '../site.api'
import { dadosDoFormulario, formularioDoSite } from '../site.utils'

const MOEDAS = ['BRL', 'USD', 'EUR']

// Criar/editar site: aba do domínio (datas e renovação) e aba dos e-mails (caixas, uso e cobrança, à mão).
export function SiteModal({ site, servidores, onSalvo, onClose }) {
    const { t } = useIdioma()
    const [form, setForm] = useState(() => formularioDoSite(site))
    const [aba, setAba] = useState('dominio')
    const [erro, setErro] = useState(null)

    const setManual = (campo, valor) => setForm({ ...form, manual: { ...form.manual, [campo]: valor } })
    const setEmails = (campo, valor) => setForm({ ...form, emails: { ...form.emails, [campo]: valor } })
    const setCaixa = (i, campo, valor) => setEmails('caixas', form.emails.caixas.map((c, j) => (j === i ? { ...c, [campo]: valor } : c)))

    async function salvar() {
        setErro(null)
        try {
            const dados = dadosDoFormulario(form)
            const { data } = site ? await atualizarSite(site._id, dados) : await criarSite(dados)
            onSalvo(data)
            return true
        } catch (e) {
            setErro(e)
            return false
        }
    }

    return (
        <Modal title={site ? t('site.form.editarTitulo') : t('site.form.novoTitulo')} onClose={onClose} wide>
            {(fechar) => (
                <ModalForm erro={erro} onSubmit={salvar} fechar={fechar} submitLabel={site ? t('comum.salvarAlteracoes') : t('comum.adicionar')}>
                    <div className="pilulas site-abas" role="tablist">
                        {['dominio', 'emails'].map((a) => (
                            <button key={a} type="button" role="tab" aria-selected={aba === a} aria-pressed={aba === a} onClick={() => setAba(a)}>
                                {t(a === 'dominio' ? 'site.form.abaDominio' : 'site.form.abaEmails')}
                            </button>
                        ))}
                    </div>

                    {aba === 'dominio' && (
                        <div className="form-grid">
                            <div className="field">
                                <label className="field__label" htmlFor="site-dominio">{t('site.form.dominio')}</label>
                                <input id="site-dominio" className="input" required placeholder={t('site.form.dominioDica')} value={form.dominio} onChange={(e) => setForm({ ...form, dominio: e.target.value })} data-autofocus />
                            </div>
                            <div className="field">
                                <label className="field__label" htmlFor="site-servidor">{t('site.form.servidor')}</label>
                                <select id="site-servidor" className="input" value={form.servidorId} onChange={(e) => setForm({ ...form, servidorId: e.target.value })}>
                                    <option value="">{t('site.form.nenhumServidor')}</option>
                                    {servidores.map((s) => <option key={s._id} value={s._id}>{s.nome}</option>)}
                                </select>
                            </div>
                            <p className="field--full alert alert--info">{t('site.form.automatico')}</p>
                            <div className="field">
                                <label className="field__label" htmlFor="site-criado">{t('site.form.criadoEm')}</label>
                                <input id="site-criado" className="input" type="date" value={form.manual.criadoEm} onChange={(e) => setManual('criadoEm', e.target.value)} />
                            </div>
                            <div className="field">
                                <label className="field__label" htmlFor="site-expira">{t('site.form.expiraEm')}</label>
                                <input id="site-expira" className="input" type="date" value={form.manual.expiraEm} onChange={(e) => setManual('expiraEm', e.target.value)} />
                            </div>
                            <div className="field">
                                <label className="field__label" htmlFor="site-registrador">{t('site.form.registrador')}</label>
                                <input id="site-registrador" className="input" placeholder={t('site.form.registradorDica')} value={form.manual.registrador} onChange={(e) => setManual('registrador', e.target.value)} />
                            </div>
                            <div className="field site-valor">
                                <label className="field__label" htmlFor="site-valor">{t('site.form.valorRenovacao')}</label>
                                <div className="site-valor__linha">
                                    <select className="input" aria-label={t('site.form.moeda')} value={form.manual.moeda} onChange={(e) => setManual('moeda', e.target.value)}>
                                        {MOEDAS.map((m) => <option key={m}>{m}</option>)}
                                    </select>
                                    <input id="site-valor" className="input" inputMode="decimal" placeholder="0,00" value={form.manual.valorRenovacao} onChange={(e) => setManual('valorRenovacao', e.target.value)} />
                                </div>
                            </div>
                            <div className="field field--full">
                                <label className="field__label" htmlFor="site-link">{t('site.form.linkRenovacao')}</label>
                                <input id="site-link" className="input" inputMode="url" placeholder="https://" value={form.manual.linkRenovacao} onChange={(e) => setManual('linkRenovacao', e.target.value)} />
                                <span className="field__hint">{t('site.form.linkRenovacaoDica')}</span>
                            </div>
                            <label className="check field--full">
                                <input type="checkbox" checked={form.manual.renovacaoAutomatica} onChange={(e) => setManual('renovacaoAutomatica', e.target.checked)} />
                                {t('site.form.renovaSozinho')}
                            </label>
                            <div className="field field--full">
                                <label className="field__label" htmlFor="site-obs">{t('site.form.observacao')}</label>
                                <textarea id="site-obs" className="input textarea" rows={2} value={form.manual.observacao} onChange={(e) => setManual('observacao', e.target.value)} />
                            </div>
                        </div>
                    )}

                    {aba === 'emails' && (
                        <div className="form-grid">
                            <div className="field">
                                <label className="field__label" htmlFor="email-provedor">{t('site.form.provedor')}</label>
                                <input id="email-provedor" className="input" placeholder={t('site.form.provedorDica')} value={form.emails.provedor} onChange={(e) => setEmails('provedor', e.target.value)} />
                            </div>
                            <div className="field">
                                <label className="field__label" htmlFor="email-vence">{t('site.form.vencimento')}</label>
                                <input id="email-vence" className="input" type="date" value={form.emails.vencimento} onChange={(e) => setEmails('vencimento', e.target.value)} />
                            </div>
                            <div className="field site-valor">
                                <label className="field__label" htmlFor="email-valor">{t('site.form.valor')}</label>
                                <div className="site-valor__linha">
                                    <select className="input" aria-label={t('site.form.moeda')} value={form.emails.moeda} onChange={(e) => setEmails('moeda', e.target.value)}>
                                        {MOEDAS.map((m) => <option key={m}>{m}</option>)}
                                    </select>
                                    <input id="email-valor" className="input" inputMode="decimal" placeholder="0,00" value={form.emails.valor} onChange={(e) => setEmails('valor', e.target.value)} />
                                </div>
                            </div>
                            <div className="field">
                                <label className="field__label" htmlFor="email-periodo">{t('site.form.periodicidade')}</label>
                                <select id="email-periodo" className="input" value={form.emails.periodicidade} onChange={(e) => setEmails('periodicidade', e.target.value)}>
                                    <option value="mensal">{t('site.form.mensal')}</option>
                                    <option value="anual">{t('site.form.anual')}</option>
                                </select>
                            </div>

                            <div className="field field--full">
                                <label className="field__label" htmlFor="email-link">{t('site.form.linkRenovacao')}</label>
                                <input id="email-link" className="input" inputMode="url" placeholder="https://" value={form.emails.linkRenovacao} onChange={(e) => setEmails('linkRenovacao', e.target.value)} />
                                <span className="field__hint">{t('site.form.linkRenovacaoDica')}</span>
                            </div>

                            <fieldset className="field--full caixas">
                                <legend className="field__label">{t('site.form.caixas')}</legend>
                                {form.emails.caixas.map((c, i) => (
                                    <div key={i} className="caixas__linha">
                                        <input className="input" type="email" aria-label={t('site.form.endereco')} placeholder={`contato@${form.dominio || 'meusite.com.br'}`} value={c.endereco} onChange={(e) => setCaixa(i, 'endereco', e.target.value)} />
                                        <input className="input" inputMode="decimal" aria-label={t('site.form.usado')} placeholder={t('site.form.usado')} value={c.usadoGB} onChange={(e) => setCaixa(i, 'usadoGB', e.target.value)} />
                                        <input className="input" inputMode="decimal" aria-label={t('site.form.cota')} placeholder={t('site.form.cota')} value={c.cotaGB} onChange={(e) => setCaixa(i, 'cotaGB', e.target.value)} />
                                        <button type="button" className="icon-btn icon-btn--danger" aria-label={t('site.form.removerCaixa')} onClick={() => setEmails('caixas', form.emails.caixas.filter((_, j) => j !== i))}><IconeX /></button>
                                    </div>
                                ))}
                                <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEmails('caixas', [...form.emails.caixas, { endereco: '', cotaGB: '', usadoGB: '' }])}>
                                    <IconeMais />{t('site.form.adicionarCaixa')}
                                </button>
                            </fieldset>
                        </div>
                    )}
                </ModalForm>
            )}
        </Modal>
    )
}

export default SiteModal
