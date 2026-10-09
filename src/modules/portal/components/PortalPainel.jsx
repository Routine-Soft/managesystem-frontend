import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useIdioma } from '@/i18n/useIdioma'
import { diasAte, formatarData, formatarMoeda, formatarPct, formatarRelativo } from '@/i18n/formatar'
import BarrasDisponibilidade from '@/components/graficos/BarrasDisponibilidade'
import { IconeAbrir, IconeAtividade, IconeCadeado, IconeCartao, IconeCheck, IconeEmail, IconeEscudo, IconeGlobo, IconeServidor, IconeTelegram } from '@/components/Icones/Icones'
import { TOM_DO_STATUS, minutosLegiveis, tomDosDias } from '@/modules/servidor/servidor.utils'
import { chaveDoStatusDaFatura, tomDaFatura } from '@/modules/contratante/contratante.utils'
import { sessaoDoPortal } from '@/services/portalClient'
import { desconectarTelegram, linkDoTelegram, pagarFatura } from '../portal.api'
import { useResumoDoPortal } from '../portal.hooks'
import PortalLayout from './PortalLayout'

const dataUTC = { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }

function SeloDias({ data }) {
    const { t } = useIdioma()
    const dias = diasAte(data)
    if (dias === null) return null
    return <span className={`badge badge--${tomDosDias(dias)}`}>{dias <= 0 ? t('portal.vencido') : t('portal.faltam', { dias })}</span>
}

// Selos do topo: sistema no ar, proteção e pagamento. Cada um só aparece se houver o que mostrar.
const TOM_DO_INDICADOR = { ok: 'success', atencao: 'warning', fora: 'danger', atrasado: 'danger' }

function Indicadores({ indicadores }) {
    const { t } = useIdioma()
    const selos = [
        ['sistema', IconeAtividade],
        ['seguranca', IconeEscudo],
        ['pagamento', indicadores?.pagamento === 'ok' ? IconeCheck : IconeCartao],
    ].filter(([chave]) => indicadores?.[chave])
    if (!selos.length) return null
    // Cada selo pisca do seu jeito (batimento, brilho no escudo, check pulsando) com ondas de radar em volta do ícone.
    return (
        <ul className="portal-selos">
            {selos.map(([chave, Icone], i) => (
                <li key={chave} className={`portal-selo portal-selo--${chave} portal-selo--${TOM_DO_INDICADOR[indicadores[chave]]}`} style={{ '--i': i }}>
                    <span className="portal-selo__icone" aria-hidden="true"><Icone /></span>
                    <span>{t(`portal.indicadores.${chave}.${indicadores[chave]}`)}</span>
                </li>
            ))}
        </ul>
    )
}

function CartaoServidor({ servidor: s, indice }) {
    const { t, idioma } = useIdioma()
    return (
        <article className="card portal-cartao" style={{ '--i': indice }}>
            <span className="tipo-card">{t('comum.tipoServidor')}</span>
            <header className="portal-cartao__topo">
                <h3><IconeServidor />{s.nome}</h3>
                <span className={`badge badge--${TOM_DO_STATUS[s.status]}${s.status === 'online' ? ' badge--live' : ''}`}>{t(`portal.status.${s.status}`)}</span>
            </header>
            {s.endereco && <p className="texto-pequeno mono">{s.endereco}</p>}

            <div className="portal-disp">
                <span>{t('portal.disponibilidade')}</span>
                <strong className="mono">{formatarPct(s.disponibilidade?.pct, idioma, 2)}</strong>
            </div>
            <BarrasDisponibilidade
                dias={s.disponibilidade?.dias ?? []}
                rotulo={t('portal.disponibilidade')}
                rotuloDoDia={(d) => {
                    const dia = formatarData(`${d.dia}T12:00:00`, idioma, { day: '2-digit', month: 'short' })
                    return `${dia}: ${t(`servidor.estadoDia.${d.estado}`)}`
                }}
            />
            <ul className="linhas">
                <li><span>{t('portal.quedas')}</span><strong className="mono" data-tom={s.quedas30d ? 'danger' : 'success'}>{s.quedas30d ? t('portal.quedasValor', { n: s.quedas30d, tempo: minutosLegiveis(s.minutosFora30d) }) : t('portal.nenhumaQueda')}</strong></li>
                {s.tempoDeResposta !== null && <li><span>{t('portal.resposta')}</span><strong className="mono">{t('portal.ms', { ms: s.tempoDeResposta })}</strong></li>}
                {s.ssl && <li><span>{t('portal.ssl')}</span><span className="portal-linha__valor">{formatarData(s.ssl.expiraEm, idioma)} <SeloDias data={s.ssl.expiraEm} /></span></li>}
            </ul>
            {s.verificadoEm && <p className="texto-pequeno">{t('portal.verificado', { quando: formatarRelativo(s.verificadoEm, idioma) })}</p>}
        </article>
    )
}

function CartaoSite({ site: s, indice }) {
    const { t, idioma } = useIdioma()
    return (
        <article className="card portal-cartao" style={{ '--i': indice }}>
            <span className="tipo-card">{t('comum.tipoDominio')}</span>
            <header className="portal-cartao__topo">
                <h3 className="mono"><IconeGlobo />{s.dominio}</h3>
            </header>

            <section className="portal-secao">
                <div className="portal-secao__linha">
                    <span>{s.dominioExpiraEm ? t('portal.dominioVence', { data: formatarData(s.dominioExpiraEm, idioma) }) : t('portal.dominioSemData')}</span>
                    <SeloDias data={s.dominioExpiraEm} />
                </div>
                <p className="texto-pequeno">
                    {[
                        s.registrador ? t('portal.ondeRenova', { nome: s.registrador }) : null,
                        s.valorRenovacao ? t('portal.valorRenovacao', { valor: formatarMoeda(s.valorRenovacao, s.moedaRenovacao, idioma) }) : null,
                        s.renovacaoAutomatica ? t('portal.renovaSozinho') : null,
                    ].filter(Boolean).join(' · ')}
                </p>
                {s.linkRenovacao && <a className="btn btn--ghost btn--sm" href={s.linkRenovacao} target="_blank" rel="noopener noreferrer"><IconeAbrir />{t('portal.renovarDominio')}</a>}
            </section>

            {s.ssl && (
                <section className="portal-secao">
                    <div className="portal-secao__linha">
                        <span><IconeCadeado /> {t('portal.sslAte', { data: formatarData(s.ssl.expiraEm, idioma) })}</span>
                        <SeloDias data={s.ssl.expiraEm} />
                    </div>
                </section>
            )}

            {s.emails && (
                <section className="portal-secao">
                    <div className="portal-secao__linha">
                        <span><IconeEmail /> {s.emails.provedor ?? t('portal.emails')}</span>
                        {s.emails.vencimento && <SeloDias data={s.emails.vencimento} />}
                    </div>
                    <p className="texto-pequeno">
                        {[
                            s.emails.vencimento ? t('portal.emailsVence', { data: formatarData(s.emails.vencimento, idioma) }) : null,
                            s.emails.caixas ? t('portal.caixas', { n: s.emails.caixas }) : null,
                            s.emails.valor ? `${formatarMoeda(s.emails.valor, s.emails.moeda, idioma)}${t(s.emails.periodicidade === 'mensal' ? 'portal.porMes' : 'portal.porAno')}` : null,
                        ].filter(Boolean).join(' · ')}
                    </p>
                    {s.emails.linkRenovacao && <a className="btn btn--ghost btn--sm" href={s.emails.linkRenovacao} target="_blank" rel="noopener noreferrer"><IconeAbrir />{t('portal.renovarEmails')}</a>}
                </section>
            )}
        </article>
    )
}

function Faturas({ faturas, pagamento }) {
    const { t, idioma } = useIdioma()
    const [abrindo, setAbrindo] = useState(null)
    const [erro, setErro] = useState(null)

    async function pagar(id) {
        setErro(null)
        setAbrindo(id)
        try {
            const { data } = await pagarFatura(id)
            window.location.assign(data.url)
        } catch (e) {
            setErro(e)
            setAbrindo(null)
        }
    }

    return (
        <section className="card portal-bloco" style={{ '--i': 1 }}>
            <h2 className="bloco__titulo">{t('portal.faturas')}</h2>
            {erro && <p className="alert alert--error" role="alert">{erro.message}</p>}
            {faturas.length === 0 ? (
                <p className="texto-suave">{t('portal.semFaturas')}</p>
            ) : (
                <ul className="portal-faturas">
                    {faturas.map((f) => (
                        <li key={f._id} className="portal-fatura">
                            <div className="portal-fatura__info">
                                <strong className="mono">{formatarMoeda(f.total, f.moeda, idioma)}</strong>
                                <span className="texto-pequeno">{f.itens.map((i) => `${i.descricao} ${formatarMoeda(i.valor, f.moeda, idioma)}`).join(' + ')}</span>
                                <span className="texto-pequeno">
                                    {f.status === 'paga' && f.pagaEm ? t('portal.pagaEm', { data: formatarData(f.pagaEm, idioma) }) : t('portal.venceEm', { data: formatarData(f.vencimento, idioma, dataUTC) })}
                                </span>
                            </div>
                            <div className="portal-fatura__lado">
                                <span className={`badge badge--${tomDaFatura(f)}`}>{t(`contratante.faturas.status.${chaveDoStatusDaFatura(f)}`)}</span>
                                {f.status === 'aberta' && pagamento.disponivel && (
                                    <button type="button" className={`btn btn--primary btn--sm${abrindo === f._id ? ' btn--loading' : ''}`} disabled={!!abrindo} onClick={() => pagar(f._id)}>
                                        {abrindo === f._id ? t('portal.abrindo') : t('portal.pagar')}
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            {faturas.some((f) => f.status === 'aberta') && (
                <p className="texto-pequeno">{pagamento.disponivel ? t(pagamento.gateway === 'mercadopago' ? 'portal.pagaComMp' : 'portal.pagaComStripe') : t('portal.pagamentoIndisponivel')}</p>
            )}
        </section>
    )
}

function Telegram({ telegram, onMudou }) {
    const { t } = useIdioma()
    const [link, setLink] = useState(null)
    const [ocupado, setOcupado] = useState(false)
    const [erro, setErro] = useState(null)

    async function executar(acao) {
        setErro(null)
        setOcupado(true)
        try {
            await acao()
        } catch (e) {
            setErro(e)
        } finally {
            setOcupado(false)
        }
    }

    if (!telegram.disponivel) return null

    return (
        <section className="card portal-bloco" style={{ '--i': 2 }}>
            <h2 className="bloco__titulo"><IconeTelegram />{t('portal.telegram.titulo')}</h2>
            <p className="texto-suave">{telegram.conectado ? t('portal.telegram.conectado', { nome: telegram.nome ?? '' }) : t('portal.telegram.explicacao')}</p>
            {erro && <p className="alert alert--error" role="alert">{erro.message}</p>}
            {telegram.conectado ? (
                <button type="button" className="btn btn--ghost btn--sm" disabled={ocupado} onClick={() => executar(async () => { await desconectarTelegram(); onMudou() })}>{t('portal.telegram.desconectar')}</button>
            ) : link ? (
                <a className="btn btn--primary btn--sm" href={link} target="_blank" rel="noopener noreferrer" onClick={() => setTimeout(onMudou, 15000)}><IconeTelegram />{t('portal.telegram.abrir')}</a>
            ) : (
                <button type="button" className={`btn btn--primary btn--sm${ocupado ? ' btn--loading' : ''}`} disabled={ocupado} onClick={() => executar(async () => setLink((await linkDoTelegram()).data.link))}><IconeTelegram />{t('portal.telegram.conectar')}</button>
            )}
        </section>
    )
}

export function PortalPainel() {
    const { t } = useIdioma()
    const ativa = sessaoDoPortal.ativa()
    const { dados, loading, erro, recarregar } = useResumoDoPortal()

    if (!ativa) return <Navigate to="/portal/login" replace />

    return (
        <PortalLayout empresa={dados?.responsavel?.empresa}>
            {loading ? (
                <div className="portal-grade" aria-busy="true">
                    {[0, 1].map((i) => <div key={i} className="card portal-cartao"><div className="skeleton skeleton--line" style={{ width: '50%' }} /><div className="skeleton skeleton--line" /><div className="skeleton skeleton--line" style={{ width: '70%' }} /></div>)}
                </div>
            ) : erro && !dados ? (
                <p className="alert alert--error" role="alert">{erro.message}</p>
            ) : dados && (
                <>
                    <header className="portal-ola">
                        <h1 className="page-title">{t('portal.ola', { nome: dados.contratante.nome })}</h1>
                        <Indicadores indicadores={dados.indicadores} />
                    </header>

                    {/* Celular: uma coluna. Computador: lado a lado, e o que não couber desce para a linha de baixo. */}
                    <div className="portal-grade">
                        {dados.servidores.map((s, i) => <CartaoServidor key={s._id} servidor={s} indice={i} />)}
                        {dados.sites.map((s, i) => <CartaoSite key={s._id} site={s} indice={i + dados.servidores.length} />)}
                        <Faturas faturas={dados.faturas} pagamento={dados.pagamento} />
                        <Telegram telegram={dados.telegram} onMudou={recarregar} />
                    </div>

                    <p className="portal-contato texto-pequeno">
                        {t('portal.duvidas', { empresa: dados.responsavel.empresa })}
                        {dados.responsavel.email && <> <a className="link" href={`mailto:${dados.responsavel.email}`}>{dados.responsavel.email}</a></>}
                        {dados.responsavel.telefone && <> · {dados.responsavel.telefone}</>}
                    </p>
                </>
            )}
        </PortalLayout>
    )
}

export default PortalPainel
