import { useState } from 'react'
import { useIdioma } from '@/i18n/useIdioma'
import { formatarData, formatarMoeda } from '@/i18n/formatar'
import { IconeCartao, IconeCheck, IconePix } from '@/components/Icones/Icones'
import { useAssinatura } from '../assinatura.hooks'
import { precoEmReais } from '../assinatura.utils'
import MinhaAssinatura from './MinhaAssinatura'
import PixModal from './PixModal'
import './assinaturas-planos.css'
import './assinatura.css'

// Selo do plano atual conforme a situação da assinatura.
const SELO_DO_PLANO_ATUAL = {
    trial: 'info', ativa: 'success', pendente: 'warning', inadimplente: 'danger', cancelada: 'muted', expirada: 'muted',
}

// Grátis primeiro, depois os pagos do mais barato ao mais caro.
function ordenarPlanos(planos) {
    return [...planos].sort((a, b) => (a.tipo !== b.tipo ? (a.tipo === 'gratis' ? -1 : 1) : a.precoUSD - b.precoUSD))
}

function Beneficios({ plano, gateway, t }) {
    const limite = (n, um, varios, ilimitado) => (n ? t(n === 1 ? um : varios, { n }) : t(ilimitado))
    const itens = plano.tipo === 'gratis'
        ? [t('assinatura.pagina.gratisItens.acesso', { dias: plano.duracaoDiasTrial ?? 15 }), t('assinatura.pagina.gratisItens.semCartao'), limite(plano.limiteServidores, 'assinatura.pagina.umServidor', 'assinatura.limiteServidores', 'assinatura.servidoresIlimitados'), limite(plano.limiteSites, 'assinatura.pagina.umSite', 'assinatura.limiteSites', 'assinatura.sitesIlimitados')]
        : [
            limite(plano.limiteServidores, 'assinatura.pagina.umServidor', 'assinatura.limiteServidores', 'assinatura.servidoresIlimitados'),
            limite(plano.limiteSites, 'assinatura.pagina.umSite', 'assinatura.limiteSites', 'assinatura.sitesIlimitados'),
            ...t('assinatura.incluido'),
            ...(gateway === 'mercadopago' ? t('assinatura.pagina.pagamentoBrasil') : t('assinatura.pagina.pagamentoFora')),
        ]
    return (
        <ul className="plano-opcao__lista">
            {itens.map((item) => <li key={item}><IconeCheck />{item}</li>)}
        </ul>
    )
}

function Pagamentos({ pagamentos }) {
    const { t, idioma } = useIdioma()
    return (
        <section className="card assinatura-pagamentos">
            <h2 className="assinatura-pagamentos__titulo">{t('assinatura.pagamentos')}</h2>
            {pagamentos.length === 0 ? (
                <p className="texto-suave">{t('assinatura.semPagamentos')}</p>
            ) : (
                <div className="table-wrap">
                    <table className="table">
                        <tbody>
                            {pagamentos.map((p) => (
                                <tr key={p.id}>
                                    <td className="nowrap">{formatarData(p.aprovadoEm, idioma)}</td>
                                    <td>{p.plano ?? '—'}</td>
                                    <td>{t(`assinatura.metodo.${p.metodo}`)}</td>
                                    <td className="table__num">{formatarMoeda(p.valor, p.moeda, idioma)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    )
}

export function AssinaturaPage() {
    const { t, idioma } = useIdioma()
    const { assinatura, planos, pagamentos, loading, erro, aplicarAssinatura, irParaCheckout, irParaPortal, cancelarCartao, verificarPagamento } = useAssinatura({ comPagamentos: true })
    const [abrindo, setAbrindo] = useState(null)
    const [erroAcao, setErroAcao] = useState(null)
    const [pix, setPix] = useState(null)

    const formas = assinatura?.formasDePagamento ?? {}
    const brasil = formas.pais === 'BR'
    const status = assinatura?.status
    const ativa = status === 'ativa'
    const ativaPorPix = ativa && assinatura?.cobranca === 'pix'
    const ativaNoCartao = (ativa && ['recorrente', 'stripe'].includes(assinatura?.cobranca)) || (status === 'inadimplente' && assinatura?.cobranca === 'stripe')
    const aguardandoCartao = status === 'pendente'
    const listaDePlanos = ordenarPlanos(planos.filter((p) => p.ativo))
    const semFormaDePagamento = !loading && !formas.cartao && !formas.cartaoMercadoPago && !formas.pix

    async function abrirCheckout(planoId) {
        setErroAcao(null)
        setAbrindo(planoId)
        try {
            await irParaCheckout(planoId)
        } catch (e) {
            setErroAcao(e)
            setAbrindo(null)
        }
    }

    function textoDoBotaoCartao(ehAtual) {
        if (ativaPorPix) return ehAtual ? t('assinatura.passarCartao') : t('assinatura.pagina.indisponivel')
        if (ativa) return ehAtual ? t('assinatura.planoAtual') : t('assinatura.pagina.indisponivel')
        if (ehAtual && status === 'pendente') return t('assinatura.pagina.refazer')
        if (ehAtual && status === 'inadimplente') return t('assinatura.pagina.regularizar')
        return t('assinatura.assinarCartao')
    }

    return (
        <div className="page assinaturas">
            <header className="page-header">
                <div>
                    <h1 className="page-title">{t('assinatura.titulo')}</h1>
                    <p className="page-subtitle">{t('assinatura.pagina.subtitulo')}</p>
                </div>
            </header>

            {erro && <p className="alert alert--error" role="alert">{erro.message}</p>}

            <div className="assinaturas__topo">
                <MinhaAssinatura
                    assinatura={assinatura}
                    carregando={loading}
                    onVerificar={verificarPagamento}
                    onCancelar={cancelarCartao}
                    onGerenciarStripe={irParaPortal}
                />
                {!loading && <Pagamentos pagamentos={pagamentos} />}
            </div>

            <h2 className="assinaturas__secao">{t('assinatura.pagina.planos')}</h2>

            {ativaPorPix && (
                <p className="alert alert--info" role="status">{t('assinatura.pagina.avisoPix', { data: formatarData(assinatura.proximaCobranca, idioma) })}</p>
            )}
            {ativaNoCartao && <p className="alert alert--info" role="status">{t('assinatura.pagina.avisoTrocar')}</p>}
            {aguardandoCartao && <p className="alert alert--info" role="status">{t('assinatura.pagina.avisoPendente')}</p>}
            {semFormaDePagamento && <p className="alert alert--warning">{t('assinatura.pagina.semPagamento')}</p>}
            {erroAcao && <p className="alert alert--error" role="alert">{erroAcao.message}</p>}

            {loading ? (
                <div className="assinaturas__grade" aria-busy="true">
                    {[0, 1].map((i) => (
                        <div key={i} className="card plano-opcao" style={{ '--i': i }}>
                            <div className="skeleton skeleton--line" style={{ width: '50%' }} />
                            <div className="skeleton skeleton--line" style={{ width: '70%', height: 36 }} />
                            <div className="skeleton skeleton--line" style={{ width: '100%', height: 44 }} />
                        </div>
                    ))}
                </div>
            ) : listaDePlanos.length === 0 ? (
                <p className="alert alert--info">{t('assinatura.nenhumPlano')}</p>
            ) : (
                <div className="assinaturas__grade">
                    {listaDePlanos.map((plano, i) => {
                        const gratuito = plano.tipo === 'gratis'
                        const ehAtual = String(assinatura?.planoId?._id) === String(plano._id)
                        const emReais = brasil ? precoEmReais(plano.precoUSD, formas.cotacaoUSD) : null
                        const temCartao = formas.cartaoMercadoPago || (formas.cartao && !!plano.stripePriceId)
                        // Quem paga por Pix pode passar o plano atual para o cartão (a cobrança só começa quando o Pix vence).
                        const cartaoDesabilitado = !!abrindo || (ativa && !(ativaPorPix && ehAtual && formas.cartaoMercadoPago)) || (status === 'inadimplente' && assinatura?.cobranca === 'stripe')
                        const pixDesabilitado = !!abrindo || ativaNoCartao || aguardandoCartao || (ativaPorPix && !ehAtual)
                        const renovando = ativaPorPix && ehAtual
                        return (
                            <article key={plano._id} className="card plano-opcao" data-atual={ehAtual || undefined} data-tipo={plano.tipo} style={{ '--i': i }}>
                                <header className="plano-opcao__topo">
                                    <h3 className="plano-opcao__nome">{plano.nome}</h3>
                                    {ehAtual && <span className={`badge badge--${SELO_DO_PLANO_ATUAL[status] ?? 'info'}`}>{t('assinatura.planoAtual')}</span>}
                                </header>
                                {plano.descricao && <p className="plano-opcao__descricao">{plano.descricao}</p>}

                                <div className="plano-opcao__valores">
                                    <p className="plano-opcao__preco">
                                        {gratuito ? (
                                            <>
                                                <strong>{t('assinatura.pagina.gratis')}</strong>
                                                <span>{t('assinatura.pagina.porDias', { dias: plano.duracaoDiasTrial ?? 15 })}</span>
                                            </>
                                        ) : (
                                            <>
                                                <strong>{formatarMoeda(plano.precoUSD, 'USD', idioma)}</strong>
                                                <span>{t('assinatura.porMes')}</span>
                                            </>
                                        )}
                                    </p>
                                    {!gratuito && emReais && <p className="plano-opcao__reais">{t('assinatura.pagina.emReais', { valor: formatarMoeda(emReais, 'BRL', idioma) })}</p>}
                                </div>

                                <Beneficios plano={plano} gateway={brasil ? 'mercadopago' : 'stripe'} t={t} />

                                {!gratuito && (temCartao || formas.pix) && (
                                    <div className="plano-opcao__acoes">
                                        {temCartao && (
                                            <button type="button" className={`btn ${ehAtual && ativa && !ativaPorPix ? 'btn--ghost' : 'btn--primary'} btn--block plano-opcao__cta${abrindo === plano._id ? ' btn--loading' : ''}`}
                                                disabled={cartaoDesabilitado} onClick={() => abrirCheckout(plano._id)}>
                                                <IconeCartao />
                                                {abrindo === plano._id ? t('assinatura.pagina.redirecionando') : textoDoBotaoCartao(ehAtual)}
                                            </button>
                                        )}
                                        {formas.pix && (
                                            <button type="button" className={`btn ${renovando ? 'btn--primary' : 'btn--ghost'} btn--block plano-opcao__pix`} disabled={pixDesabilitado} onClick={() => setPix(plano)}>
                                                <IconePix />
                                                {renovando ? t('assinatura.renovarPix') : t('assinatura.pagarPix')}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </article>
                        )
                    })}
                </div>
            )}

            {pix && <PixModal plano={pix} cotacao={formas.cotacaoUSD} onPago={aplicarAssinatura} onClose={() => setPix(null)} />}
        </div>
    )
}

export default AssinaturaPage
