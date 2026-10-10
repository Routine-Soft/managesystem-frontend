import { useState } from 'react'
import { useIdioma } from '@/i18n/useIdioma'
import { formatarData, formatarMoeda } from '@/i18n/formatar'
import { Link } from 'react-router-dom'
import { IconeAbrir, IconeCartao } from '@/components/Icones/Icones'
import '@/components/ExcluirInline/ExcluirInline.css'
import './assinatura.css'

const TOM_DO_STATUS = { trial: 'info', pendente: 'warning', ativa: 'success', inadimplente: 'danger', cancelada: 'muted', expirada: 'muted' }
const PULSA = ['trial', 'pendente', 'ativa']
const DIA_MS = 24 * 60 * 60 * 1000

function progressoDoTeste(assinatura) {
    const inicio = new Date(assinatura.dataInicio).getTime()
    const fim = new Date(assinatura.dataFimTrial).getTime()
    const agora = Date.now()
    const pct = Math.min(100, Math.max(0, ((agora - inicio) / Math.max(fim - inicio, 1)) * 100))
    return { pct: Math.round(pct), dias: Math.max(0, Math.ceil((fim - agora) / DIA_MS)) }
}

// Cartão "Minha assinatura" (mesmo modelo do SoftwareClinic): situação, plano, prazo do teste e as ações possíveis.
// comLinkDosPlanos: usado em "Minha conta", leva para a página de assinatura.
export function MinhaAssinatura({ assinatura, carregando, onVerificar, onCancelar, onGerenciarStripe, comLinkDosPlanos = false }) {
    const { t, idioma } = useIdioma()
    const [confirmando, setConfirmando] = useState(false)
    const [ocupado, setOcupado] = useState(null)
    const [erro, setErro] = useState(null)

    async function executar(chave, acao) {
        setErro(null)
        setOcupado(chave)
        try {
            await acao()
            setConfirmando(false)
        } catch (e) {
            setErro(e)
        } finally {
            setOcupado(null)
        }
    }

    if (carregando || !assinatura) {
        return (
            <section className="card assinatura-card" aria-busy="true">
                <div className="assinatura-card__head">
                    <div className="skeleton assinatura-card__icon-skeleton" />
                    <div className="assinatura-card__titulos"><div className="skeleton skeleton--line" style={{ width: '45%' }} /></div>
                </div>
                <div className="skeleton skeleton--line" style={{ width: '60%', height: 28 }} />
                <div className="skeleton skeleton--line" style={{ width: '90%' }} />
            </section>
        )
    }

    const { status, cobranca } = assinatura
    const plano = assinatura.planoId
    const porPix = cobranca === 'pix'
    const noCartaoMp = cobranca === 'recorrente'
    const noStripe = cobranca === 'stripe' && !!assinatura.stripeSubscriptionId
    const teste = status === 'trial' && assinatura.dataFimTrial ? progressoDoTeste(assinatura) : null
    const acessoAte = assinatura.acesso?.liberado ? assinatura.acesso.ate : null
    // Pendente no cartão do Mercado Pago = nada pago ainda: cancelar é desistir e voltar ao teste.
    const desistindo = status === 'pendente'
    const podeCancelarMp = noCartaoMp && ['ativa', 'inadimplente', 'pendente'].includes(status)

    let mensagem = t(`assinatura.minha.mensagem.${status}`)
    if (status === 'ativa' && porPix) mensagem = t('assinatura.minha.mensagemPix', { data: formatarData(assinatura.proximaCobranca, idioma) })
    if (status === 'cancelada' && acessoAte) mensagem = t('assinatura.minha.mensagemCanceladaAte', { data: formatarData(acessoAte, idioma) })

    return (
        <section className="card assinatura-card" data-status={status}>
            <header className="assinatura-card__head">
                <div className="assinatura-card__icon"><IconeCartao /></div>
                <div className="assinatura-card__titulos">
                    <h2 className="assinatura-card__titulo">{t('assinatura.minha.titulo')}</h2>
                    <span className={`badge badge--${TOM_DO_STATUS[status] ?? 'info'}${PULSA.includes(status) ? ' badge--live' : ''}`}>{t(`assinatura.status.${status}`)}</span>
                </div>
            </header>

            <div className="assinatura-card__plano">
                <span className="assinatura-card__plano-rotulo">{t('assinatura.minha.plano')}</span>
                <p className="assinatura-card__plano-nome">
                    {plano?.nome ?? '—'}
                    {plano?.precoUSD > 0 && <small>{formatarMoeda(plano.precoUSD, 'USD', idioma)}{t('assinatura.porMes')}</small>}
                </p>
            </div>

            {teste && (
                <div className="assinatura-card__trial">
                    <div className="assinatura-card__trial-linha">
                        <span>{teste.dias === 0 ? t('assinatura.minha.terminaHoje') : t('assinatura.minha.faltamDias', { dias: teste.dias })}</span>
                        <span>{t('assinatura.minha.ate', { data: formatarData(assinatura.dataFimTrial, idioma) })}</span>
                    </div>
                    <div className="assinatura-card__barra" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={teste.pct} aria-label={t('assinatura.minha.progressoTeste')}>
                        <span className="assinatura-card__barra-fill" style={{ '--pct': `${teste.pct}%` }} />
                    </div>
                </div>
            )}

            <dl className="assinatura-card__info">
                {assinatura.dataInicio && (
                    <div>
                        <dt>{status === 'trial' ? t('assinatura.minha.testeDesde') : t('assinatura.minha.desde')}</dt>
                        <dd>{formatarData(assinatura.dataInicio, idioma)}</dd>
                    </div>
                )}
                {status === 'ativa' && assinatura.proximaCobranca && (
                    <div>
                        <dt>{porPix ? t('assinatura.minha.acessoAte') : t('assinatura.minha.proximaCobranca')}</dt>
                        <dd>{formatarData(assinatura.proximaCobranca, idioma)}</dd>
                    </div>
                )}
                {['ativa', 'inadimplente', 'cancelada'].includes(status) && (
                    <div>
                        <dt>{t('assinatura.minha.formaDePagamento')}</dt>
                        <dd>{t(`assinatura.cobranca.${cobranca}`)}</dd>
                    </div>
                )}
            </dl>

            {mensagem && <p className="assinatura-card__mensagem">{mensagem}</p>}
            {erro && <p className="alert alert--error" role="alert">{erro.message}</p>}

            {status === 'pendente' && (
                <div className="assinatura-card__acoes">
                    <button type="button" className={`btn btn--primary btn--block assinatura-card__cta${ocupado === 'verificar' ? ' btn--loading' : ''}`} disabled={!!ocupado} onClick={() => executar('verificar', onVerificar)}>
                        {ocupado === 'verificar' ? t('assinatura.minha.verificando') : t('assinatura.minha.jaPaguei')}
                    </button>
                </div>
            )}

            {noStripe && ['ativa', 'inadimplente', 'cancelada'].includes(status) && (
                <button type="button" className={`btn btn--ghost btn--block${ocupado === 'stripe' ? ' btn--loading' : ''}`} disabled={!!ocupado} onClick={() => executar('stripe', onGerenciarStripe)} title={t('assinatura.gerenciarDica')}>
                    <IconeAbrir />{t('assinatura.gerenciar')}
                </button>
            )}

            {podeCancelarMp && (confirmando ? (
                <div className="assinatura-card__confirmar" role="alertdialog" aria-label={t('assinatura.minha.confirmarCancelamento')}>
                    <p>
                        {desistindo
                            ? t('assinatura.minha.confirmaDesistir')
                            : assinatura.proximaCobranca
                                ? t('assinatura.minha.confirmaCancelarAte', { data: formatarData(assinatura.proximaCobranca, idioma) })
                                : t('assinatura.minha.confirmaCancelar')}
                    </p>
                    <div className="assinatura-card__acoes assinatura-card__acoes--linha">
                        <button type="button" className="btn btn--ghost btn--sm" disabled={!!ocupado} onClick={() => setConfirmando(false)}>
                            {desistindo ? t('assinatura.minha.continuarAguardando') : t('assinatura.minha.manter')}
                        </button>
                        <button type="button" className={`btn btn--danger btn--sm${ocupado === 'cancelar' ? ' btn--loading' : ''}`} disabled={!!ocupado} onClick={() => executar('cancelar', onCancelar)}>
                            {desistindo ? t('assinatura.minha.simDesistir') : t('assinatura.minha.simCancelar')}
                        </button>
                    </div>
                </div>
            ) : (
                <button type="button" className="assinatura-card__cancelar" onClick={() => setConfirmando(true)}>
                    {desistindo ? t('assinatura.minha.desistir') : t('assinatura.cancelar')}
                </button>
            ))}
            {comLinkDosPlanos && (
                <Link to="/assinatura" className="btn btn--primary btn--block assinatura-card__cta">
                    {['trial', 'expirada', 'cancelada'].includes(status) ? t('assinatura.minha.verPlanos') : t('assinatura.minha.verAssinatura')}
                </Link>
            )}
        </section>
    )
}

export default MinhaAssinatura
