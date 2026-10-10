import { useEffect, useState } from 'react'
import Modal from '@/components/Modal/Modal'
import ModalForm from '@/components/Modal/ModalForm'
import SeletorPais from '@/components/SeletorPais/SeletorPais'
import { useIdioma } from '@/i18n/useIdioma'
import { formatarData, formatarMoeda } from '@/i18n/formatar'
import { adivinharPais } from '@/i18n/paises'
import { pagamentosDoCliente } from '../admin.api'
import { tempoDeCasa } from '../admin.utils'

// Modais da tela "Assinantes" do super_admin (modelo: ClinicasADM do SoftwareClinic).

function CamposDoAssinante({ form, setForm, comSenha = false }) {
    const { t } = useIdioma()
    const campo = (nome) => ({ value: form[nome] ?? '', onChange: (e) => setForm({ ...form, [nome]: e.target.value }) })
    return (
        <>
            <div className="field">
                <label className="field__label" htmlFor="as-nome">{t('conta.nome')}</label>
                <input id="as-nome" className="input" required data-autofocus {...campo('nomeCompleto')} />
            </div>
            <div className="modal-form__row">
                <div className="field">
                    <label className="field__label" htmlFor="as-empresa">{t('conta.empresa')}</label>
                    <input id="as-empresa" className="input" required {...campo('nomeEmpresa')} />
                </div>
                <div className="field">
                    <label className="field__label" htmlFor="as-pais">{t('auth.pais')}</label>
                    <SeletorPais id="as-pais" value={form.pais} onChange={(pais) => setForm({ ...form, pais })} />
                </div>
            </div>
            <div className="modal-form__row">
                <div className="field">
                    <label className="field__label" htmlFor="as-tel">{t('conta.telefone')}</label>
                    <input id="as-tel" className="input" type="tel" {...campo('telefone')} />
                </div>
                <div className="field">
                    <label className="field__label" htmlFor="as-email">{t('conta.email')}</label>
                    <input id="as-email" className="input" type="email" required {...campo('email')} />
                </div>
            </div>
            {comSenha && (
                <div className="field">
                    <label className="field__label" htmlFor="as-senha">{t('admin.senhaInicial')}</label>
                    <input id="as-senha" className="input" type="password" autoComplete="new-password" minLength={6} required {...campo('password')} />
                    <span className="field__hint">{t('auth.senhaDica')}</span>
                </div>
            )}
        </>
    )
}

export function NovoAssinanteModal({ erro, onSave, onClose }) {
    const { t, idioma } = useIdioma()
    const [form, setForm] = useState({ nomeCompleto: '', nomeEmpresa: '', pais: adivinharPais(), telefone: '', email: '', password: '' })
    return (
        <Modal title={t('admin.novoAssinante')} onClose={onClose}>
            {(fechar) => (
                <ModalForm erro={erro} fechar={fechar} submitLabel={t('admin.cadastrar')} loadingLabel={t('admin.cadastrando')} onSubmit={() => onSave({ ...form, idioma })}>
                    <p className="modal-form__hint">{t('admin.novoAssinanteDica')}</p>
                    <CamposDoAssinante form={form} setForm={setForm} comSenha />
                </ModalForm>
            )}
        </Modal>
    )
}

export function EditarAssinanteModal({ assinante, erro, onSave, onClose }) {
    const { t } = useIdioma()
    const [form, setForm] = useState({
        nomeCompleto: assinante.nomeCompleto ?? '',
        nomeEmpresa: assinante.nomeEmpresa ?? '',
        pais: assinante.pais ?? 'BR',
        telefone: assinante.telefone ?? '',
        email: assinante.email ?? '',
    })
    return (
        <Modal title={t('admin.editarAssinante')} onClose={onClose}>
            {(fechar) => (
                <ModalForm erro={erro} fechar={fechar} submitLabel={t('comum.salvarAlteracoes')} onSubmit={() => onSave(assinante.id, form)}>
                    <CamposDoAssinante form={form} setForm={setForm} />
                </ModalForm>
            )}
        </Modal>
    )
}

// O super_admin define uma senha nova para quem esqueceu a dele.
export function RedefinirSenhaModal({ assinante, erro, onSave, onClose }) {
    const { t } = useIdioma()
    const [nova, setNova] = useState('')
    const [confirmar, setConfirmar] = useState('')
    const diferentes = confirmar !== '' && nova !== confirmar
    return (
        <Modal title={t('admin.redefinirSenha')} onClose={onClose}>
            {(fechar) => (
                <ModalForm erro={erro} fechar={fechar} submitLabel={t('admin.redefinirSenha')} submitDisabled={diferentes || nova.length < 6} onSubmit={() => onSave(assinante.id, nova)}>
                    <p className="modal-form__hint">{t('admin.redefinirSenhaDica', { nome: assinante.nomeCompleto, email: assinante.email, empresa: assinante.nomeEmpresa })}</p>
                    <div className="modal-form__row">
                        <div className="field">
                            <label className="field__label" htmlFor="rs-nova">{t('conta.novaSenha')}</label>
                            <input id="rs-nova" className="input" type="password" autoComplete="new-password" minLength={6} required data-autofocus value={nova} onChange={(e) => setNova(e.target.value)} />
                        </div>
                        <div className="field">
                            <label className="field__label" htmlFor="rs-conf">{t('conta.confirmarSenha')}</label>
                            <input id="rs-conf" className="input" type="password" autoComplete="new-password" required value={confirmar} onChange={(e) => setConfirmar(e.target.value)} />
                        </div>
                    </div>
                    {diferentes
                        ? <p className="modal-form__hint modal-form__hint--erro" role="alert">{t('conta.senhasDiferentes')}</p>
                        : <p className="modal-form__hint">{t('auth.senhaDica')}</p>}
                </ModalForm>
            )}
        </Modal>
    )
}

// Troca o plano por fora do Mercado Pago/Stripe: pago fica ativo sem cobrança até a data; grátis volta ao teste até a data.
export function TrocarPlanoModal({ assinante, planos, erro, onSave, onClose }) {
    const { t, idioma } = useIdioma()
    const ativos = planos.filter((p) => p.ativo)
    const [planoId, setPlanoId] = useState(assinante.assinatura?.planoId ?? ativos[0]?._id ?? '')
    const [ate, setAte] = useState('')
    return (
        <Modal title={t('admin.trocarPlano')} onClose={onClose}>
            {(fechar) => (
                <ModalForm erro={erro} fechar={fechar} submitLabel={t('admin.confirmarPlano')} submitDisabled={!planoId || !ate} onSubmit={() => onSave(assinante.id, planoId, `${ate}T23:59:59`)}>
                    <p className="modal-form__hint">{t('admin.trocarPlanoDica', { empresa: assinante.nomeEmpresa })}</p>
                    <div className="troca-plano__lista" role="radiogroup" aria-label={t('admin.planos')}>
                        {ativos.map((plano, i) => (
                            <label key={plano._id} className="troca-plano__opcao" data-selecionado={planoId === plano._id || undefined}>
                                <input type="radio" name="plano" value={plano._id} checked={planoId === plano._id} onChange={() => setPlanoId(plano._id)} data-autofocus={i === 0 ? '' : undefined} />
                                <span className="troca-plano__nome">{plano.nome}</span>
                                <span className="troca-plano__preco">{plano.tipo === 'gratis' ? t('assinatura.pagina.gratis') : formatarMoeda(plano.precoUSD, 'USD', idioma)}</span>
                            </label>
                        ))}
                    </div>
                    <div className="field">
                        <label className="field__label" htmlFor="tp-ate">{t('admin.liberadoAte')}</label>
                        <input id="tp-ate" className="input" type="date" required value={ate} onChange={(e) => setAte(e.target.value)} />
                    </div>
                </ModalForm>
            )}
        </Modal>
    )
}

function Numero({ rotulo, valor, tom }) {
    return (
        <div className="assinante-numero" data-tom={tom}>
            <strong>{valor}</strong>
            <span>{rotulo}</span>
        </div>
    )
}

// Uso da conta e tudo o que ela já pagou, com o histórico de pagamentos.
export function DetalhesAssinanteModal({ assinante: a, onClose }) {
    const { t, idioma } = useIdioma()
    const [pagamentos, setPagamentos] = useState(null)
    const [erro, setErro] = useState(null)
    const tempo = tempoDeCasa(a.criadoEm, idioma)

    useEffect(() => {
        let ignore = false
        Promise.resolve()
            .then(() => pagamentosDoCliente(a.id))
            .then((r) => { if (!ignore) setPagamentos(r.data) })
            .catch((e) => { if (!ignore) setErro(e) })
        return () => {
            ignore = true
        }
    }, [a.id])

    return (
        <Modal title={a.nomeEmpresa} wide onClose={onClose}>
            {() => (
                <div className="assinante-detalhes">
                    <p className="assinante-detalhes__sub">
                        {a.nomeCompleto} · {tempo ? t('admin.clienteHa', { tempo }) : t('admin.clienteDesdeHoje')} ({t('admin.desde', { data: formatarData(a.criadoEm, idioma) })})
                    </p>

                    <section aria-label={t('admin.cadastros')}>
                        <h4 className="assinante-detalhes__titulo">{t('admin.cadastros')}</h4>
                        <div className="assinante-numeros">
                            <Numero rotulo={t('admin.numeros.usuarios')} valor={a.usuarios} />
                            <Numero rotulo={t('admin.numeros.servidores')} valor={a.servidores} />
                            <Numero rotulo={t('admin.numeros.sites')} valor={a.sites} />
                            <Numero rotulo={t('admin.numeros.clientes')} valor={a.contratantes} />
                        </div>
                    </section>

                    <section aria-label={t('assinatura.pagamentos')}>
                        <h4 className="assinante-detalhes__titulo">{t('assinatura.pagamentos')}</h4>
                        <div className="assinante-numeros">
                            <Numero rotulo={t('admin.totalPago')} valor={a.pago.length ? a.pago.map((p) => formatarMoeda(p.total, p.moeda, idioma)).join(' + ') : formatarMoeda(0, 'USD', idioma)} tom="success" />
                            <Numero rotulo={t('admin.numeros.pagamentos')} valor={a.pago.reduce((s, p) => s + p.quantidade, 0)} />
                        </div>
                        {erro ? (
                            <p className="alert alert--error" role="alert">{erro.message}</p>
                        ) : pagamentos === null ? (
                            <div className="skeleton skeleton--line" style={{ width: '60%' }} aria-busy="true" />
                        ) : pagamentos.length === 0 ? (
                            <p className="assinante-detalhes__vazio">{t('admin.semPagamentos')}</p>
                        ) : (
                            <div className="table-wrap">
                                <table className="table assinante-pagamentos">
                                    <thead>
                                        <tr><th>{t('admin.colunas.data')}</th><th>{t('admin.colunas.valor')}</th><th>{t('admin.colunas.forma')}</th><th>{t('admin.colunas.plano')}</th></tr>
                                    </thead>
                                    <tbody>
                                        {pagamentos.map((p) => (
                                            <tr key={p._id}>
                                                <td className="nowrap">{formatarData(p.aprovadoEm, idioma)}</td>
                                                <td className="nowrap">{formatarMoeda(p.valor, p.moeda, idioma)}</td>
                                                <td>{t(`assinatura.metodo.${p.metodo}`)}</td>
                                                <td>{p.plano ?? '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            )}
        </Modal>
    )
}
