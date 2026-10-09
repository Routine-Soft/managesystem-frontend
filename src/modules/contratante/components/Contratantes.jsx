import { useState } from 'react'
import { useIdioma } from '@/i18n/useIdioma'
import { formatarData, formatarMoeda } from '@/i18n/formatar'
import { nomeDoPais } from '@/i18n/paises'
import EmptyState from '@/components/EmptyState/EmptyState'
import ExcluirInline from '@/components/ExcluirInline/ExcluirInline'
import BotaoCopiar from '@/components/Copiar/BotaoCopiar'
import { IconeCartao, IconeLapis, IconeMais, IconeUsuarios, IconeAbrir, IconeHistorico } from '@/components/Icones/Icones'
import { useContratantes } from '../contratante.hooks'
import { gerarLinkDeAcesso } from '../contratante.api'
import { chaveDoStatusDaFatura, ehBrasil, tomDaFatura } from '../contratante.utils'
import ContratanteModal from './ContratanteModal'
import FaturasModal from './FaturasModal'
import RecebimentosModal from './RecebimentosModal'
import './contratante.css'

// Link do portal com o endereço que está aberto no navegador (Vercel em produção, localhost no PC).
function linkDoPortal(token) {
    return `${window.location.origin}${window.location.pathname}#/portal/acesso/${token}`
}

// Link de acesso: gera um novo (o anterior para de valer), tenta copiar e mostra para copiar na mão se precisar.
function LinkDeAcesso({ contratante }) {
    const { t, idioma } = useIdioma()
    const [link, setLink] = useState(null)
    const [gerando, setGerando] = useState(false)
    const [erro, setErro] = useState(null)

    async function gerar() {
        setErro(null)
        setGerando(true)
        try {
            const { data } = await gerarLinkDeAcesso(contratante._id)
            const url = data.token ? linkDoPortal(data.token) : data.url
            setLink({ ...data, url })
            await navigator.clipboard?.writeText(url).catch(() => null)
        } catch (e) {
            setErro(e)
        } finally {
            setGerando(false)
        }
    }

    if (link) {
        return (
            <div className="link-acesso">
                <p className="texto-pequeno">{t('contratante.link.pronto', { data: formatarData(link.expiraEm, idioma) })}</p>
                <div className="link-acesso__linha">
                    <input className="input mono" readOnly value={link.url} aria-label={t('contratante.link.rotulo')} onFocus={(e) => e.target.select()} />
                    <BotaoCopiar texto={link.url} />
                </div>
            </div>
        )
    }

    return (
        <>
            <button type="button" className={`btn btn--ghost btn--sm${gerando ? ' btn--loading' : ''}`} disabled={gerando} onClick={gerar}>
                <IconeAbrir />
                {contratante.acessoCriado ? t('contratante.link.novaSenha') : t('contratante.link.copiar')}
            </button>
            {erro && <p className="alert alert--error" role="alert">{erro.message}</p>}
        </>
    )
}

function ContratanteCard({ contratante: c, servidores, sites, indice, onEditar, onFaturas, onRemover }) {
    const { t, idioma } = useIdioma()
    const nomesServidores = servidores.filter((s) => c.servidores.includes(s._id)).map((s) => s.nome)
    const nomesSites = sites.filter((s) => c.sites.includes(s._id)).map((s) => s.dominio)
    const f = c.ultimaFatura

    return (
        <article className="card contratante-card" style={{ '--i': indice }}>
            <header className="contratante-card__topo">
                <div className="contratante-card__nome">
                    <strong>{c.nome}</strong>
                    <span className="texto-pequeno">{c.email} · {nomeDoPais(c.pais, idioma)}</span>
                </div>
                <div className="contratante-card__acoes">
                    <button type="button" className="icon-btn" aria-label={t('contratante.verFaturas')} title={t('contratante.verFaturas')} onClick={() => onFaturas(c)}><IconeHistorico /></button>
                    <button type="button" className="icon-btn" aria-label={t('comum.editar')} title={t('comum.editar')} onClick={() => onEditar(c)}><IconeLapis /></button>
                    <ExcluirInline onConfirmar={() => onRemover(c._id)} />
                </div>
            </header>

            <div className="contratante-card__selos">
                <span className={`badge badge--${c.acessoCriado ? 'success' : 'warning'}`}>{c.acessoCriado ? t('contratante.acessoCriado') : t('contratante.acessoPendente')}</span>
                {f && <span className={`badge badge--${tomDaFatura(f)}`}>{t(`contratante.faturas.status.${chaveDoStatusDaFatura(f)}`)} · {formatarMoeda(f.total, f.moeda, idioma)}</span>}
            </div>

            <ul className="linhas">
                <li>
                    <span>{t('contratante.mensalidade')}</span>
                    <strong className="mono">{c.cobranca?.ativa ? t('contratante.porMesDia', { valor: formatarMoeda(c.totalMensal, c.cobranca.moeda, idioma), dia: c.cobranca.diaVencimento }) : t('contratante.semCobranca')}</strong>
                </li>
                <li>
                    <span>{t('contratante.recebePor')}</span>
                    <strong>{ehBrasil(c.pais) ? 'Mercado Pago' : 'Stripe'}</strong>
                </li>
                <li>
                    <span>{t('contratante.ve')}</span>
                    <strong className="contratante-card__ve">{[...nomesServidores, ...nomesSites].join(', ') || t('contratante.nada')}</strong>
                </li>
            </ul>

            <LinkDeAcesso contratante={c} />
        </article>
    )
}

export function Contratantes() {
    const { t } = useIdioma()
    const { contratantes, servidores, sites, recebimentos, setRecebimentos, loading, erro, substituir, remover } = useContratantes()
    const [modal, setModal] = useState(null)
    const [erroAcao, setErroAcao] = useState(null)
    const semRecebimento = recebimentos && !recebimentos.mercadoPago?.conectadoEm && !recebimentos.stripe?.conectadoEm
    const algumCobrando = contratantes.some((c) => c.cobranca?.ativa)

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
                    <h1 className="page-title">{t('contratante.titulo')}</h1>
                    <p className="page-subtitle">{t('contratante.subtitulo')}</p>
                </div>
                <div className="page-header__acoes">
                    <button type="button" className="btn btn--ghost" onClick={() => setModal({ tipo: 'recebimentos' })}><IconeCartao />{t('contratante.receberPagamentos')}</button>
                    <button type="button" className="btn btn--primary" onClick={() => setModal({ tipo: 'editar' })}><IconeMais />{t('contratante.adicionar')}</button>
                </div>
            </header>

            {(erro || erroAcao) && <p className="alert alert--error" role="alert">{(erroAcao ?? erro).message}</p>}
            {semRecebimento && algumCobrando && (
                <p className="alert alert--warning">
                    {t('contratante.avisoRecebimento')}{' '}
                    <button type="button" className="link" onClick={() => setModal({ tipo: 'recebimentos' })}>{t('contratante.receberPagamentos')}</button>
                </p>
            )}

            {loading ? (
                <div className="contratantes-grade" aria-busy="true">
                    {[0, 1].map((i) => <div key={i} className="card contratante-card"><div className="skeleton skeleton--line" style={{ width: '50%' }} /><div className="skeleton skeleton--line" /><div className="skeleton skeleton--line" style={{ width: '70%' }} /></div>)}
                </div>
            ) : contratantes.length === 0 ? (
                <div className="card">
                    <EmptyState icone={<IconeUsuarios />} titulo={t('contratante.nenhum')} texto={t('contratante.nenhumTexto')}>
                        <button type="button" className="btn btn--primary" onClick={() => setModal({ tipo: 'editar' })}><IconeMais />{t('contratante.adicionar')}</button>
                    </EmptyState>
                </div>
            ) : (
                <div className="contratantes-grade">
                    {contratantes.map((c, i) => (
                        <ContratanteCard key={c._id} contratante={c} servidores={servidores} sites={sites} indice={i}
                            onEditar={(contratante) => setModal({ tipo: 'editar', contratante })}
                            onFaturas={(contratante) => setModal({ tipo: 'faturas', contratante })}
                            onRemover={excluir} />
                    ))}
                </div>
            )}

            {modal?.tipo === 'editar' && <ContratanteModal contratante={modal.contratante} servidores={servidores} sites={sites} onSalvo={substituir} onClose={() => setModal(null)} />}
            {modal?.tipo === 'faturas' && <FaturasModal contratante={modal.contratante} onClose={() => setModal(null)} />}
            {modal?.tipo === 'recebimentos' && <RecebimentosModal recebimentos={recebimentos} onMudou={setRecebimentos} onClose={() => setModal(null)} />}
        </div>
    )
}

export default Contratantes
