import { useState } from 'react'
import Modal from '@/components/Modal/Modal'
import ModalForm from '@/components/Modal/ModalForm'
import SeletorPais from '@/components/SeletorPais/SeletorPais'
import { useIdioma } from '@/i18n/useIdioma'
import { formatarMoeda } from '@/i18n/formatar'
import { IconeBusca, IconeGlobo, IconeMais, IconeServidor, IconeX } from '@/components/Icones/Icones'
import { atualizarContratante, criarContratante } from '../contratante.api'
import { MOEDAS, alternar, dadosDoFormulario, ehBrasil, formularioDoContratante, totalDosItens } from '../contratante.utils'

const DIAS = Array.from({ length: 28 }, (_, i) => i + 1)
const FILTROS = ['tudo', 'servidores', 'dominios']

// Lista de marcar com título e contador ("2 de 5 marcados").
function GrupoDeLigacao({ titulo, Icone, itens, total, marcados, onAlternar, rotulo, mono = false }) {
    const { t } = useIdioma()
    return (
        <div className="ligacoes-grupo">
            <h4 className="ligacoes-grupo__titulo">
                <Icone />{titulo}
                <span className="texto-pequeno">{t('contratante.form.marcados', { n: marcados.length, total })}</span>
            </h4>
            {itens.length === 0 ? (
                <p className="texto-pequeno">{t('contratante.form.nadaEncontrado')}</p>
            ) : (
                <div className="check-list" role="group" aria-label={titulo}>
                    {itens.map((item) => (
                        <label key={item._id} className={`check${mono ? ' mono' : ''}`}>
                            <input type="checkbox" checked={marcados.includes(item._id)} onChange={() => onAlternar(item._id)} />
                            {rotulo(item)}
                        </label>
                    ))}
                </div>
            )}
        </div>
    )
}

// Criar/editar cliente final: dados, o que ele enxerga no portal e a mensalidade.
export function ContratanteModal({ contratante, servidores, sites, onSalvo, onClose }) {
    const { t, idioma } = useIdioma()
    const [form, setForm] = useState(() => formularioDoContratante(contratante, idioma))
    const [erro, setErro] = useState(null)
    const [filtro, setFiltro] = useState('tudo')
    const [busca, setBusca] = useState('')
    const brasil = ehBrasil(form.pais)
    const moeda = brasil ? 'BRL' : form.cobranca.moeda

    const termo = busca.trim().toLowerCase()
    const servidoresVisiveis = servidores.filter((s) => !termo || s.nome.toLowerCase().includes(termo) || (s.url ?? '').toLowerCase().includes(termo))
    const sitesVisiveis = sites.filter((s) => !termo || s.dominio.includes(termo))

    const campo = (nome) => ({ value: form[nome], onChange: (e) => setForm({ ...form, [nome]: e.target.value }) })
    const setCobranca = (dados) => setForm({ ...form, cobranca: { ...form.cobranca, ...dados } })
    const setItem = (i, campoItem, valor) => setCobranca({ itens: form.cobranca.itens.map((item, j) => (j === i ? { ...item, [campoItem]: valor } : item)) })

    function ligarCobranca() {
        const ativa = !form.cobranca.ativa
        // Primeira vez: já sugere os dois itens mais comuns.
        const itens = ativa && form.cobranca.itens.length === 0
            ? [{ descricao: t('contratante.form.itemServidor'), valor: '' }, { descricao: t('contratante.form.itemManutencao'), valor: '' }]
            : form.cobranca.itens
        setCobranca({ ativa, itens })
    }

    async function salvar() {
        setErro(null)
        try {
            const dados = dadosDoFormulario(form)
            const { data } = contratante ? await atualizarContratante(contratante._id, dados) : await criarContratante(dados)
            onSalvo(data)
            return true
        } catch (e) {
            setErro(e)
            return false
        }
    }

    return (
        <Modal title={contratante ? t('contratante.form.editarTitulo') : t('contratante.form.novoTitulo')} onClose={onClose} wide>
            {(fechar) => (
                <ModalForm erro={erro} onSubmit={salvar} fechar={fechar} submitLabel={contratante ? t('comum.salvarAlteracoes') : t('comum.adicionar')}>
                    <div className="form-grid contratante-form">
                        <div className="field">
                            <label className="field__label" htmlFor="ct-nome">{t('contratante.form.nome')}</label>
                            <input id="ct-nome" className="input" required data-autofocus placeholder={t('contratante.form.nomeDica')} {...campo('nome')} />
                        </div>
                        <div className="field">
                            <label className="field__label" htmlFor="ct-email">{t('contratante.form.email')}</label>
                            <input id="ct-email" className="input" type="email" required {...campo('email')} />
                            <span className="field__hint">{t('contratante.form.emailDica')}</span>
                        </div>
                        <div className="field">
                            <label className="field__label" htmlFor="ct-pais">{t('auth.pais')}</label>
                            <SeletorPais id="ct-pais" value={form.pais} onChange={(pais) => setForm({ ...form, pais })} />
                            <span className="field__hint">{brasil ? t('contratante.form.paisBrasil') : t('contratante.form.paisFora')}</span>
                        </div>
                        <div className="field">
                            <label className="field__label" htmlFor="ct-idioma">{t('contratante.form.idioma')}</label>
                            <select id="ct-idioma" className="input" {...campo('idioma')}>
                                <option value="pt">Português</option>
                                <option value="en">English</option>
                            </select>
                        </div>

                        <fieldset className="field--full contratante-ligacoes">
                            <legend className="field__label">{t('contratante.form.oQueVe')}</legend>
                            {servidores.length === 0 && sites.length === 0 ? (
                                <p className="texto-pequeno">{t('contratante.form.nadaParaLigar')}</p>
                            ) : (
                                <>
                                    <div className="ligacoes-filtros">
                                        <div className="pilulas" role="group" aria-label={t('contratante.form.mostrar')}>
                                            {FILTROS.map((f) => (
                                                <button key={f} type="button" aria-pressed={filtro === f} onClick={() => setFiltro(f)}>{t(`contratante.form.filtro.${f}`)}</button>
                                            ))}
                                        </div>
                                        <div className="search">
                                            <IconeBusca />
                                            <input className="input" type="search" placeholder={t('contratante.form.buscar')} aria-label={t('contratante.form.buscar')} value={busca} onChange={(e) => setBusca(e.target.value)} />
                                        </div>
                                    </div>
                                    {filtro !== 'dominios' && (
                                        <GrupoDeLigacao titulo={t('contratante.servidores')} Icone={IconeServidor} itens={servidoresVisiveis} total={servidores.length}
                                            marcados={form.servidores} rotulo={(s) => s.nome}
                                            onAlternar={(id) => setForm({ ...form, servidores: alternar(form.servidores, id) })} />
                                    )}
                                    {filtro !== 'servidores' && (
                                        <GrupoDeLigacao titulo={t('contratante.dominios')} Icone={IconeGlobo} itens={sitesVisiveis} total={sites.length} mono
                                            marcados={form.sites} rotulo={(s) => s.dominio}
                                            onAlternar={(id) => setForm({ ...form, sites: alternar(form.sites, id) })} />
                                    )}
                                </>
                            )}
                        </fieldset>

                        <fieldset className="field--full contratante-cobranca">
                            <legend className="field__label">{t('contratante.form.mensalidade')}</legend>
                            <button type="button" className="switch" role="switch" aria-checked={form.cobranca.ativa} onClick={ligarCobranca}>
                                <span className="switch__track" />
                                {t('contratante.form.cobrarTodoMes')}
                            </button>

                            {form.cobranca.ativa && (
                                <>
                                    <div className="contratante-cobranca__linha">
                                        <div className="field">
                                            <label className="field__label" htmlFor="ct-moeda">{t('contratante.form.moeda')}</label>
                                            <select id="ct-moeda" className="input" value={moeda} disabled={brasil} onChange={(e) => setCobranca({ moeda: e.target.value })}>
                                                {MOEDAS.map((m) => <option key={m}>{m}</option>)}
                                            </select>
                                            {brasil && <span className="field__hint">{t('contratante.form.moedaBrasil')}</span>}
                                        </div>
                                        <div className="field">
                                            <label className="field__label" htmlFor="ct-dia">{t('contratante.form.diaVencimento')}</label>
                                            <select id="ct-dia" className="input" value={form.cobranca.diaVencimento} onChange={(e) => setCobranca({ diaVencimento: Number(e.target.value) })}>
                                                {DIAS.map((d) => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="itens-cobranca">
                                        {form.cobranca.itens.map((item, i) => (
                                            <div key={i} className="itens-cobranca__linha">
                                                <input className="input" aria-label={t('contratante.form.descricao')} placeholder={t('contratante.form.descricao')} value={item.descricao} onChange={(e) => setItem(i, 'descricao', e.target.value)} />
                                                <input className="input" inputMode="decimal" aria-label={t('contratante.form.valor')} placeholder="0,00" value={item.valor} onChange={(e) => setItem(i, 'valor', e.target.value)} />
                                                <button type="button" className="icon-btn icon-btn--danger" aria-label={t('contratante.form.removerItem')} onClick={() => setCobranca({ itens: form.cobranca.itens.filter((_, j) => j !== i) })}><IconeX /></button>
                                            </div>
                                        ))}
                                        <div className="itens-cobranca__rodape">
                                            {form.cobranca.itens.length < 10 && (
                                                <button type="button" className="btn btn--ghost btn--sm" onClick={() => setCobranca({ itens: [...form.cobranca.itens, { descricao: '', valor: '' }] })}>
                                                    <IconeMais />{t('contratante.form.adicionarItem')}
                                                </button>
                                            )}
                                            <strong className="mono">{t('contratante.form.total', { valor: formatarMoeda(totalDosItens(form.cobranca.itens), moeda, idioma) })}</strong>
                                        </div>
                                    </div>
                                    <p className="texto-pequeno">{t('contratante.form.cobrancaDica')}</p>
                                </>
                            )}
                        </fieldset>
                    </div>
                </ModalForm>
            )}
        </Modal>
    )
}

export default ContratanteModal
